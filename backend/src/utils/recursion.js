/**
 * Recursion Utilities
 * 
 * This module demonstrates recursion patterns including:
 * - Choosing the right recursive subproblem
 * - Structure of recursive implementations
 * - Common mistakes in recursive implementations
 * - Recursive data types
 * - Regular expressions and grammars
 */

/**
 * RECURSIVE DATA STRUCTURES
 */

/**
 * Represents a hierarchical rule structure (recursive data type)
 * Rules can have nested sub-rules, forming a tree structure
 */
export class RuleNode {
  constructor(id, title, content, parentId = null) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.parentId = parentId;
    this.children = []; // Recursive: children are also RuleNodes
  }
  
  /**
   * Add a child rule recursively
   */
  addChild(ruleNode) {
    ruleNode.parentId = this.id;
    this.children.push(ruleNode);
    return this;
  }
}

/**
 * RECURSION: Finding nested rules by category
 * 
 * Demonstrates proper recursive subproblem selection:
 * - Base case: node has no children (leaf node)
 * - Recursive case: search current node, then recursively search children
 * 
 * @param {RuleNode} rootNode - Root rule node
 * @param {string} category - Category to search for
 * @returns {Array} - Array of matching rule nodes
 */
export const findRulesByCategory = (rootNode, category) => {
  // Base case: empty node
  if (!rootNode) {
    return [];
  }
  
  let results = [];
  
  // Check current node (if it has category property)
  if (rootNode.category === category) {
    results.push(rootNode);
  }
  
  // Recursive case: search all children
  // Subproblem: find rules in each child subtree
  for (const child of rootNode.children) {
    const childResults = findRulesByCategory(child, category);
    results = results.concat(childResults);
  }
  
  return results;
};

/**
 * RECURSION: Building rule tree from flat list
 * 
 * Demonstrates recursive tree construction:
 * - Base case: no more nodes to process
 * - Recursive case: process node, then recursively process children
 * 
 * @param {Array} flatRules - Flat array of rules with parentId references
 * @param {string|null} parentId - ID of parent node (null for root)
 * @returns {Array} - Array of root RuleNodes with nested children
 */
export const buildRuleTree = (flatRules, parentId = null) => {
  // Base case: no rules to process
  if (!flatRules || flatRules.length === 0) {
    return [];
  }
  
  // Filter rules for current parent
  const children = flatRules.filter(rule => rule.parentId === parentId);
  
  // Recursive case: build tree for each child
  return children.map(rule => {
    const node = new RuleNode(rule.id, rule.title, rule.content, rule.parentId);
    // Recursive subproblem: build subtree for this node's children
    node.children = buildRuleTree(flatRules, rule.id);
    return node;
  });
};

/**
 * RECURSION: Counting nested waitlist positions
 * 
 * Demonstrates tail recursion optimization opportunity:
 * - Accumulates result through recursive calls
 * - Could be optimized to tail recursion with accumulator
 * 
 * @param {RuleNode} node - Rule node to count
 * @returns {number} - Total count of nodes in subtree
 */
export const countRuleNodes = (node) => {
  // Base case: null or empty node
  if (!node) {
    return 0;
  }
  
  // Count current node
  let count = 1;
  
  // Recursive case: count all children
  for (const child of node.children) {
    count += countRuleNodes(child); // Recursive call
  }
  
  return count;
};

/**
 * TAIL RECURSION OPTIMIZED VERSION (with accumulator)
 * 
 * Uses accumulator pattern to enable tail call optimization
 * 
 * @param {RuleNode} node - Rule node to count
 * @param {number} accumulator - Running count
 * @returns {number} - Total count
 */
export const countRuleNodesTailRecursive = (node, accumulator = 0) => {
  // Base case
  if (!node) {
    return accumulator;
  }
  
  // Increment accumulator
  let newAccumulator = accumulator + 1;
  
  // Tail recursive call with updated accumulator
  // For each child, make tail recursive call
  if (node.children.length === 0) {
    return newAccumulator;
  }
  
  // Process children iteratively to maintain tail recursion
  for (const child of node.children) {
    newAccumulator = countRuleNodesTailRecursive(child, newAccumulator);
  }
  
  return newAccumulator;
};

/**
 * RECURSION: Deep cloning nested structure
 * 
 * Demonstrates recursive data structure traversal
 * 
 * @param {*} obj - Object to deep clone (can be nested)
 * @returns {*} - Deep clone of object
 */
export const deepCloneRecursive = (obj) => {
  // Base case 1: primitive values
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Base case 2: Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Base case 3: Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneRecursive(item)); // Recursive case
  }
  
  // Recursive case: object with nested properties
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneRecursive(obj[key]); // Recursive subproblem
    }
  }
  
  return cloned;
};

/**
 * COMMON MISTAKES IN RECURSION - Examples of what NOT to do
 */

/**
 * MISTAKE 1: Missing base case
 * This will cause infinite recursion
 */
export const badCountNodes = (node) => {
  // MISSING BASE CASE - will recurse infinitely!
  return 1 + node.children.reduce((sum, child) => sum + badCountNodes(child), 0);
};

/**
 * MISTAKE 2: Not making problem smaller
 * This doesn't progress toward base case
 */
export const badFindRule = (node, id) => {
  if (!node) return null;
  if (node.id === id) return node;
  
  // MISTAKE: Not filtering, searching all nodes including already checked ones
  for (const child of node.children) {
    return badFindRule(child, id); // Returns after first child, won't search all
  }
  return null;
};

/**
 * CORRECT VERSION: Proper base case and smaller subproblem
 */
