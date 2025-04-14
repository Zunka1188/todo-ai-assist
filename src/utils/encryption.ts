
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
