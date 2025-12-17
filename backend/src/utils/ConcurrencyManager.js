/**
 * CONCURRENCY MANAGER
 * 
 * Manages concurrent operations to prevent race conditions in multi-user scenarios.
 * Implements two concurrency models:
 * 1. Message Passing (Event-driven coordination via Socket.IO)
 * 2. Shared Memory with Locks (Optimistic/Pessimistic locking)
 * 
 * RACE CONDITIONS PREVENTED:
 * - Multiple users scanning QR code simultaneously for same time slot
 * - Concurrent check-ins exceeding maximum capacity
 * - Simultaneous league registrations when at max capacity
 * - Concurrent payment verifications
 * 
 * CONCURRENCY TESTING:
 * - Provides utilities to simulate concurrent operations
 * - Debug logging for race condition detection
 * - Performance metrics for lock contention
 */

import { getIoInstance } from '../socket/socketManager.js';

/**
 * In-memory lock manager for concurrent operations
 * Uses optimistic locking with version tracking
 */
class LockManager {
  constructor() {
    // Map of resource locks: key -> {locked: boolean, queue: [], version: number, lockedAt: timestamp}
    this.locks = new Map();
    // Map of operation counters for debugging
    this.operationMetrics = new Map();
    // Enable debug logging
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * Acquire a lock for a resource
   * PRECONDITION: resourceKey is valid identifier
   * POSTCONDITION: Lock acquired or added to queue
   * 
   * @param {string} resourceKey - Unique identifier for resource
   * @param {number} timeoutMs - Maximum wait time in milliseconds
   * @returns {Promise<{acquired: boolean, version: number}>}
   */
  async acquireLock(resourceKey, timeoutMs = 5000) {
    const startTime = Date.now();
    
    this.#log(`[LOCK] Attempting to acquire lock: ${resourceKey}`);

    return new Promise((resolve, reject) => {
      const attemptLock = () => {
        if (!this.locks.has(resourceKey)) {
          // Initialize lock
          this.locks.set(resourceKey, {
            locked: true,
            queue: [],
            version: 1,
            lockedAt: Date.now(),
            lockHolder: null
          });
          
          this.#log(`[LOCK] Lock acquired immediately: ${resourceKey} (version 1)`);
          this.#incrementMetric(`${resourceKey}:acquired`);
          
          resolve({ acquired: true, version: 1 });
          return;
        }

        const lock = this.locks.get(resourceKey);

        if (!lock.locked) {
          // Lock is available
          lock.locked = true;
          lock.version++;
          lock.lockedAt = Date.now();
          
          this.#log(`[LOCK] Lock acquired: ${resourceKey} (version ${lock.version})`);
          this.#incrementMetric(`${resourceKey}:acquired`);
          
          resolve({ acquired: true, version: lock.version });
          return;
        }

        // Lock is held, check timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= timeoutMs) {
          this.#log(`[LOCK] Lock acquisition timeout: ${resourceKey} (waited ${elapsed}ms)`);
          this.#incrementMetric(`${resourceKey}:timeout`);
          
          resolve({ acquired: false, version: lock.version });
          return;
        }

        // Add to queue and retry
        this.#log(`[LOCK] Lock held, queuing: ${resourceKey} (queue size: ${lock.queue.length + 1})`);
        this.#incrementMetric(`${resourceKey}:queued`);
        
        setTimeout(attemptLock, 50); // Retry after 50ms
      };

      attemptLock();
    });
  }

  /**
   * Release a lock for a resource
   * PRECONDITION: Lock was previously acquired
   * POSTCONDITION: Lock released, next queued operation can proceed
   * 
   * @param {string} resourceKey - Unique identifier for resource
   */
  releaseLock(resourceKey) {
    if (!this.locks.has(resourceKey)) {
      this.#log(`[LOCK] Warning: Attempting to release non-existent lock: ${resourceKey}`);
      return;
    }

    const lock = this.locks.get(resourceKey);
    lock.locked = false;
    
    const holdTime = Date.now() - lock.lockedAt;
    this.#log(`[LOCK] Lock released: ${resourceKey} (held for ${holdTime}ms)`);
    this.#incrementMetric(`${resourceKey}:released`);

    // Clean up if no queue
    if (lock.queue.length === 0) {
      // Keep lock metadata but mark as unlocked
      // This preserves version history for optimistic locking
    }
  }

  /**
   * Check if operation can proceed with optimistic locking
   * PRECONDITION: version is from previous read
   * POSTCONDITION: Returns true if no concurrent modification
   * 
   * @param {string} resourceKey - Resource identifier
   * @param {number} expectedVersion - Expected version number
   * @returns {boolean}
   */
  checkVersion(resourceKey, expectedVersion) {
    if (!this.locks.has(resourceKey)) {
      return true; // No version tracking yet
    }

    const lock = this.locks.get(resourceKey);
    const matches = lock.version === expectedVersion;
    
    if (!matches) {
      this.#log(`[VERSION] Version mismatch for ${resourceKey}: expected ${expectedVersion}, got ${lock.version}`);
      this.#incrementMetric(`${resourceKey}:version_conflict`);
    }

    return matches;
  }

