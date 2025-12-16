/**
 * CONCURRENCY TESTING UTILITIES
 * 
 * Tools for testing and debugging concurrent operations.
 * 
 * FEATURES:
 * - Simulate concurrent requests
 * - Detect race conditions
 * - Performance benchmarking
 * - Debug logging for concurrent operations
 * 
 * WHY CONCURRENCY IS HARD TO TEST:
 * 1. Non-deterministic execution order
 * 2. Timing-dependent bugs (heisenbugs)
 * 3. Difficult to reproduce failures
 * 4. State observation changes behavior
 * 
 * WHY CONCURRENCY IS HARD TO DEBUG:
 * 1. Race conditions are intermittent
 * 2. Adding logging can change timing and hide bugs
 * 3. Breakpoints serialize execution
 * 4. Production environments have different timing
 */

import { getConcurrencyMetrics, resetConcurrencyMetrics } from './ConcurrencyManager.js';

/**
 * Simulate concurrent requests
 * Useful for testing race conditions
 * 
 * @param {Function} operation - Async operation to execute concurrently
 * @param {number} concurrency - Number of concurrent executions
 * @param {Array} params - Parameters for each execution
 * @returns {Promise<Object>} Results with timing and success/failure data
 */
export async function simulateConcurrentRequests(operation, concurrency, params = []) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('CONCURRENCY TEST: Starting simulation');
  console.log(`Concurrency Level: ${concurrency}`);
  console.log(`Operation: ${operation.name || 'anonymous'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Reset metrics before test
  resetConcurrencyMetrics();

  const startTime = Date.now();
  const promises = [];
  const results = [];

  // Create concurrent operations
  for (let i = 0; i < concurrency; i++) {
    const param = params[i] || i;
    const operationStartTime = Date.now();

    const promise = operation(param)
      .then(result => {
        const duration = Date.now() - operationStartTime;
        results.push({
          index: i,
          success: true,
          result: result,
          duration: duration,
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        const duration = Date.now() - operationStartTime;
        results.push({
          index: i,
          success: false,
          error: error.message,
          duration: duration,
          timestamp: new Date().toISOString()
        });
      });

    promises.push(promise);
  }

  // Wait for all operations to complete
  await Promise.all(promises);

  const totalDuration = Date.now() - startTime;

  // Analyze results
  const analysis = analyzeResults(results, totalDuration);

  // Get concurrency metrics
  const metrics = getConcurrencyMetrics();

  console.log(`\n${'='.repeat(60)}`);
  console.log('CONCURRENCY TEST: Results');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log(`Successful Operations: ${analysis.successCount}/${concurrency}`);
  console.log(`Failed Operations: ${analysis.failureCount}/${concurrency}`);
  console.log(`Average Duration: ${analysis.avgDuration.toFixed(2)}ms`);
  console.log(`Min Duration: ${analysis.minDuration}ms`);
  console.log(`Max Duration: ${analysis.maxDuration}ms`);
  console.log(`\nConcurrency Metrics:`);
  console.log(JSON.stringify(metrics, null, 2));
  console.log(`${'='.repeat(60)}\n`);

  return {
    results,
    analysis,
    metrics,
    totalDuration
  };
}

/**
 * Analyze test results
 * @private
 */
function analyzeResults(results, totalDuration) {
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  // Check for potential race conditions
  const raceConditionIndicators = detectRaceConditionIndicators(results);

  return {
    successCount,
    failureCount,
    avgDuration,
    minDuration,
    maxDuration,
    totalDuration,
    raceConditionIndicators
  };
}

/**
 * Detect potential race condition indicators
 * @private
 */
function detectRaceConditionIndicators(results) {
  const indicators = [];

  // Indicator 1: Failures with "exceeded capacity" or "already checked in"
  const capacityErrors = results.filter(r => 
    !r.success && (
      r.error?.includes('capacity') || 
      r.error?.includes('maximum') ||
      r.error?.includes('full')
    )
  ).length;

  if (capacityErrors > 0) {
    indicators.push({
      type: 'capacity_errors',
      count: capacityErrors,
      description: 'Capacity-related errors may indicate proper lock handling OR over-booking if locks fail'
    });
  }

  // Indicator 2: Duplicate check-in errors
  const duplicateErrors = results.filter(r => 
    !r.success && (
      r.error?.includes('already') || 
      r.error?.includes('duplicate')
    )
  ).length;

  if (duplicateErrors > 0) {
    indicators.push({
      type: 'duplicate_errors',
      count: duplicateErrors,
      description: 'Duplicate errors may indicate race conditions in uniqueness checks'
    });
  }

  // Indicator 3: High variance in operation duration (suggests lock contention)
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > avgDuration * 0.5) {
    indicators.push({
      type: 'high_duration_variance',
      stdDev: stdDev.toFixed(2),
      avgDuration: avgDuration.toFixed(2),
      description: 'High variance in operation duration suggests lock contention'
    });
  }

  return indicators;
}

/**
 * Test race condition scenario: Multiple users checking into same time slot
 * 
 * This test helps verify:
 * - Lock mechanism prevents over-capacity
 * - Only one user gets the last spot
 * - Proper error messages for rejected users
 * 
 * @param {Function} checkInOperation - Function(userId, timeSlotId) to check in
 * @param {string} timeSlotId - Time slot ID to test
 * @param {number} capacity - Expected capacity
 * @param {number} concurrentUsers - Number of concurrent check-in attempts
 * @returns {Promise<Object>}
 */
export async function testCapacityRaceCondition(checkInOperation, timeSlotId, capacity, concurrentUsers) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('RACE CONDITION TEST: Capacity Enforcement');
  console.log(`Time Slot: ${timeSlotId}`);
  console.log(`Capacity: ${capacity}`);
  console.log(`Concurrent Users: ${concurrentUsers}`);
  console.log(`${'='.repeat(60)}\n`);

  // Create fake user IDs
  const userIds = Array.from({ length: concurrentUsers }, (_, i) => `test-user-${i}`);

  // Simulate concurrent check-ins
  const result = await simulateConcurrentRequests(
    async (userId) => {
      return await checkInOperation(userId, timeSlotId);
    },
    concurrentUsers,
    userIds
  );

  // Verify results
  const successfulCheckIns = result.results.filter(r => r.success).length;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('RACE CONDITION TEST: Verification');
  console.log(`${'='.repeat(60)}`);
  console.log(`Expected successful check-ins: <= ${capacity}`);
  console.log(`Actual successful check-ins: ${successfulCheckIns}`);
  
  if (successfulCheckIns <= capacity) {
    console.log('✓ PASS: Capacity constraint maintained');
  } else {
    console.log('✗ FAIL: Over-capacity! Race condition detected!');
  }
  console.log(`${'='.repeat(60)}\n`);

  return {
    ...result,
    passed: successfulCheckIns <= capacity,
    expectedCapacity: capacity,
    actualCheckIns: successfulCheckIns,
    overCapacity: Math.max(0, successfulCheckIns - capacity)
  };
}

/**
 * Test optimistic locking with version conflicts
 * 
 * @param {Function} operation - Function(resourceKey) that uses optimistic locking
 * @param {string} resourceKey - Resource to test
 * @param {number} concurrency - Number of concurrent operations
 * @returns {Promise<Object>}
 */
export async function testOptimisticLocking(operation, resourceKey, concurrency) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('OPTIMISTIC LOCKING TEST');
  console.log(`Resource: ${resourceKey}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log(`${'='.repeat(60)}\n`);

  const result = await simulateConcurrentRequests(operation, concurrency);

  // Count version conflicts
  const versionConflicts = result.results.filter(r => 
    !r.success && r.error?.includes('version')
  ).length;

  console.log(`\nVersion Conflicts Detected: ${versionConflicts}`);
  console.log(`Retries from Metrics: ${result.metrics['version_conflict'] || 0}`);

  return {
    ...result,
    versionConflicts
  };
}

