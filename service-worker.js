/**
 * EntityScholar Service Worker (Manifest V3)
 * Handles message passing, auto-scan, and entity extraction
 */

// Configuration
let autoScanEnabled = false;
let activeTabId = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SCAN_DELAY = 500; // 500ms after page load

// Initialize settings from storage
chrome.storage.sync.get(['autoScanEnabled', 'apiKey'], (result) => {
  autoScanEnabled = result.autoScanEnabled || false;
  if (result.apiKey) {
    console.log('API key loaded');
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.autoScanEnabled) {
    autoScanEnabled = changes.autoScanEnabled.newValue;
    console.log('Auto-scan:', autoScanEnabled ? 'enabled' : 'disabled');
  }
});

/**
 * Message handler for popup and content script communication
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanCurrentTab") {
    handleScanRequest(request.tabId, sendResponse);
    return true; // Keep message channel open for async response
  }

  if (request.action === "getStoredEntities") {
    getStoredEntities(request.url, sendResponse);
    return true;
  }

  if (request.action === "searchEdu") {
    searchEduSites(request.entity, sendResponse);
    return true;
  }
});

/**
 * Tab activation listener (for auto-scan)
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
  if (autoScanEnabled) {
    setTimeout(() => scanTab(activeTabId), SCAN_DELAY);
  }
});

/**
 * Tab update listener (for auto-scan on page load)
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (autoScanEnabled &&
      changeInfo.status === 'complete' &&
      tabId === activeTabId) {
    setTimeout(() => scanTab(tabId), SCAN_DELAY);
  }
});

/**
 * Keyboard shortcut handler
 */
chrome.commands.onCommand.addListener((command) => {
  if (command === "scan-page") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        scanTab(tabs[0].id);
      }
    });
  }
});

/**
 * Handle manual scan request from popup
 */
async function handleScanRequest(tabId, sendResponse) {
  try {
    const tab = await chrome.tabs.get(tabId);

    // Validate URL
    if (!isValidUrl(tab.url)) {
      sendResponse({
        success: false,
        error: 'Cannot scan this page type (browser pages, PDFs, etc.)'
      });
      return;
    }

    // Update badge to show scanning
    updateBadge(tabId, 'scanning');

    // Extract page text using content script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractPageText
    });

    if (chrome.runtime.lastError || !results || !results[0]) {
      throw new Error('Failed to extract page text');
    }

    const pageText = results[0].result;

    if (!pageText || pageText.trim().length < 50) {
      sendResponse({
        success: false,
        error: 'No text content detected on this page'
      });
      updateBadge(tabId, 'error');
      return;
    }

    // Analyze entities
    const entities = await analyzeEntities(pageText);

    // Store results
    await storeEntities(tab.url, tab.title, entities);

    // Update badge with count
    updateBadge(tabId, 'success', entities.length);

    // Send to popup if open
    chrome.runtime.sendMessage({
      action: "entitiesReady",
      entities: entities,
      pageUrl: tab.url,
      pageTitle: tab.title
    }).catch(() => {
      // Popup might be closed, that's ok
    });

    sendResponse({
      success: true,
      entityCount: entities.length,
      entities: entities
    });

  } catch (error) {
    console.error('Scan failed:', error);
    updateBadge(tabId, 'error');
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Auto-scan a tab (with caching)
 */
async function scanTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);

    // Skip invalid URLs
    if (!isValidUrl(tab.url)) return;

    // Check if URL is in exclusion list
    const settings = await chrome.storage.sync.get(['excludedSites']);
    if (isExcluded(tab.url, settings.excludedSites || [])) {
      return;
    }

    // Check cache
    const cached = await chrome.storage.local.get(['current_page_entities']);
    if (cached.current_page_entities &&
        cached.current_page_entities.url === tab.url &&
        Date.now() - cached.current_page_entities.timestamp < CACHE_DURATION) {
      // Use cached results
      updateBadge(tabId, 'success', cached.current_page_entities.entities.length);
      return;
    }

    // Perform scan
    updateBadge(tabId, 'scanning');

    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractPageText
    });

    if (!results || !results[0]) return;

    const pageText = results[0].result;
    if (!pageText || pageText.trim().length < 50) return;

    const entities = await analyzeEntities(pageText);
    await storeEntities(tab.url, tab.title, entities);

    updateBadge(tabId, 'success', entities.length);

    // Show notification if enabled
    const notifSettings = await chrome.storage.sync.get(['showNotifications']);
    if (notifSettings.showNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'EntityScholar',
        message: `Found ${entities.length} entities on ${tab.title || 'this page'}`
      });
    }

  } catch (error) {
    console.error('Auto-scan failed:', error);
    updateBadge(tabId, 'error');
  }
}

