/**
 * Utility functions for URL handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Get base URL without /api suffix
 * @returns {string} Base URL (e.g., http://localhost:8080)
 */
export const getBaseURL = () => {
  return API_BASE_URL.replace(/\/api\s*$/, '');
};

/**
 * Convert relative image path to full image URL
 * @param {string} imagePath - Relative path (e.g., /uploads/image.jpg)
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Add base URL to relative path
  return `${getBaseURL()}${imagePath}`;
};