  /**
   * Get current version for a resource
   * @param {string} resourceKey - Resource identifier
   * @returns {number}
   */
  getVersion(resourceKey) {
    if (!this.locks.has(resourceKey)) {
      return 0;
    }
    return this.locks.get(resourceKey).version;
  }

  /**
   * Get operation metrics for debugging
   * @returns {Object}
   */
  getMetrics() {
    const metrics = {};
    for (const [key, value] of this.operationMetrics.entries()) {
      metrics[key] = value;
    }
    return metrics;
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics() {
    this.operationMetrics.clear();
    this.#log('[METRICS] Metrics reset');
  }

  /**
   * Increment operation metric counter
   * @private
   */
  #incrementMetric(key) {
    const current = this.operationMetrics.get(key) || 0;
    this.operationMetrics.set(key, current + 1);
  }

  /**
   * Debug logging
   * @private
   */
  #log(message) {
    if (this.debugMode) {
      console.log(`[ConcurrencyManager] ${message}`);
    }
  }
}

/**
 * Singleton instance of lock manager
 */
const lockManager = new LockManager();

/**
 * Execute operation with pessimistic locking
 * Acquires lock before operation, releases after
 * 
 * PRECONDITIONS: resourceKey is a string, operation is an async function, timeout is a positive number
 * POSTCONDITIONS: Returns {success: true, data: result, version} if lock acquired and operation succeeds, or {success: false, error, reason} if lock timeout or operation fails; lock is always released in finally block
 * 
 * @param {string} resourceKey - Unique identifier for resource
 * @param {Function} operation - Async function to execute
 * @param {number} timeout - Lock timeout in milliseconds
 * @returns {Promise<Object>}
 */
export async function withLock(resourceKey, operation, timeout = 5000) {
  const lockResult = await lockManager.acquireLock(resourceKey, timeout);

  if (!lockResult.acquired) {
    return {
      success: false,
      error: 'Failed to acquire lock',
      reason: 'timeout',
      resourceKey
    };
  }

  try {
    const result = await operation(lockResult.version);
    return {
      success: true,
      data: result,
      version: lockResult.version
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      reason: 'operation_failed',
      resourceKey
    };
  } finally {
    lockManager.releaseLock(resourceKey);
  }
}

/**
 * Execute operation with optimistic locking
 * Checks version before committing changes
 * 
 * @param {string} resourceKey - Unique identifier for resource
 * @param {Function} readOperation - Function to read current state
 * @param {Function} writeOperation - Function to write new state
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>}
 */
export async function withOptimisticLock(resourceKey, readOperation, writeOperation, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    // Read current state and version
    const version = lockManager.getVersion(resourceKey);
    const currentState = await readOperation();

    // Perform computation
    const newState = await writeOperation(currentState);

    // Attempt to commit with version check
    const lockResult = await lockManager.acquireLock(resourceKey, 100);
    
    if (!lockResult.acquired) {
      // Lock timeout, retry
      continue;
    }

    try {
      // Check if version is still valid
      if (lockManager.checkVersion(resourceKey, version)) {
        // No concurrent modification, commit changes
        return {
          success: true,
          data: newState,
          version: lockResult.version,
          attempts: attempt
        };
      } else {
        // Version conflict, retry
        lockManager.releaseLock(resourceKey);
        continue;
      }
    } finally {
      if (lockResult.acquired) {
        lockManager.releaseLock(resourceKey);
      }
    }
  }

  return {
    success: false,
    error: 'Failed after maximum retries',
    reason: 'version_conflicts',
    attempts: attempt,
    resourceKey
  };
}

/**
 * Broadcast event to all connected clients (message passing concurrency)
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function broadcastEvent(event, data) {
  const io = getIoInstance();
  if (io) {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Broadcast event to specific room (message passing concurrency)
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function broadcastToRoom(room, event, data) {
  const io = getIoInstance();
  if (io) {
    io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Notify specific user (message passing concurrency)
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function notifyUser(userId, event, data) {
  broadcastToRoom(`user:${userId}`, event, data);
}

/**
 * Get lock manager metrics (for debugging)
 * @returns {Object}
 */
export function getConcurrencyMetrics() {
  return lockManager.getMetrics();
}

/**
 * Reset concurrency metrics (for testing)
 */
export function resetConcurrencyMetrics() {
  lockManager.resetMetrics();
}

/**
 * Check if resource is currently locked
 * @param {string} resourceKey - Resource identifier
 * @returns {boolean}
 */
export function isLocked(resourceKey) {
  if (!lockManager.locks.has(resourceKey)) {
    return false;
  }
  return lockManager.locks.get(resourceKey).locked;
}

export default {
  withLock,
  withOptimisticLock,
  broadcastEvent,
  broadcastToRoom,
  notifyUser,
  getConcurrencyMetrics,
  resetConcurrencyMetrics,
  isLocked
};