/**
 * Content script function: Extract text from page
 * This function is injected into the page context
 */
function extractPageText() {
  // Remove unwanted elements
  const excludeSelectors = 'script, style, nav, footer, aside, .ad, .ads, #comments, [role="complementary"], [role="navigation"]';
  const clone = document.body.cloneNode(true);

  // Remove excluded elements from clone
  clone.querySelectorAll(excludeSelectors).forEach(el => el.remove());

  // Try to get main content first
  const mainContent =
    clone.querySelector('main') ||
    clone.querySelector('article') ||
    clone.querySelector('[role="main"]') ||
    clone.querySelector('.content') ||
    clone.querySelector('#content') ||
    clone;

  // Extract text
  let text = mainContent.innerText || mainContent.textContent || '';

  // Clean text
  text = text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\n+/g, '\n')          // Normalize newlines
    .trim()
    .substring(0, 10000);           // Limit to first 10,000 chars

  return text;
}

/**
 * Analyze entities using Google Cloud NLP API
 */
async function analyzeEntities(text) {
  try {
    const settings = await chrome.storage.sync.get(['apiKey']);

    if (!settings.apiKey) {
      throw new Error('Google Cloud API key not configured. Please add it in settings.');
    }

    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeEntities?key=${settings.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content: text
          },
          encodingType: 'UTF8'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();

    // Process and rank entities
    const entities = (data.entities || [])
      .filter(entity => entity.salience > 0.01) // Filter low salience
      .sort((a, b) => b.salience - a.salience)  // Sort by salience
      .slice(0, 5)                              // Top 5
      .map(entity => ({
        name: entity.name,
        type: entity.type,
        salience: entity.salience,
        metadata: entity.metadata || {},
        mentions: entity.mentions?.length || 0
      }));

    return entities;

  } catch (error) {
    console.error('Entity analysis failed:', error);
    throw error;
  }
}

/**
 * Store entities in local storage
 */
async function storeEntities(url, title, entities) {
  await chrome.storage.local.set({
    current_page_entities: {
      url: url,
      title: title,
      timestamp: Date.now(),
      entities: entities
    }
  });

  // Also add to history
  const history = await chrome.storage.local.get(['scan_history']);
  const scanHistory = history.scan_history || [];

  scanHistory.unshift({
    url: url,
    title: title,
    timestamp: Date.now(),
    entityCount: entities.length
  });

  // Keep last 50 scans
  await chrome.storage.local.set({
    scan_history: scanHistory.slice(0, 50)
  });
}

/**
 * Get stored entities for a URL
 */
async function getStoredEntities(url, sendResponse) {
  const data = await chrome.storage.local.get(['current_page_entities']);

  if (data.current_page_entities && data.current_page_entities.url === url) {
    sendResponse({
      success: true,
      entities: data.current_page_entities.entities,
      timestamp: data.current_page_entities.timestamp
    });
  } else {
    sendResponse({ success: false });
  }
}

/**
 * Search .edu sites for an entity
 */
async function searchEduSites(entity, sendResponse) {
  try {
    // Use Google Custom Search API or scrape search results
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(entity)}+site:.edu`;

    // For now, just return the search URL
    // In production, you'd use Google Custom Search API
    sendResponse({
      success: true,
      searchUrl: searchUrl,
      entity: entity
    });

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Update extension badge
 */
function updateBadge(tabId, state, count = 0) {
  const badges = {
    scanning: { text: '...', color: '#9E9E9E' },
    success: { text: count > 0 ? count.toString() : '', color: '#1a73e8' },
    error: { text: '!', color: '#d93025' }
  };

  const badge = badges[state] || badges.success;

  chrome.action.setBadgeText({ tabId, text: badge.text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: badge.color });
}

/**
 * Validate URL for scanning
 */
function isValidUrl(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Check if URL is in exclusion list
 */
function isExcluded(url, excludedSites) {
  if (!excludedSites || excludedSites.length === 0) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    return excludedSites.some(site => {
      const pattern = site.trim().toLowerCase();
      return hostname.includes(pattern) || hostname.endsWith(pattern);
    });
  } catch {
    return false;
  }
}

console.log('EntityScholar service worker initialized');
