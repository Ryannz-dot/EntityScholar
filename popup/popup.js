/**
 * EntityScholar Popup Script
 * Handles UI interactions and communication with service worker
 */

// DOM Elements
const scanBtn = document.getElementById('scanBtn');
const entitiesSection = document.getElementById('entitiesSection');
const entitiesList = document.getElementById('entitiesList');
const noEntities = document.getElementById('noEntities');
const entityCount = document.getElementById('entityCount');
const scanTimestamp = document.getElementById('scanTimestamp');
const pageTitle = document.getElementById('pageTitle');
const scanStatus = document.getElementById('scanStatus');
const autoScanIndicator = document.getElementById('autoScanIndicator');
const settingsBtn = document.getElementById('settingsBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const errorClose = document.getElementById('errorClose');
const setupPrompt = document.getElementById('setupPrompt');
const setupBtn = document.getElementById('setupBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const entitiesHeader = document.getElementById('entitiesHeader');

let currentTab = null;

/**
 * Initialize popup on load
 */
async function init() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // Update page info
    if (tab.title) {
      pageTitle.textContent = tab.title;
      pageTitle.title = tab.title;
    }

    // Check if API key is configured
    const settings = await chrome.storage.sync.get(['apiKey', 'autoScanEnabled']);

    if (!settings.apiKey) {
      showSetupPrompt();
      return;
    }

    // Update auto-scan indicator
    updateAutoScanIndicator(settings.autoScanEnabled);

    // Try to load cached entities for current page
    await loadCachedEntities(tab.url);

  } catch (error) {
    console.error('Init failed:', error);
    showError('Failed to initialize extension');
  }
}

/**
 * Handle scan button click
 */
scanBtn.addEventListener('click', async () => {
  if (!currentTab) return;

  try {
    // Update button to scanning state
    setScanButtonState('scanning');
    hideError();

    // Send scan request to service worker
    const response = await chrome.runtime.sendMessage({
      action: 'scanCurrentTab',
      tabId: currentTab.id
    });

    if (response.success) {
      // Success state
      setScanButtonState('success', response.entityCount);
      displayEntities(response.entities);

      // Reset button after 2 seconds
      setTimeout(() => {
        setScanButtonState('default');
      }, 2000);
    } else {
      // Error state
      setScanButtonState('error');
      showError(response.error || 'Scan failed. Please try again.');

      // Reset button after 3 seconds
      setTimeout(() => {
        setScanButtonState('default');
      }, 3000);
    }

  } catch (error) {
    console.error('Scan failed:', error);
    setScanButtonState('error');
    showError(error.message || 'An unexpected error occurred');

    setTimeout(() => {
      setScanButtonState('default');
    }, 3000);
  }
});

/**
 * Set scan button state
 */
function setScanButtonState(state, count = 0) {
  // Remove all state classes
  scanBtn.classList.remove('scanning', 'success', 'error');

  switch (state) {
    case 'scanning':
      scanBtn.disabled = true;
      scanBtn.classList.add('scanning');
      scanBtn.innerHTML = '<span class="spinner"></span><span class="btn-text">Scanning...</span>';
      break;

    case 'success':
      scanBtn.disabled = true;
      scanBtn.classList.add('success');
      scanBtn.innerHTML = `<span class="btn-icon">✓</span><span class="btn-text">Found ${count} entities</span>`;
      break;

    case 'error':
      scanBtn.disabled = false;
      scanBtn.classList.add('error');
      scanBtn.innerHTML = '<span class="btn-icon">⚠</span><span class="btn-text">Scan failed - Try again</span>';
      break;

    default: // 'default'
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Scan This Page</span>';
      break;
  }
}

/**
 * Display entities in the list
 */
function displayEntities(entities) {
  if (!entities || entities.length === 0) {
    entitiesList.classList.remove('has-entities');
    noEntities.classList.remove('hidden');
    entitiesHeader.style.display = 'none';
    return;
  }

  // Clear existing entities
  entitiesList.innerHTML = '';

  // Update header
  entityCount.textContent = entities.length;
  scanTimestamp.textContent = 'Just now';
  entitiesHeader.style.display = 'flex';
  noEntities.classList.add('hidden');

  // Create entity cards
  entities.forEach((entity, index) => {
    const card = createEntityCard(entity, index);
    entitiesList.appendChild(card);
  });

  entitiesList.classList.add('has-entities');
}

