/**
 * Data Processing Helper Utilities
 * Collection of utility functions for data manipulation, transformation, and processing
 * Note: This file contains standalone utility functions not currently integrated into the main system
 */

// ============================================================================
// STRING MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Converts a string to title case
 * @param {string} str - Input string
 * @returns {string} Title cased string
 */
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Removes all whitespace from a string
 * @param {string} str - Input string
 * @returns {string} String without whitespace
 */
export function removeWhitespace(str) {
  if (!str) return '';
  return str.replace(/\s+/g, '');
}

/**
 * Truncates a string to specified length with ellipsis
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength = 50, suffix = '...') {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Converts camelCase to snake_case
 * @param {string} str - Input string in camelCase
 * @returns {string} String in snake_case
 */
export function camelToSnake(str) {
  if (!str) return '';
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Converts snake_case to camelCase
 * @param {string} str - Input string in snake_case
 * @returns {string} String in camelCase
 */
export function snakeToCamel(str) {
  if (!str) return '';
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Generates a random string of specified length
 * @param {number} length - Desired length
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
export function generateRandomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Checks if a string is a valid email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extracts domain from email address
 * @param {string} email - Email address
 * @returns {string} Domain part of email
 */
export function extractEmailDomain(email) {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1];
}

/**
 * Masks sensitive information in strings
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of characters to keep visible
 * @param {string} maskChar - Character to use for masking
 * @returns {string} Masked string
 */
export function maskString(str, visibleChars = 4, maskChar = '*') {
  if (!str || str.length <= visibleChars) return maskChar.repeat(str.length);
  const visible = str.substring(str.length - visibleChars);
  return maskChar.repeat(str.length - visibleChars) + visible;
}

// ============================================================================
// NUMBER MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Formats a number with thousand separators
 * @param {number} num - Number to format
 * @param {string} separator - Separator character (default: ',')
 * @returns {string} Formatted number string
 */
export function formatNumber(num, separator = ',') {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} decimals - Number of decimal places
 * @returns {number} Random float
 */
export function randomFloat(min, max, decimals = 2) {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
}

/**
 * Clamps a number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Checks if a number is within a range
 * @param {number} num - Number to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} inclusive - Include boundaries (default: true)
 * @returns {boolean} True if within range
 */
export function isInRange(num, min, max, inclusive = true) {
  if (inclusive) {
    return num >= min && num <= max;
  }
  return num > min && num < max;
}

/**
 * Converts bytes to human readable format
 * @param {number} bytes - Bytes to convert
 * @param {number} decimals - Decimal places
 * @returns {string} Human readable size
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Calculates percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
export function calculatePercentage(part, total, decimals = 2) {
  if (total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
}

// ============================================================================
// ARRAY MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Removes duplicates from an array
 * @param {Array} arr - Input array
 * @returns {Array} Array without duplicates
 */
export function removeDuplicates(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr)];
}

/**
 * Shuffles an array randomly
 * @param {Array} arr - Input array
 * @returns {Array} Shuffled array
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Chunks an array into smaller arrays of specified size
 * @param {Array} arr - Input array
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export function chunkArray(arr, size) {
  if (!Array.isArray(arr) || size <= 0) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flattens a nested array
 * @param {Array} arr - Nested array
 * @param {number} depth - Flattening depth
 * @returns {Array} Flattened array
 */
export function flattenArray(arr, depth = Infinity) {
  if (!Array.isArray(arr)) return [];
  return arr.flat(depth);
}

/**
 * Groups array items by a key
 * @param {Array} arr - Input array
 * @param {string|Function} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(arr, key) {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * Finds intersection of two arrays
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {Array} Intersection array
 */
export function arrayIntersection(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Finds difference between two arrays
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {Array} Difference array
 */
export function arrayDifference(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
  return arr1.filter(item => !arr2.includes(item));
}

/**
 * Gets random item from array
 * @param {Array} arr - Input array
 * @returns {*} Random item
 */
export function randomItem(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Sorts array of objects by key
 * @param {Array} arr - Array of objects
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortByKey(arr, key, order = 'asc') {
  if (!Array.isArray(arr)) return [];
  const sorted = [...arr];
  sorted.sort((a, b) => {
    if (order === 'desc') {
      return b[key] > a[key] ? 1 : -1;
    }
    return a[key] > b[key] ? 1 : -1;
  });
  return sorted;
}

// ============================================================================
// OBJECT MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  return obj;
}

/**
 * Merges multiple objects deeply
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
export function deepMerge(...objects) {
  const result = {};
  objects.forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
          result[key] = deepMerge(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      });
    }
  });
  return result;
}

/**
 * Picks specific keys from an object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} Object with picked keys
 */
export function pickKeys(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};
  if (!Array.isArray(keys)) return {};
  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omits specific keys from an object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} Object without omitted keys
 */
