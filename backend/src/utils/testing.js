/**
 * Testing Utilities
 * 
 * This module demonstrates testing concepts:
 * - Validation through testing
 * - Test-first programming (TDD)
 * - Black-box and white-box testing
 * - Choosing test cases by partition
 * - Unit testing patterns
 */

/**
 * TEST DATA GENERATORS - For partition testing
 */

/**
 * Generates test cases by partitioning input space
 * Demonstrates equivalence partitioning
 * 
 * @param {Object} partitions - Object defining partitions
 * @returns {Array} - Test cases covering all partitions
 * 
 * Example:
 * generatePartitionTests({
 *   age: { valid: [18, 25, 65], invalid: [-1, 0, 17, 66, 150] },
 *   email: { valid: ['test@nust.edu.pk'], invalid: ['invalid', '@nust.edu.pk'] }
 * })
 */
export const generatePartitionTests = (partitions) => {
  const testCases = [];
  
  // Generate valid partition tests
  const validKeys = Object.keys(partitions).filter(key => partitions[key].valid);
  const validCombinations = generateCombinations(partitions, validKeys, 'valid');
  testCases.push(...validCombinations.map(tc => ({ ...tc, expected: 'valid' })));
  
  // Generate invalid partition tests (one invalid field at a time)
  Object.keys(partitions).forEach(key => {
    if (partitions[key].invalid) {
      partitions[key].invalid.forEach(invalidValue => {
        const testCase = {};
        // Start with valid values for all other fields
        Object.keys(partitions).forEach(otherKey => {
          if (otherKey !== key && partitions[otherKey].valid) {
            testCase[otherKey] = partitions[otherKey].valid[0];
          }
        });
        // Set invalid value for this field
        testCase[key] = invalidValue;
        testCases.push({ ...testCase, expected: 'invalid', invalidField: key });
      });
    }
  });
  
  return testCases;
};

/**
 * Helper: Generate combinations of values
 */
const generateCombinations = (partitions, keys, type = 'valid') => {
  if (keys.length === 0) return [{}];
  
  const [firstKey, ...restKeys] = keys;
  const restCombinations = generateCombinations(partitions, restKeys, type);
  const values = partitions[firstKey][type] || [];
  
  const combinations = [];
  values.forEach(value => {
    restCombinations.forEach(rest => {
      combinations.push({ [firstKey]: value, ...rest });
    });
  });
  
  return combinations;
};

/**
 * BLACK-BOX TESTING - Testing without knowing implementation
 */

/**
 * Black-box test case generator
 * Tests based on specifications, not implementation details
 */
export class BlackBoxTestCase {
  constructor(description, input, expectedOutput, testFunction) {
    this.description = description;
    this.input = input;
    this.expectedOutput = expectedOutput;
    this.testFunction = testFunction;
  }
  
  /**
   * Run the test case
   */
  async run() {
    try {
      const actualOutput = await this.testFunction(this.input);
      const passed = this.compareOutput(actualOutput, this.expectedOutput);
      
      return {
        description: this.description,
        passed,
        input: this.input,
        expectedOutput: this.expectedOutput,
        actualOutput: passed ? actualOutput : actualOutput,
        error: passed ? null : `Expected ${JSON.stringify(this.expectedOutput)}, got ${JSON.stringify(actualOutput)}`
      };
    } catch (error) {
      return {
        description: this.description,
        passed: false,
        input: this.input,
        error: error.message,
        exception: true
      };
    }
  }
  
  /**
   * Compare output (deep equality)
   */
  compareOutput(actual, expected) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
}

/**
 * Create black-box test suite
 */
export const createBlackBoxTestSuite = (testCases) => {
  return {
    async runAll() {
      const results = [];
      for (const testCase of testCases) {
        const result = await testCase.run();
        results.push(result);
      }
      
      return {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        results
      };
    }
  };
};

/**
 * WHITE-BOX TESTING - Testing with knowledge of implementation
 */

/**
 * White-box test case generator
 * Tests internal logic, branches, and edge cases
 */
export class WhiteBoxTestCase {
  constructor(description, testFunction, coverageTarget = null) {
    this.description = description;
    this.testFunction = testFunction;
    this.coverageTarget = coverageTarget; // e.g., 'branch', 'path', 'statement'
  }
  
  /**
   * Run with coverage tracking
   */
  async run() {
    const startTime = Date.now();
    try {
      await this.testFunction();
      return {
        description: this.description,
        passed: true,
        executionTime: Date.now() - startTime,
        coverageTarget: this.coverageTarget
      };
    } catch (error) {
      return {
        description: this.description,
        passed: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        coverageTarget: this.coverageTarget
      };
    }
  }
}

/**
 * UNIT TESTING - Testing individual functions
 */

/**
 * Simple unit test framework
 */
