
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key'; // In production, use environment variables

/**
 * Encrypts a string using AES encryption
 * @param data String to encrypt
 * @returns Encrypted string
 */
export const encrypt = (data: string): string => {
  if (!data) return '';
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

/**
 * Decrypts an encrypted string
 * @param encryptedData Encrypted string
 * @returns Decrypted string
 */
export const decrypt = (encryptedData: string): string => {
  if (!encryptedData) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
};

/**
 * Generates a secure random token
 * @param length Length of token
 * @returns Random token string
 */
export const generateSecureToken = (length: number = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const values = new Uint8Array(length);
  
  // Use crypto.getRandomValues if available (more secure)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      token += charset[values[i] % charset.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      token += charset[randomIndex];
    }
  }
  
  return token;
};

/**
 * Hash a string using SHA-256
 * @param input String to hash
 * @returns Hashed string
 */
export const hashString = (input: string): string => {
  return CryptoJS.SHA256(input).toString();
};

/**
 * Encrypt an object by encrypting specific fields
 * @param data Object to encrypt fields in
 * @param fieldsToEncrypt Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export const encryptFields = <T extends Record<string, any>>(
  data: T, 
  fieldsToEncrypt: string[]
): T => {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined && typeof result[field] === 'string') {
      result[field] = encrypt(result[field]);
    }
  }
  
  return result;
};

/**
 * Decrypt object fields
 * @param data Object with encrypted fields
 * @param fieldsToDecrypt Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export const decryptFields = <T extends Record<string, any>>(
  data: T, 
  fieldsToDecrypt: string[]
): T => {
  const result = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] !== undefined && typeof result[field] === 'string') {
      try {
        result[field] = decrypt(result[field]);
      } catch (e) {
        console.error(`Failed to decrypt field: ${field}`, e);
      }
    }
  }
  
  return result;
};

/**
 * Encrypt sensitive data for storage
 * @param value Data to encrypt
 * @param namespace Optional namespace to organize encrypted data
 * @returns Encrypted data with metadata
 */
export const encryptForStorage = (value: any, namespace?: string): string => {
  try {
    const serialized = JSON.stringify({
      data: value,
      metadata: {
        timestamp: Date.now(),
        namespace: namespace || 'default',
        version: '1.0'
      }
    });
    return encrypt(serialized);
  } catch (e) {
    console.error('Failed to encrypt for storage:', e);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt data from storage
 * @param encryptedValue Encrypted data string
 * @returns Original data with metadata
 */
export const decryptFromStorage = <T>(encryptedValue: string): { data: T; metadata: any } | null => {
  try {
    const decrypted = decrypt(encryptedValue);
    if (!decrypted) return null;
    
    return JSON.parse(decrypted);
  } catch (e) {
    console.error('Failed to decrypt from storage:', e);
    return null;
  }
};

/**
 * Create a secure hash for an API request to prevent tampering
 * @param data Request data
 * @param timestamp Request timestamp
 * @param apiSecret API secret key
 * @returns Request hash
 */
export const createRequestSignature = (
  data: Record<string, any>,
  timestamp: number,
  apiSecret: string
): string => {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(data).sort();
  let dataString = '';
  
  // Build string with sorted keys
  for (const key of sortedKeys) {
    if (typeof data[key] !== 'function' && typeof data[key] !== 'undefined') {
      dataString += `${key}=${JSON.stringify(data[key])}&`;
    }
  }
  
  // Add timestamp
  dataString += `timestamp=${timestamp}`;
  
  // Create HMAC hash using SHA256
  return CryptoJS.HmacSHA256(dataString, apiSecret).toString();
};

/**
 * Securely store sensitive data in localStorage with encryption
 * @param key Storage key
 * @param value Value to store
 * @param expiryMinutes Optional expiry in minutes
 */
export const secureLocalStorage = {
  setItem: (key: string, value: any, expiryMinutes?: number): void => {
    try {
      const item = {
        value,
        expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null
      };
      
      localStorage.setItem(key, encryptForStorage(item, 'local_storage'));
    } catch (e) {
      console.error('Failed to store encrypted data:', e);
    }
  },
  
  getItem: <T>(key: string): T | null => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const result = decryptFromStorage<{ value: T; expiry: number | null }>(encryptedValue);
      if (!result) return null;
      
      // Check expiry
      if (result.data.expiry && result.data.expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return result.data.value;
    } catch (e) {
      console.error('Failed to retrieve encrypted data:', e);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
};