export function omitKeys(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};
  if (!Array.isArray(keys)) return obj;
  const result = {};
  Object.keys(obj).forEach(key => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Checks if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export function isEmptyObject(obj) {
  if (!obj || typeof obj !== 'object') return true;
  return Object.keys(obj).length === 0;
}

/**
 * Gets nested value from object using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Value at path or default
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  return current;
}

/**
 * Sets nested value in object using dot notation
 * @param {Object} obj - Target object
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export function setNestedValue(obj, path, value) {
  if (!obj || typeof obj !== 'object') return obj;
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
  return obj;
}

// ============================================================================
// DATE AND TIME FUNCTIONS
// ============================================================================

/**
 * Formats date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Adds days to a date
 * @param {Date|string|number} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Gets difference between two dates in days
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} Difference in days
 */
export function dateDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2 - d1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checks if date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if today
 */
export function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Checks if date is in the past
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if in past
 */
export function isPast(date) {
  if (!date) return false;
  const d = new Date(date);
  return d < new Date();
}

/**
 * Checks if date is in the future
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if in future
 */
export function isFuture(date) {
  if (!date) return false;
  const d = new Date(date);
  return d > new Date();
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates if value is not null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} True if not null/undefined
 */
export function isNotNull(value) {
  return value !== null && value !== undefined;
}

/**
 * Validates if value is a number
 * @param {*} value - Value to check
 * @returns {boolean} True if number
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Validates if value is a string
 * @param {*} value - Value to check
 * @returns {boolean} True if string
 */
export function isString(value) {
  return typeof value === 'string';
}

/**
 * Validates if value is an array
 * @param {*} value - Value to check
 * @returns {boolean} True if array
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Validates if value is an object
 * @param {*} value - Value to check
 * @returns {boolean} True if object
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validates if string is not empty
 * @param {string} str - String to check
 * @returns {boolean} True if not empty
 */
export function isNotEmpty(str) {
  return isString(str) && str.trim().length > 0;
}

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Converts object to query string
 * @param {Object} obj - Object to convert
 * @returns {string} Query string
 */
export function objectToQueryString(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const params = new URLSearchParams();
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined) {
      params.append(key, String(obj[key]));
    }
  });
  return params.toString();
}

/**
 * Converts query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed object
 */
export function queryStringToObject(queryString) {
  if (!queryString || typeof queryString !== 'string') return {};
  const params = new URLSearchParams(queryString);
  const obj = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * Transforms array of objects to key-value map
 * @param {Array} arr - Array of objects
 * @param {string} keyField - Field to use as key
 * @param {string} valueField - Field to use as value
 * @returns {Object} Key-value map
 */
export function arrayToMap(arr, keyField, valueField) {
  if (!Array.isArray(arr)) return {};
  const map = {};
  arr.forEach(item => {
    if (item && item[keyField] !== undefined) {
      map[item[keyField]] = valueField ? item[valueField] : item;
    }
  });
  return map;
}

/**
 * Converts map to array of objects
 * @param {Object} map - Key-value map
 * @param {string} keyField - Field name for key
 * @param {string} valueField - Field name for value
 * @returns {Array} Array of objects
 */
export function mapToArray(map, keyField = 'key', valueField = 'value') {
  if (!map || typeof map !== 'object') return [];
  return Object.keys(map).map(key => ({
    [keyField]: key,
    [valueField]: map[key]
  }));
}

/**
 * Transforms object keys using a function
 * @param {Object} obj - Source object
 * @param {Function} transformFn - Transformation function
 * @returns {Object} Object with transformed keys
 */
export function transformKeys(obj, transformFn) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  Object.keys(obj).forEach(key => {
    const newKey = transformFn(key);
    result[newKey] = obj[key];
  });
  return result;
}

/**
 * Transforms object values using a function
 * @param {Object} obj - Source object
 * @param {Function} transformFn - Transformation function
 * @returns {Object} Object with transformed values
 */
export function transformValues(obj, transformFn) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  Object.keys(obj).forEach(key => {
    result[key] = transformFn(obj[key], key);
  });
  return result;
}