export class UnitTest {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.setup = null;
    this.teardown = null;
  }
  
  /**
   * Setup function to run before each test
   */
  beforeEach(fn) {
    this.setup = fn;
  }
  
  /**
   * Teardown function to run after each test
   */
  afterEach(fn) {
    this.teardown = fn;
  }
  
  /**
   * Add a test case
   */
  test(description, testFunction) {
    this.tests.push({ description, testFunction });
  }
  
  /**
   * Assertion helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
  
  /**
   * Assert equality
   */
  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message || `Expected ${expected}, got ${actual}`}`);
    }
  }
  
  /**
   * Assert deep equality
   */
  assertDeepEquals(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Assertion failed: ${message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
    }
  }
  
  /**
   * Assert throws error
   */
  async assertThrows(testFunction, expectedError = null) {
    try {
      await testFunction();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
      }
      return true;
    }
  }
  
  /**
   * Run all tests
   */
  async run() {
    const results = [];
    
    for (const test of this.tests) {
      try {
        // Run setup
        if (this.setup) {
          await this.setup();
        }
        
        // Run test
        await test.testFunction();
        
        // Run teardown
        if (this.teardown) {
          await this.teardown();
        }
        
        results.push({
          description: test.description,
          passed: true
        });
      } catch (error) {
        results.push({
          description: test.description,
          passed: false,
          error: error.message
        });
      }
    }
    
    return {
      suiteName: this.name,
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results
    };
  }
}

/**
 * TEST-FIRST PROGRAMMING (TDD) - Write tests before implementation
 */

/**
 * Test-first development helper
 * Defines test specification before implementation
 */
export class TestFirstSpec {
  constructor(moduleName, functionName) {
    this.moduleName = moduleName;
    this.functionName = functionName;
    this.specifications = [];
    this.testCases = [];
  }
  
  /**
   * Add a specification (what the function should do)
   */
  spec(description, testFunction) {
    this.specifications.push({ description, testFunction });
    return this;
  }
  
  /**
   * Add a test case with input and expected output
   */
  shouldReturn(input, expectedOutput, description = null) {
    this.testCases.push({
      description: description || `should return ${JSON.stringify(expectedOutput)} for input ${JSON.stringify(input)}`,
      input,
      expectedOutput
    });
    return this;
  }
  
  /**
   * Add a test case expecting an error
   */
  shouldThrow(input, expectedError, description = null) {
    this.testCases.push({
      description: description || `should throw error for input ${JSON.stringify(input)}`,
      input,
      expectedError,
      shouldThrow: true
    });
    return this;
  }
  
  /**
   * Generate test code
   */
  generateTestCode() {
    let code = `// Test-first specification for ${this.moduleName}.${this.functionName}\n\n`;
    code += `describe('${this.functionName}', () => {\n`;
    
    // Generate specs
    this.specifications.forEach(spec => {
      code += `  it('${spec.description}', async () => {\n`;
      code += `    // TODO: Implement test\n`;
      code += `  });\n\n`;
    });
    
    // Generate test cases
    this.testCases.forEach((testCase, index) => {
      code += `  it('${testCase.description}', async () => {\n`;
      if (testCase.shouldThrow) {
        code += `    await expect(${this.functionName}(${JSON.stringify(testCase.input)}))\n`;
        code += `      .rejects.toThrow('${testCase.expectedError}');\n`;
      } else {
        code += `    const result = await ${this.functionName}(${JSON.stringify(testCase.input)});\n`;
        code += `    expect(result).toEqual(${JSON.stringify(testCase.expectedOutput)});\n`;
      }
      code += `  });\n\n`;
    });
    
    code += `});\n`;
    return code;
  }
}

/**
 * VALIDATION TESTING - Test validation functions
 */

/**
 * Creates validation test cases
 */
export const createValidationTests = (validator, validInputs, invalidInputs) => {
  const tests = [];
  
  // Valid inputs should pass
  validInputs.forEach(input => {
    tests.push({
      description: `should accept valid input: ${JSON.stringify(input)}`,
      input,
      shouldPass: true,
      test: () => {
        const result = validator(input);
        if (!result.isValid) {
          throw new Error(`Expected valid input to pass validation, got: ${result.message}`);
        }
      }
    });
  });
  
  // Invalid inputs should fail
  invalidInputs.forEach(input => {
    tests.push({
      description: `should reject invalid input: ${JSON.stringify(input)}`,
      input,
      shouldPass: false,
      test: () => {
        const result = validator(input);
        if (result.isValid) {
          throw new Error(`Expected invalid input to fail validation`);
        }
      }
    });
  });
  
  return tests;
};

/**
 * BOUNDARY VALUE TESTING
 */

/**
 * Generates boundary value test cases
 * Tests values at boundaries of valid ranges
 */
export const generateBoundaryTests = (field, min, max) => {
  return [
    { [field]: min - 1, expected: 'invalid', description: `Below minimum (${min - 1})` },
    { [field]: min, expected: 'valid', description: `At minimum (${min})` },
    { [field]: min + 1, expected: 'valid', description: `Just above minimum (${min + 1})` },
    { [field]: max - 1, expected: 'valid', description: `Just below maximum (${max - 1})` },
    { [field]: max, expected: 'valid', description: `At maximum (${max})` },
    { [field]: max + 1, expected: 'invalid', description: `Above maximum (${max + 1})` }
  ];
};

/**
 * TEST DATA BUILDERS - For creating test data
 */

/**
 * Builder pattern for creating test objects
 */
export class TestDataBuilder {
  constructor() {
    this.data = {};
  }
  
  withField(field, value) {
    this.data[field] = value;
    return this;
  }
  
  build() {
    return { ...this.data };
  }
  
  /**
   * Create builder for user test data
   */
  static user() {
    return new TestDataBuilder()
      .withField('name', 'Test User')
      .withField('email', 'test@nust.edu.pk')
      .withField('cmsId', 123456)
      .withField('role', 'student')
      .withField('password', 'TestPassword123!');
  }
  
  /**
   * Create builder for time slot test data
   */
  static timeSlot() {
    return new TestDataBuilder()
      .withField('startTime', '09:00')
      .withField('endTime', '10:00')
      .withField('maxCapacity', 20)
      .withField('genderRestriction', 'mixed')
      .withField('isActive', true);
  }
}