export const findRuleById = (node, id) => {
  // Base case 1: node is null
  if (!node) {
    return null;
  }
  
  // Base case 2: found the node
  if (node.id === id) {
    return node;
  }
  
  // Recursive case: search in children (smaller subproblem)
  for (const child of node.children) {
    const found = findRuleById(child, id);
    if (found) {
      return found; // Found in subtree
    }
  }
  
  return null; // Not found
};

/**
 * REGULAR EXPRESSIONS AND GRAMMARS
 */

/**
 * Recursive descent parser for QR code validation
 * 
 * Grammar:
 * QR_CODE := PREFIX IDENTIFIER
 * PREFIX := "SWIMMING-" | "GYM-"
 * IDENTIFIER := [A-Z0-9-]+
 * 
 * @param {string} qrCode - QR code string to parse
 * @returns {Object} - Parsed result or error
 */
export const parseQRCodeRecursive = (qrCode, index = 0) => {
  // Base case: end of string
  if (index >= qrCode.length) {
    return { success: true, index, type: null };
  }
  
  // Try to parse prefix recursively
  const prefixResult = parsePrefix(qrCode, index);
  if (!prefixResult.success) {
    return { success: false, error: 'Invalid prefix', index };
  }
  
  // Parse identifier (rest of string)
  const identifierResult = parseIdentifier(qrCode, prefixResult.index);
  if (!identifierResult.success) {
    return { success: false, error: 'Invalid identifier', index: prefixResult.index };
  }
  
  return {
    success: true,
    prefix: prefixResult.prefix,
    identifier: identifierResult.identifier,
    index: identifierResult.index
  };
};

/**
 * Helper: Parse prefix using recursive pattern matching
 */
const parsePrefix = (str, index) => {
  const prefixes = ['SWIMMING-', 'GYM-'];
  
  for (const prefix of prefixes) {
    if (str.substring(index, index + prefix.length) === prefix) {
      return {
        success: true,
        prefix: prefix.replace('-', ''),
        index: index + prefix.length
      };
    }
  }
  
  return { success: false, index };
};

/**
 * Helper: Parse identifier (alphanumeric and dashes)
 */
const parseIdentifier = (str, index) => {
  const identifierRegex = /^[A-Z0-9-]+/;
  const remaining = str.substring(index);
  const match = remaining.match(identifierRegex);
  
  if (match) {
    return {
      success: true,
      identifier: match[0],
      index: index + match[0].length
    };
  }
  
  return { success: false, index };
};

/**
 * RECURSION: Validating nested time slot schedule
 * 
 * Validates that time slots don't overlap in a hierarchical schedule
 * 
 * @param {Array} timeSlots - Array of time slots
 * @param {number} currentIndex - Current index being checked
 * @param {Array} checkedIndices - Indices already checked
 * @returns {Object} - Validation result
 */
export const validateTimeSlotScheduleRecursive = (timeSlots, currentIndex = 0, checkedIndices = []) => {
  // Base case: checked all slots
  if (currentIndex >= timeSlots.length) {
    return { valid: true, conflicts: [] };
  }
  
  // Skip if already checked
  if (checkedIndices.includes(currentIndex)) {
    return validateTimeSlotScheduleRecursive(timeSlots, currentIndex + 1, checkedIndices);
  }
  
  const currentSlot = timeSlots[currentIndex];
  const conflicts = [];
  
  // Check current slot against all other slots
  for (let i = currentIndex + 1; i < timeSlots.length; i++) {
    if (checkedIndices.includes(i)) continue;
    
    const otherSlot = timeSlots[i];
    
    // Check for overlap
    if (slotsOverlap(currentSlot, otherSlot)) {
      conflicts.push({
        slot1: currentIndex,
        slot2: i,
        reason: 'Time overlap detected'
      });
    }
  }
  
  // Recursive case: validate remaining slots
  const remainingResult = validateTimeSlotScheduleRecursive(
    timeSlots,
    currentIndex + 1,
    [...checkedIndices, currentIndex]
  );
  
  return {
    valid: conflicts.length === 0 && remainingResult.valid,
    conflicts: [...conflicts, ...remainingResult.conflicts]
  };
};

/**
 * Helper: Check if two time slots overlap
 */
const slotsOverlap = (slot1, slot2) => {
  const start1 = parseTimeToMinutes(slot1.start_time);
  const end1 = parseTimeToMinutes(slot1.end_time);
  const start2 = parseTimeToMinutes(slot2.start_time);
  const end2 = parseTimeToMinutes(slot2.end_time);
  
  return !(end1 <= start2 || end2 <= start1);
};

const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * RECURSION: Building attendance history tree
 * 
 * Organizes attendance records into a hierarchical structure by date/time slot
 * 
 * @param {Array} attendanceRecords - Flat array of attendance records
 * @param {string} groupBy - Field to group by ('date' or 'timeSlot')
 * @returns {Object} - Tree structure of attendance
 */
export const buildAttendanceTree = (attendanceRecords, groupBy = 'date') => {
  // Base case: empty records
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return {};
  }
  
  const tree = {};
  
  // Group records
  attendanceRecords.forEach(record => {
    const key = groupBy === 'date' 
      ? record.session_date 
      : record.time_slot_id;
    
    if (!tree[key]) {
      tree[key] = [];
    }
    
    tree[key].push(record);
  });
  
  // Recursive case: if grouping by date, further group by time slot
  if (groupBy === 'date') {
    const groupedTree = {};
    Object.keys(tree).forEach(date => {
      groupedTree[date] = buildAttendanceTree(tree[date], 'timeSlot');
    });
    return groupedTree;
  }
  
  return tree;
};