/**
 * Benchmark operation with different concurrency levels
 * 
 * @param {Function} operation - Operation to benchmark
 * @param {Array<number>} concurrencyLevels - Array of concurrency levels to test
 * @returns {Promise<Array>}
 */
export async function benchmarkConcurrency(operation, concurrencyLevels = [1, 5, 10, 20, 50]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('CONCURRENCY BENCHMARK');
  console.log(`Operation: ${operation.name || 'anonymous'}`);
  console.log(`Concurrency Levels: ${concurrencyLevels.join(', ')}`);
  console.log(`${'='.repeat(60)}\n`);

  const results = [];

  for (const level of concurrencyLevels) {
    console.log(`\n--- Testing concurrency level: ${level} ---`);
    
    const result = await simulateConcurrentRequests(operation, level);
    
    results.push({
      concurrencyLevel: level,
      totalDuration: result.totalDuration,
      avgDuration: result.analysis.avgDuration,
      successRate: (result.analysis.successCount / level) * 100,
      throughput: (level / result.totalDuration) * 1000 // Operations per second
    });

    // Wait between tests to avoid interference
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('BENCHMARK SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log('Concurrency | Duration | Avg Time | Success Rate | Throughput');
  console.log('-'.repeat(60));
  
  for (const r of results) {
    console.log(
      `${r.concurrencyLevel.toString().padEnd(11)} | ` +
      `${r.totalDuration.toString().padEnd(8)}ms | ` +
      `${r.avgDuration.toFixed(2).padEnd(8)}ms | ` +
      `${r.successRate.toFixed(1).padEnd(12)}% | ` +
      `${r.throughput.toFixed(2)} ops/s`
    );
  }
  console.log(`${'='.repeat(60)}\n`);

  return results;
}

/**
 * Debug concurrent operation
 * Adds detailed logging to understand execution order
 * 
 * @param {Function} operation - Operation to debug
 * @param {number} concurrency - Number of concurrent executions
 * @returns {Promise<Object>}
 */
export async function debugConcurrentOperation(operation, concurrency) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('CONCURRENT OPERATION DEBUG');
  console.log(`${'='.repeat(60)}\n`);

  const events = [];

  const wrappedOperation = async (index) => {
    const logEvent = (type, data) => {
      events.push({
        index,
        type,
        data,
        timestamp: Date.now()
      });
    };

    logEvent('START', { index });

    try {
      const result = await operation(index);
      logEvent('SUCCESS', { result });
      return result;
    } catch (error) {
      logEvent('ERROR', { error: error.message });
      throw error;
    } finally {
      logEvent('END', { index });
    }
  };

  const result = await simulateConcurrentRequests(wrappedOperation, concurrency);

  // Sort events by timestamp
  events.sort((a, b) => a.timestamp - b.timestamp);

  // Print execution timeline
  console.log('\nEXECUTION TIMELINE:');
  console.log('-'.repeat(60));
  
  const startTime = events[0].timestamp;
  for (const event of events) {
    const relativeTime = (event.timestamp - startTime).toString().padStart(6, ' ');
    console.log(`[+${relativeTime}ms] Op ${event.index}: ${event.type}`);
  }

  return {
    ...result,
    events,
    timeline: events
  };
}

export default {
  simulateConcurrentRequests,
  testCapacityRaceCondition,
  testOptimisticLocking,
  benchmarkConcurrency,
  debugConcurrentOperation
};

