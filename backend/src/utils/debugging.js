/**
 * Debugging Utilities
 * 
 * This module demonstrates debugging practices:
 * - Avoiding debugging through good design
 * - Assertions for early error detection
 * - Localizing bugs
 * - Reproducing bugs
 * - Understanding bug location and cause
 * - Fixing bugs systematically
 */

/**
 * ASSERTIONS - Early Error Detection
 */

/**
 * Custom assertion function for preconditions and invariants
 * Helps catch bugs early during development
 * 
 * @param {boolean} condition - Condition that should be true
 * @param {string} message - Error message if assertion fails
 * @throws {Error} - If condition is false
 */
export const assert = (condition, message = 'Assertion failed') => {
  if (!condition) {
    const error = new Error(`ASSERTION FAILED: ${message}`);
    error.name = 'AssertionError';
    error.isAssertion = true;
    throw error;
  }
};

/**
 * Assert that a value is defined (not null/undefined)
 */
export const assertDefined = (value, name = 'Value') => {
  assert(
    value !== null && value !== undefined,
    `${name} must be defined (got ${value})`
  );
};

/**
 * Assert that a value is within a valid range
 */
export const assertInRange = (value, min, max, name = 'Value') => {
  assert(
    value >= min && value <= max,
    `${name} must be between ${min} and ${max} (got ${value})`
  );
};

/**
 * Assert that an array is not empty
 */
export const assertNonEmpty = (array, name = 'Array') => {
  assert(
    Array.isArray(array) && array.length > 0,
    `${name} must be a non-empty array`
  );
};

/**
 * Assert that a value is one of the allowed values
 */
export const assertOneOf = (value, allowedValues, name = 'Value') => {
  assert(
    allowedValues.includes(value),
    `${name} must be one of [${allowedValues.join(', ')}] (got ${value})`
  );
};

/**
 * BUG LOCALIZATION - Helper functions to identify bug location
 */

/**
 * Creates a debug context for tracking function execution
 * Helps localize where bugs occur
 */
export class DebugContext {
  constructor(functionName, args = {}) {
    this.functionName = functionName;
    this.args = args;
    this.startTime = Date.now();
    this.steps = [];
    this.errors = [];
  }
  
  /**
   * Log a step in execution
   */
  logStep(stepName, data = {}) {
    this.steps.push({
      step: stepName,
      timestamp: Date.now() - this.startTime,
      data: this.sanitizeData(data)
    });
  }
  
  /**
   * Log an error with context
   */
  logError(error, stepName = null) {
    this.errors.push({
      step: stepName || 'unknown',
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      },
      timestamp: Date.now() - this.startTime,
      context: this.getContext()
    });
  }
  
  /**
   * Get current execution context
   */
  getContext() {
    return {
      function: this.functionName,
      stepCount: this.steps.length,
      executionTime: Date.now() - this.startTime,
      lastStep: this.steps.length > 0 ? this.steps[this.steps.length - 1] : null
    };
  }
  
  /**
   * Sanitize sensitive data for logging
   */
  sanitizeData(data) {
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  /**
   * Generate debug report
   */
  getReport() {
    return {
      function: this.functionName,
      arguments: this.args,
      executionTime: Date.now() - this.startTime,
      steps: this.steps,
      errors: this.errors,
      success: this.errors.length === 0
    };
  }
}

/**
 * Decorator function to wrap functions with debug context
 */
export const withDebugContext = (fn, functionName = fn.name) => {
  return async (...args) => {
    const context = new DebugContext(functionName, args);
    
    try {
      context.logStep('function_start', { argsCount: args.length });
      
      const result = await fn(...args);
      
      context.logStep('function_complete', { 
        hasResult: result !== undefined 
      });
      
      return result;
    } catch (error) {
      context.logError(error, 'function_execution');
      throw error;
    } finally {
      // In development, log the context
      // eslint-disable-next-line node/prefer-global/process
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug Context:', context.getReport());
      }
    }
  };
};

/**
 * REPRODUCE BUG - Helper to create reproducible test cases
 */

/**
 * Creates a bug reproduction case
 * Records all inputs and environment to reproduce a bug
 */
export class BugReproduction {
  constructor(description) {
    this.description = description;
    this.inputs = {};
    this.environment = {};
    this.expectedBehavior = null;
    this.actualBehavior = null;
    this.steps = [];
    this.timestamp = new Date().toISOString();
  }
  
  /**
   * Record input value
   */
  recordInput(name, value) {
    this.inputs[name] = this.sanitizeValue(value);
    return this;
  }
  
  /**
   * Record environment variable
   */
  recordEnvironment(name, value) {
    this.environment[name] = value;
    return this;
  }
  
  /**
   * Record a step in reproduction
   */
  recordStep(stepNumber, description, data = {}) {
    this.steps.push({
      step: stepNumber,
      description,
      data: this.sanitizeValue(data),
      timestamp: Date.now()
    });
    return this;
  }
  
  /**
   * Set expected behavior
   */
  setExpected(description) {
    this.expectedBehavior = description;
    return this;
  }
  
  /**
   * Set actual (buggy) behavior
   */
  setActual(description) {
    this.actualBehavior = description;
    return this;
  }
  
