/**
 * Validate if email is from NUST domains
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is from NUST domain
 */
const isNustian = (email) => {
  const allowedDomains = [
    'nust.edu.pk',
    'ceme.nust.edu.pk',
    'mce.nust.edu.pk',
    'scme.nust.edu.pk',
    'pnec.nust.edu.pk',
    'nca.nust.edu.pk',
    'mcs.nust.edu.pk',
    'con.nust.edu.pk',
    'seecs.nust.edu.pk',
    'nit.nust.edu.pk',
    'nbs.nust.edu.pk',
    'asab.nust.edu.pk',
    'cas.nust.edu.pk'
  ];

  return allowedDomains.some(domain => email.toLowerCase().endsWith(`@${domain}`));
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 */
const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate CMS ID format
 * @param {number} cmsId - CMS ID to validate
 * @returns {Object} - Validation result with isValid and message
 */
const validateCmsId = (cmsId) => {
  if (!cmsId) {
    return { isValid: false, message: 'CMS ID is required' };
  }
  
  if (!Number.isInteger(cmsId) || cmsId <= 0) {
    return { isValid: false, message: 'CMS ID must be a positive integer' };
  }
  
  return { isValid: true, message: 'CMS ID is valid' };
};

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {Object} - Validation result with isValid and message
 */
const validateRole = (role) => {
  const allowedRoles = ['ug' , 'pg' , 'alumni', 'faculty'];
  
  if (!role) {
    return { isValid: false, message: 'Role is required' };
  }
  
  if (!allowedRoles.includes(role.toLowerCase())) {
    return { isValid: false, message: 'Role must be one of: ug, pg, alumni, faculty' };
  }
  
  return { isValid: true, message: 'Role is valid' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {Object} - Validation result with isValid and message
 */
const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  return { isValid: true, message: 'Name is valid' };
};

export {
  isNustian,
  isValidEmailFormat,
  validatePassword,
  validateCmsId,
  validateRole,
  validateName
};
