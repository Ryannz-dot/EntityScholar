/**
 * Encryption Utilities for EntityScholar
 * Provides secure encryption/decryption for API keys using Web Crypto API
 */

/**
 * Generate encryption key from Chrome profile
 * Uses a combination of browser-specific identifiers to create a unique key
 */
async function generateEncryptionKey() {
  // Create a deterministic key based on extension ID and install time
  const extensionId = chrome.runtime.id;

  // Get or create installation salt
  let installData = await chrome.storage.local.get(['installSalt', 'installTime']);

  if (!installData.installSalt) {
    // Generate random salt on first install
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    installData.installSalt = Array.from(saltArray);
    installData.installTime = Date.now();
    await chrome.storage.local.set(installData);
  }

  const salt = new Uint8Array(installData.installSalt);
  const keyMaterial = extensionId + installData.installTime.toString();

  // Import key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyMaterial),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive encryption key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypt API key
 * @param {string} apiKey - Plain text API key
 * @returns {Promise<string>} Base64 encoded encrypted data
 */
async function encryptApiKey(apiKey) {
  try {
    const key = await generateEncryptionKey();

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the API key
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      new TextEncoder().encode(apiKey)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt API key
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {Promise<string>} Decrypted API key
 */
async function decryptApiKey(encryptedData) {
  try {
    const key = await generateEncryptionKey();

    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Securely store API key
 * @param {string} apiKey - Plain text API key to store
 */
async function securelyStoreApiKey(apiKey) {
  const encrypted = await encryptApiKey(apiKey);
  await chrome.storage.sync.set({
    encryptedApiKey: encrypted,
    apiKeySet: true // Flag to indicate key is set
  });
}

/**
 * Retrieve and decrypt API key
 * @returns {Promise<string|null>} Decrypted API key or null if not set
 */
async function getDecryptedApiKey() {
  try {
    const data = await chrome.storage.sync.get(['encryptedApiKey', 'apiKeySet']);

    if (!data.apiKeySet || !data.encryptedApiKey) {
      return null;
    }

    return await decryptApiKey(data.encryptedApiKey);
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
}

/**
 * Check if API key is set
 * @returns {Promise<boolean>}
 */
async function isApiKeySet() {
  const data = await chrome.storage.sync.get(['apiKeySet']);
  return data.apiKeySet === true;
}

/**
 * Remove stored API key
 */
async function removeApiKey() {
  await chrome.storage.sync.remove(['encryptedApiKey', 'apiKeySet']);
}