  /**
   * Sanitize sensitive values
   */
  sanitizeValue(value) {
    if (typeof value === 'string') {
      const sensitive = ['password', 'token', 'secret', 'key'];
      if (sensitive.some(s => value.toLowerCase().includes(s))) {
        return '[REDACTED]';
      }
    }
    return value;
  }
  
  /**
   * Generate reproduction report
   */
  getReport() {
    return {
      description: this.description,
      timestamp: this.timestamp,
      inputs: this.inputs,
      environment: this.environment,
      steps: this.steps,
      expectedBehavior: this.expectedBehavior,
      actualBehavior: this.actualBehavior,
      bugLocation: this.identifyBugLocation()
    };
  }
  
  /**
   * Attempt to identify likely bug location based on steps
   */
  identifyBugLocation() {
    if (this.steps.length === 0) {
      return 'Unknown - no steps recorded';
    }
    
    const lastStep = this.steps[this.steps.length - 1];
    return `Likely in step ${lastStep.step}: ${lastStep.description}`;
  }
}

/**
 * UNDERSTANDING BUG CAUSE - Analysis helpers
 */

/**
 * Analyzes error to understand root cause
 */
export const analyzeError = (error, context = {}) => {
  const analysis = {
    errorType: error.constructor.name,
    message: error.message,
    stack: error.stack,
    context: context,
    likelyCauses: [],
    suggestedFixes: []
  };
  
  // Analyze common error patterns
  if (error.message.includes('null') || error.message.includes('undefined')) {
    analysis.likelyCauses.push('Null/undefined value access');
    analysis.suggestedFixes.push('Add null checks before accessing properties');
  }
  
  if (error.message.includes('Cannot read property')) {
    analysis.likelyCauses.push('Property access on undefined object');
    analysis.suggestedFixes.push('Verify object exists before property access');
  }
  
  if (error.message.includes('maximum call stack')) {
    analysis.likelyCauses.push('Infinite recursion');
    analysis.suggestedFixes.push('Check base case in recursive function');
  }
  
  if (error.message.includes('async') || error.message.includes('Promise')) {
    analysis.likelyCauses.push('Async/await handling issue');
    analysis.suggestedFixes.push('Ensure proper await or .then() handling');
  }
  
  if (error.message.includes('constraint') || error.message.includes('unique')) {
    analysis.likelyCauses.push('Database constraint violation');
    analysis.suggestedFixes.push('Check for duplicate values or invalid foreign keys');
  }
  
  return analysis;
};

/**
 * AVOIDING DEBUGGING - Design patterns that prevent bugs
 */

/**
 * Validates input with clear error messages
 * Prevents bugs by catching issues early
 */
export const validateInput = (input, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];
    
    // Required check
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }
    
    // Range check
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
    
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }
    
    // Pattern check (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} does not match required pattern`);
    }
  }
  
  if (errors.length > 0) {
    const error = new Error(`Validation failed: ${errors.join(', ')}`);
    error.validationErrors = errors;
    throw error;
  }
  
  return true;
};

/**
 * Safe property access to prevent null reference errors
 */
export const safeGet = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};

/**
 * FIXING BUGS - Systematic approach helpers
 */

/**
 * Creates a bug fix plan
 */
export class BugFixPlan {
  constructor(bugDescription) {
    this.bugDescription = bugDescription;
    this.rootCause = null;
    this.steps = [];
    this.tests = [];
    this.riskAssessment = null;
  }
  
  /**
   * Identify root cause
   */
  setRootCause(cause) {
    this.rootCause = cause;
    return this;
  }
  
  /**
   * Add a fix step
   */
  addStep(stepNumber, description, codeChange = null) {
    this.steps.push({
      step: stepNumber,
      description,
      codeChange,
      completed: false
    });
    return this;
  }
  
  /**
   * Add a test case to verify fix
   */
  addTest(description, expectedResult) {
    this.tests.push({
      description,
      expectedResult,
      passed: false
    });
    return this;
  }
  
  /**
   * Set risk assessment
   */
  setRisk(level, description) {
    this.riskAssessment = {
      level, // 'low', 'medium', 'high'
      description
    };
    return this;
  }
  
  /**
   * Generate fix plan report
   */
  getReport() {
    return {
      bug: this.bugDescription,
      rootCause: this.rootCause,
      steps: this.steps,
      tests: this.tests,
      risk: this.riskAssessment,
      completionStatus: this.steps.filter(s => s.completed).length / this.steps.length
    };
  }
}

/**
 * Example: Systematic bug fixing workflow
 */
export const createBugFixWorkflow = (error, context) => {
  const plan = new BugFixPlan(error.message);
  
  // Step 1: Analyze error
  const analysis = analyzeError(error, context);
  plan.setRootCause(analysis.likelyCauses[0] || 'Unknown');
  
  // Step 2: Add fix steps
  analysis.suggestedFixes.forEach((fix, index) => {
    plan.addStep(index + 1, fix);
  });
  
  // Step 3: Add tests
  plan.addTest('Verify fix resolves error', 'No error thrown');
  plan.addTest('Verify functionality still works', 'Expected behavior maintained');
  
  // Step 4: Assess risk
  const riskLevel = analysis.likelyCauses.length > 1 ? 'medium' : 'low';
  plan.setRisk(riskLevel, 'Fix should be straightforward');
  
  return plan;
};