// ============================================================================
// ASYNC AND PROMISE UTILITIES
// ============================================================================

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await delay(initialDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

/**
 * Executes functions in parallel with concurrency limit
 * @param {Array<Function>} functions - Array of async functions
 * @param {number} concurrency - Maximum concurrent executions
 * @returns {Promise<Array>} Results array
 */
export async function parallelLimit(functions, concurrency = 5) {
  const results = [];
  for (let i = 0; i < functions.length; i += concurrency) {
    const batch = functions.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Creates a debounced function
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// CACHE AND MEMOIZATION
// ============================================================================

/**
 * Creates a memoized function with cache
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Key generator function
 * @returns {Function} Memoized function
 */
export function memoize(fn, keyGenerator = JSON.stringify) {
  const cache = new Map();
  return function memoizedFunction(...args) {
    const key = keyGenerator(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Creates a simple cache with TTL
 * @param {number} ttl - Time to live in ms
 * @returns {Object} Cache object with get/set methods
 */
export function createCache(ttl = 60000) {
  const cache = new Map();
  return {
    get(key) {
      const item = cache.get(key);
      if (!item) return null;
      if (Date.now() - item.timestamp > ttl) {
        cache.delete(key);
        return null;
      }
      return item.value;
    },
    set(key, value) {
      cache.set(key, { value, timestamp: Date.now() });
    },
    clear() {
      cache.clear();
    },
    delete(key) {
      cache.delete(key);
    }
  };
}

// ============================================================================
// FILE AND DATA UTILITIES
// ============================================================================

/**
 * Generates a unique ID
 * @param {string} prefix - Prefix for ID
 * @returns {string} Unique ID
 */
export function generateUniqueId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parses CSV string to array of objects
 * @param {string} csv - CSV string
 * @param {string} delimiter - Delimiter character
 * @returns {Array} Array of objects
 */
export function parseCSV(csv, delimiter = ',') {
  if (!csv || typeof csv !== 'string') return [];
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    data.push(obj);
  }
  
  return data;
}

/**
 * Converts array of objects to CSV string
 * @param {Array} data - Array of objects
 * @param {Array} headers - Header names
 * @param {string} delimiter - Delimiter character
 * @returns {string} CSV string
 */
export function arrayToCSV(data, headers = null, delimiter = ',') {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.join(delimiter);
  const dataRows = data.map(item => {
    return keys.map(key => {
      const value = item[key] !== undefined ? item[key] : '';
      return String(value).includes(delimiter) ? `"${value}"` : value;
    }).join(delimiter);
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Generates mock user data
 * @param {number} count - Number of users to generate
 * @returns {Array} Array of user objects
 */
export function generateMockUsers(count = 10) {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Amy'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['nust.edu.pk', 'seecs.nust.edu.pk', 'ceme.nust.edu.pk'];
  const roles = ['student', 'faculty', 'alumni'];
  
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(domains)}`;
    users.push({
      id: generateUniqueId('user'),
      name: `${firstName} ${lastName}`,
      email: email,
      cmsId: randomInt(100000, 999999),
      role: randomItem(roles),
      createdAt: new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000))
    });
  }
  return users;
}

/**
 * Generates mock booking data
 * @param {number} count - Number of bookings to generate
 * @returns {Array} Array of booking objects
 */
export function generateMockBookings(count = 20) {
  const facilities = ['swimming', 'gym', 'badminton', 'horse_riding'];
  const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
  
  const bookings = [];
  for (let i = 0; i < count; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + randomInt(-7, 30));
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + randomInt(1, 3));
    
    bookings.push({
      id: generateUniqueId('booking'),
      facility: randomItem(facilities),
      userId: generateUniqueId('user'),
      startTime: startDate,
      endTime: endDate,
      status: randomItem(statuses),
      createdAt: new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000))
    });
  }
  return bookings;
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculates mean of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Mean value
 */
export function calculateMean(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

/**
 * Calculates median of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Median value
 */
export function calculateMedian(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculates standard deviation
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Standard deviation
 */
export function calculateStandardDeviation(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const mean = calculateMean(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const avgSquaredDiff = calculateMean(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Finds minimum value in array
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Minimum value
 */
export function findMin(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return null;
  return Math.min(...numbers);
}

/**
 * Finds maximum value in array
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Maximum value
 */
export function findMax(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return null;
  return Math.max(...numbers);
}

/**
 * Calculates sum of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Sum
 */
export function calculateSum(numbers) {
  if (!Array.isArray(numbers)) return 0;
  return numbers.reduce((acc, num) => acc + (isNumber(num) ? num : 0), 0);
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // String functions
  toTitleCase,
  removeWhitespace,
  truncateString,
  camelToSnake,
  snakeToCamel,
  generateRandomString,
  isValidEmailFormat,
  extractEmailDomain,
  maskString,
  
  // Number functions
  formatNumber,
  randomInt,
  randomFloat,
  clamp,
  isInRange,
  formatBytes,
  calculatePercentage,
  
  // Array functions
  removeDuplicates,
  shuffleArray,
  chunkArray,
  flattenArray,
  groupBy,
  arrayIntersection,
  arrayDifference,
  randomItem,
  sortByKey,
  
  // Object functions
  deepClone,
  deepMerge,
  pickKeys,
  omitKeys,
  isEmptyObject,
  getNestedValue,
  setNestedValue,
  
  // Date functions
  formatDate,
  getRelativeTime,
  addDays,
  dateDifference,
  isToday,
  isPast,
  isFuture,
  
  // Validation functions
  isNotNull,
  isNumber,
  isString,
  isArray,
  isObject,
  isNotEmpty,
  isValidPhone,
  isValidUrl,
  
  // Transformation functions
  objectToQueryString,
  queryStringToObject,
  arrayToMap,
  mapToArray,
  transformKeys,
  transformValues,
  
  // Async functions
  delay,
  retryWithBackoff,
  parallelLimit,
  debounce,
  throttle,
  
  // Cache functions
  memoize,
  createCache,
  
  // Utility functions
  generateUniqueId,
  parseCSV,
  arrayToCSV,
  generateMockUsers,
  generateMockBookings,
  
  // Statistical functions
  calculateMean,
  calculateMedian,
  calculateStandardDeviation,
  findMin,
  findMax,
  calculateSum
};