/**
 * Create an entity card element
 */
function createEntityCard(entity, index) {
  const card = document.createElement('div');
  card.className = 'entity-card';

  const saliencePercent = Math.round(entity.salience * 100);

  card.innerHTML = `
    <div class="entity-header">
      <div class="entity-info">
        <div class="entity-name">${escapeHtml(entity.name)}</div>
        <span class="entity-type">${formatEntityType(entity.type)}</span>
      </div>
      <div class="entity-salience">${saliencePercent}%</div>
    </div>
    <div class="salience-bar">
      <div class="salience-fill" style="width: ${saliencePercent}%"></div>
    </div>
    <div class="entity-actions">
      <button class="entity-btn search-edu-btn" data-entity="${escapeHtml(entity.name)}">
        Search .edu
      </button>
      <button class="entity-btn search-wikipedia-btn" data-entity="${escapeHtml(entity.name)}">
        Wikipedia
      </button>
    </div>
  `;

  // Add event listeners to buttons
  const searchEduBtn = card.querySelector('.search-edu-btn');
  const searchWikipediaBtn = card.querySelector('.search-wikipedia-btn');

  searchEduBtn.addEventListener('click', () => searchEdu(entity.name));
  searchWikipediaBtn.addEventListener('click', () => searchWikipedia(entity.name));

  // Animate salience bar
  setTimeout(() => {
    const fill = card.querySelector('.salience-fill');
    fill.style.width = `${saliencePercent}%`;
  }, 100 * index);

  return card;
}

/**
 * Search .edu sites for entity
 */
async function searchEdu(entityName) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(entityName)}+site:.edu`;
  chrome.tabs.create({ url: searchUrl });
}

/**
 * Search Wikipedia for entity
 */
async function searchWikipedia(entityName) {
  const searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(entityName)}`;
  chrome.tabs.create({ url: searchUrl });
}

/**
 * Load cached entities for current page
 */
async function loadCachedEntities(url) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getStoredEntities',
      url: url
    });

    if (response.success && response.entities) {
      displayEntities(response.entities);

      // Update timestamp
      const timestamp = response.timestamp;
      const timeAgo = getTimeAgo(timestamp);
      scanTimestamp.textContent = `Scanned ${timeAgo}`;
    }
  } catch (error) {
    console.error('Failed to load cached entities:', error);
  }
}

/**
 * Listen for entity updates from service worker
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'entitiesReady') {
    displayEntities(request.entities);
    scanTimestamp.textContent = 'Just now';
    sendResponse({ received: true });
  }
});

/**
 * Update auto-scan indicator
 */
function updateAutoScanIndicator(enabled) {
  if (enabled) {
    autoScanIndicator.textContent = 'Auto-scan: ON';
    autoScanIndicator.classList.add('enabled');
  } else {
    autoScanIndicator.textContent = 'Manual scan mode';
    autoScanIndicator.classList.remove('enabled');
  }
}

/**
 * Show setup prompt
 */
function showSetupPrompt() {
  setupPrompt.classList.add('active');
  scanBtn.disabled = true;
}

/**
 * Show error message
 */
function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.add('active');
}

/**
 * Hide error message
 */
function hideError() {
  errorMessage.classList.remove('active');
}

/**
 * Open settings page
 */
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

/**
 * Setup button click
 */
setupBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

/**
 * Close error message
 */
errorClose.addEventListener('click', hideError);

/**
 * Format entity type for display
 */
function formatEntityType(type) {
  const types = {
    'PERSON': 'Person',
    'LOCATION': 'Location',
    'ORGANIZATION': 'Organization',
    'EVENT': 'Event',
    'WORK_OF_ART': 'Work of Art',
    'CONSUMER_GOOD': 'Product',
    'OTHER': 'Other',
    'UNKNOWN': 'Unknown'
  };
  return types[type] || type;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Listen for storage changes (auto-scan toggle)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.autoScanEnabled) {
    updateAutoScanIndicator(changes.autoScanEnabled.newValue);
  }
});

// Initialize on load
init();
