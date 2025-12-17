/**
 * API Response Helper Utilities
 * Collection of functions for formatting, validating, and processing API responses
 * Note: This file contains standalone utility functions not currently integrated into the main system
 */

// ============================================================================
// RESPONSE FORMATTING FUNCTIONS
// ============================================================================

/**
 * Creates a standardized success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted success response
 */
export function createSuccessResponse(data = null, message = 'Operation successful', statusCode = 200) {
  return {
    success: true,
    message: message,
    data: data,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Additional error details
 * @returns {Object} Formatted error response
 */
export function createErrorResponse(message = 'An error occurred', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
}

/**
 * Creates a paginated response
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Response message
 * @returns {Object} Formatted paginated response
 */
export function createPaginatedResponse(data, page, limit, total, message = 'Data retrieved successfully') {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    success: true,
    message: message,
    data: data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: totalPages,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Wraps data in a response envelope
 * @param {*} data - Data to wrap
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Wrapped response
 */
export function wrapResponse(data, metadata = {}) {
  return {
    success: true,
    data: data,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Creates a validation error response
 * @param {Array|Object} validationErrors - Validation error details
 * @returns {Object} Formatted validation error response
 */
export function createValidationErrorResponse(validationErrors) {
  return {
    success: false,
    message: 'Validation failed',
    statusCode: 400,
    errors: Array.isArray(validationErrors) ? validationErrors : [validationErrors],
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// REQUEST VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates required fields in request body
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object|null} Validation error object or null if valid
 */
export function validateRequiredFields(body, requiredFields) {
  if (!body || typeof body !== 'object') {
    return { message: 'Request body is required' };
  }
  
  const missingFields = requiredFields.filter(field => {
    return body[field] === undefined || body[field] === null || body[field] === '';
  });
  
  if (missingFields.length > 0) {
    return {
      message: 'Missing required fields',
      missingFields: missingFields
    };
  }
  
  return null;
}

/**
 * Validates field types
 * @param {Object} body - Request body
 * @param {Object} fieldTypes - Object mapping field names to expected types
 * @returns {Object|null} Validation error object or null if valid
 */
export function validateFieldTypes(body, fieldTypes) {
  if (!body || typeof body !== 'object') {
    return { message: 'Request body is required' };
  }
  
  const typeErrors = [];
  
  Object.keys(fieldTypes).forEach(field => {
    if (body[field] !== undefined) {
      const expectedType = fieldTypes[field];
      const actualType = typeof body[field];
      
      if (expectedType === 'array' && !Array.isArray(body[field])) {
        typeErrors.push({
          field: field,
          expected: 'array',
          actual: actualType
        });
      } else if (expectedType === 'object' && (typeof body[field] !== 'object' || Array.isArray(body[field]))) {
        typeErrors.push({
          field: field,
          expected: 'object',
          actual: actualType
        });
      } else if (expectedType !== 'array' && expectedType !== 'object' && actualType !== expectedType) {
        typeErrors.push({
          field: field,
          expected: expectedType,
          actual: actualType
        });
      }
    }
  });
  
  if (typeErrors.length > 0) {
    return {
      message: 'Type validation failed',
      errors: typeErrors
    };
  }
  
  return null;
}

/**
 * Validates string length constraints
 * @param {Object} body - Request body
 * @param {Object} constraints - Object mapping field names to length constraints
 * @returns {Object|null} Validation error object or null if valid
 */
export function validateStringLength(body, constraints) {
  if (!body || typeof body !== 'object') {
    return { message: 'Request body is required' };
  }
  
  const lengthErrors = [];
  
  Object.keys(constraints).forEach(field => {
    if (body[field] !== undefined && typeof body[field] === 'string') {
      const constraint = constraints[field];
      const length = body[field].length;
      
      if (constraint.min !== undefined && length < constraint.min) {
        lengthErrors.push({
          field: field,
          message: `Minimum length is ${constraint.min} characters`,
          actual: length
        });
      }
      
      if (constraint.max !== undefined && length > constraint.max) {
        lengthErrors.push({
          field: field,
          message: `Maximum length is ${constraint.max} characters`,
          actual: length
        });
      }
    }
  });
  
  if (lengthErrors.length > 0) {
    return {
      message: 'String length validation failed',
      errors: lengthErrors
    };
  }
  
  return null;
}

/**
 * Validates numeric range constraints
 * @param {Object} body - Request body
 * @param {Object} constraints - Object mapping field names to range constraints
 * @returns {Object|null} Validation error object or null if valid
 */
export function validateNumericRange(body, constraints) {
  if (!body || typeof body !== 'object') {
    return { message: 'Request body is required' };
  }
  
  const rangeErrors = [];
  
  Object.keys(constraints).forEach(field => {
    if (body[field] !== undefined && typeof body[field] === 'number') {
      const constraint = constraints[field];
      const value = body[field];
      
      if (constraint.min !== undefined && value < constraint.min) {
        rangeErrors.push({
          field: field,
          message: `Minimum value is ${constraint.min}`,
          actual: value
        });
      }
      
      if (constraint.max !== undefined && value > constraint.max) {
        rangeErrors.push({
          field: field,
          message: `Maximum value is ${constraint.max}`,
          actual: value
        });
      }
    }
  });
  
  if (rangeErrors.length > 0) {
    return {
      message: 'Numeric range validation failed',
      errors: rangeErrors
    };
  }
  
  return null;
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// QUERY PARAMETER PROCESSING
// ============================================================================

/**
 * Parses pagination parameters from query
 * @param {Object} query - Query parameters
 * @param {number} defaultPage - Default page number
 * @param {number} defaultLimit - Default items per page
 * @param {number} maxLimit - Maximum items per page
 * @returns {Object} Parsed pagination parameters
 */
export function parsePaginationParams(query, defaultPage = 1, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page) || defaultPage);
  let limit = parseInt(query.limit) || defaultLimit;
  limit = Math.min(Math.max(1, limit), maxLimit);
  
  return {
    page: page,
    limit: limit,
    offset: (page - 1) * limit
  };
}

/**
 * Parses sorting parameters from query
 * @param {Object} query - Query parameters
 * @param {string} defaultSortBy - Default sort field
 * @param {string} defaultOrder - Default sort order
 * @returns {Object} Parsed sorting parameters
 */
export function parseSortParams(query, defaultSortBy = 'createdAt', defaultOrder = 'desc') {
  const sortBy = query.sortBy || defaultSortBy;
  const order = (query.order || defaultOrder).toLowerCase();
  const validOrder = order === 'asc' || order === 'desc' ? order : defaultOrder;
  
  return {
    sortBy: sortBy,
    order: validOrder
  };
}

/**
 * Parses filter parameters from query
 * @param {Object} query - Query parameters
 * @param {Array<string>} allowedFilters - Allowed filter field names
 * @returns {Object} Parsed filter parameters
 */
export function parseFilterParams(query, allowedFilters = []) {
  const filters = {};
  
  if (allowedFilters.length === 0) {
    return filters;
  }
  
  allowedFilters.forEach(filter => {
    if (query[filter] !== undefined) {
      filters[filter] = query[filter];
    }
  });
  
  return filters;
}

/**
 * Parses date range from query
 * @param {Object} query - Query parameters
 * @param {string} startKey - Start date query key
 * @param {string} endKey - End date query key
 * @returns {Object|null} Parsed date range or null
 */
export function parseDateRange(query, startKey = 'startDate', endKey = 'endDate') {
  const startDate = query[startKey];
  const endDate = query[endKey];
  
  if (!startDate && !endDate) {
    return null;
  }
  
  const range = {};
  
  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      range.start = start;
    }
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      range.end = end;
    }
  }
  
  if (range.start && range.end && range.start > range.end) {
    return null;
  }
  
  return Object.keys(range).length > 0 ? range : null;
}

// ============================================================================
// HEADER PROCESSING FUNCTIONS
// ============================================================================

/**
 * Extracts authorization token from headers
 * @param {Object} headers - Request headers
 * @returns {string|null} Token or null
 */
export function extractAuthToken(headers) {
  if (!headers?.authorization) return null;
  const authHeader = headers.authorization;
  return authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
}

/**
 * Extracts content type from headers
 * @param {Object} headers - Request headers
 * @returns {string|null} Content type or null
 */
export function extractContentType(headers) {
  return headers?.['content-type']?.split(';')[0]?.trim() || null;
}

/**
 * Validates content type
 * @param {Object} headers - Request headers
 * @param {Array<string>} allowedTypes - Allowed content types
 * @returns {boolean} True if content type is allowed
 */
export function validateContentType(headers, allowedTypes = ['application/json']) {
  const contentType = extractContentType(headers);
  return contentType ? allowedTypes.includes(contentType) : false;
}

/**
 * Gets client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
export function getClientIP(req) {
  if (!req) return 'unknown';
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
}

/**
 * Gets user agent from headers
 * @param {Object} headers - Request headers
 * @returns {string} User agent string
 */
export function getUserAgent(headers) {
  return headers?.['user-agent'] || 'unknown';
}

// ============================================================================
// ERROR HANDLING FUNCTIONS
// ============================================================================

/**
 * Formats error for logging
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error object
 */
export function formatErrorForLogging(error, context = {}) {
  return {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    ...context,
    timestamp: new Date().toISOString()
  };
}

/**
 * Determines HTTP status code from error
 * @param {Error} error - Error object
 * @returns {number} HTTP status code
 */
export function getErrorStatusCode(error) {
  if (error?.statusCode) {
    return error.statusCode;
  }
  
  if (error?.name === 'ValidationError') {
    return 400;
  }
  
  if (error?.name === 'UnauthorizedError' || error?.name === 'AuthenticationError') {
    return 401;
  }
  
  if (error?.name === 'ForbiddenError' || error?.name === 'AuthorizationError') {
    return 403;
  }
  
  if (error?.name === 'NotFoundError') {
    return 404;
  }
  
  if (error?.name === 'ConflictError') {
    return 409;
  }
  
  return 500;
}

/**
 * Sanitizes error message for client response
 * @param {Error} error - Error object
 * @param {boolean} includeDetails - Include error details
 * @returns {string} Sanitized error message
 */
export function sanitizeErrorMessage(error, includeDetails = false) {
  if (!error) {
    return 'An unexpected error occurred';
  }
  
  if (includeDetails && error.message) {
    return error.message;
  }
  
  const statusCode = getErrorStatusCode(error);
  
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// ============================================================================
// CORS AND SECURITY HELPERS
// ============================================================================

/**
 * Validates origin for CORS
 * @param {string} origin - Request origin
 * @param {Array<string>} allowedOrigins - Allowed origins
 * @returns {boolean} True if origin is allowed
 */
export function validateOrigin(origin, allowedOrigins = []) {
  if (!origin) return false;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
}

/**
 * Gets CORS headers
 * @param {string} origin - Request origin
 * @param {Array<string>} allowedOrigins - Allowed origins
 * @returns {Object} CORS headers
 */
export function getCORSHeaders(origin, allowedOrigins = []) {
  const isAllowed = validateOrigin(origin, allowedOrigins);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': isAllowed ? 'true' : 'false'
  };
}

/**
 * Sanitizes input to prevent injection attacks
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  wrapResponse,
  createValidationErrorResponse,
  validateRequiredFields,
  validateFieldTypes,
  validateStringLength,
  validateNumericRange,
  isValidEmail,
  isValidURL,
  parsePaginationParams,
  parseSortParams,
  parseFilterParams,
  parseDateRange,
  extractAuthToken,
  extractContentType,
  validateContentType,
  getClientIP,
  getUserAgent,
  formatErrorForLogging,
  getErrorStatusCode,
  sanitizeErrorMessage,
  validateOrigin,
  getCORSHeaders,
  sanitizeInput
};
