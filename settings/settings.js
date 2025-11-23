/**
 * EntityScholar Settings Page Script
 * Uses encrypted storage for API keys via crypto-utils.js
 */

// Import crypto utilities
const cryptoUtilsScript = document.createElement('script');
cryptoUtilsScript.src = '../scripts/crypto-utils.js';
document.head.appendChild(cryptoUtilsScript);

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const testApiBtn = document.getElementById('testApiBtn');
const apiTestResult = document.getElementById('apiTestResult');
const autoScanEnabled = document.getElementById('autoScanEnabled');
const cacheDuration = document.getElementById('cacheDuration');
const scanDelay = document.getElementById('scanDelay');
const showNotifications = document.getElementById('showNotifications');
const showBadge = document.getElementById('showBadge');
const excludedSites = document.getElementById('excludedSites');
const totalScans = document.getElementById('totalScans');
const totalEntities = document.getElementById('totalEntities');
const avgEntities = document.getElementById('avgEntities');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

/**
 * Load settings on page load
 */
async function loadSettings() {
  try {
    // Load from sync storage
    const syncSettings = await chrome.storage.sync.get([
      'apiKeySet',
      'autoScanEnabled',
      'cacheDuration',
      'scanDelay',
      'showNotifications',
      'showBadge',
      'excludedSites'
    ]);

    // Show placeholder if API key is set (don't show actual encrypted key)
    if (syncSettings.apiKeySet) {
      apiKeyInput.placeholder = '••••••••••••••••••••••••••••';
      apiKeyInput.value = '';
    }

    autoScanEnabled.checked = syncSettings.autoScanEnabled || false;
    cacheDuration.value = syncSettings.cacheDuration || 5;
    scanDelay.value = syncSettings.scanDelay || 500;
    showNotifications.checked = syncSettings.showNotifications || false;
    showBadge.checked = syncSettings.showBadge !== false; // Default true

    if (syncSettings.excludedSites) {
      excludedSites.value = syncSettings.excludedSites.join('\n');
    }

    // Load statistics
    await loadStatistics();

  } catch (error) {
    console.error('Failed to load settings:', error);
    showToast('Failed to load settings', 'error');
  }
}

/**
 * Save settings
 */
async function saveSettings() {
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const apiKey = apiKeyInput.value.trim();

    // Only save API key if it's been changed (not empty and not placeholder)
    if (apiKey && apiKey !== '••••••••••••••••••••••••••••') {
      // Encrypt and store API key
      await securelyStoreApiKey(apiKey);
      apiKeyInput.value = '';
      apiKeyInput.placeholder = '••••••••••••••••••••••••••••';
    }

    // Check if API key is set
    const isKeySet = await isApiKeySet();
    if (!isKeySet) {
      showToast('API key is required', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
      return;
    }

    // Parse excluded sites
    const excludedSitesList = excludedSites.value
      .split('\n')
      .map(site => site.trim())
      .filter(site => site.length > 0);

    // Save other settings to sync storage
    await chrome.storage.sync.set({
      autoScanEnabled: autoScanEnabled.checked,
      cacheDuration: parseInt(cacheDuration.value, 10),
      scanDelay: parseInt(scanDelay.value, 10),
      showNotifications: showNotifications.checked,
      showBadge: showBadge.checked,
      excludedSites: excludedSitesList
    });

    showToast('Settings saved successfully (API key encrypted)', 'success');
    saveStatus.textContent = 'Saved';
    saveStatus.className = 'save-status success';

    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.className = 'save-status';
    }, 3000);

  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Failed to save settings', 'error');
    saveStatus.textContent = 'Save failed';
    saveStatus.className = 'save-status error';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  }
}

/**
 * Test API connection
 * Uses service worker to avoid CORS issues
 */
async function testApiConnection() {
  try {
    testApiBtn.disabled = true;
    testApiBtn.textContent = 'Testing...';
    apiTestResult.textContent = 'Testing connection...';
    apiTestResult.className = 'api-test-result';

    // Get API key - either from input or from encrypted storage
    let apiKey = apiKeyInput.value.trim();

    if (!apiKey || apiKey === '••••••••••••••••••••••••••••') {
      // Try to get from encrypted storage
      apiKey = await getDecryptedApiKey();
      if (!apiKey) {
        apiTestResult.textContent = 'Please enter an API key first';
        apiTestResult.className = 'api-test-result error';
        return;
      }
    }

    // Send message to service worker to test the API
    // This avoids CORS issues that occur when calling from extension pages
    chrome.runtime.sendMessage(
      {
        action: 'testApiConnection',
        apiKey: apiKey
      },
      (response) => {
        if (chrome.runtime.lastError) {
          apiTestResult.textContent = `✗ Connection failed: ${chrome.runtime.lastError.message}`;
          apiTestResult.className = 'api-test-result error';
          return;
        }

        if (response.success) {
          apiTestResult.textContent = `✓ ${response.message}`;
          apiTestResult.className = 'api-test-result success';
        } else {
          apiTestResult.textContent = `✗ API test failed: ${response.error}`;
          apiTestResult.className = 'api-test-result error';
        }
      }
    );

  } catch (error) {
    apiTestResult.textContent = `✗ Connection failed: ${error.message}`;
    apiTestResult.className = 'api-test-result error';
  } finally {
    testApiBtn.disabled = false;
    testApiBtn.textContent = 'Test API Connection';
  }
}

/**
 * Load usage statistics
 */
async function loadStatistics() {
  try {
    const data = await chrome.storage.local.get(['scan_history']);
    const scanHistory = data.scan_history || [];

    const scans = scanHistory.length;
    const entities = scanHistory.reduce((sum, scan) => sum + (scan.entityCount || 0), 0);
    const avg = scans > 0 ? Math.round(entities / scans) : 0;

    totalScans.textContent = scans;
    totalEntities.textContent = entities;
    avgEntities.textContent = avg;

  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
}

/**
 * Clear scan history
 */
async function clearHistory() {
  if (!confirm('Are you sure you want to clear all scan history? This cannot be undone.')) {
    return;
  }

  try {
    await chrome.storage.local.remove(['scan_history', 'current_page_entities']);

    totalScans.textContent = '0';
    totalEntities.textContent = '0';
    avgEntities.textContent = '0';

    showToast('Scan history cleared', 'success');

  } catch (error) {
    console.error('Failed to clear history:', error);
    showToast('Failed to clear history', 'error');
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Auto-save when form fields change
 */
function setupAutoSave() {
  const formFields = [
    autoScanEnabled,
    cacheDuration,
    scanDelay,
    showNotifications,
    showBadge
  ];

  formFields.forEach(field => {
    field.addEventListener('change', () => {
      saveStatus.textContent = 'Unsaved changes';
      saveStatus.className = 'save-status';
    });
  });

  [apiKeyInput, excludedSites].forEach(field => {
    field.addEventListener('input', () => {
      saveStatus.textContent = 'Unsaved changes';
      saveStatus.className = 'save-status';
    });
  });
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  // Ctrl+S or Cmd+S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSettings();
  }
});

// Event Listeners
saveBtn.addEventListener('click', saveSettings);
testApiBtn.addEventListener('click', testApiConnection);
clearHistoryBtn.addEventListener('click', clearHistory);

// Initialize
loadSettings();
setupAutoSave();
