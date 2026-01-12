/** @format */
import { nbaAllocationService } from "./NBA-Allocation.service.js";

export const nbaParallelDataService = {
  fetchAllIndicatorDataInParallel,
  fetchBatchDataInParallel,
  createOptimizedPromiseBatch
};

/**
 * Fetches allocated users and completion status for all indicators in parallel
 * @param {Array} keyIndicators - Array of indicator objects with id and nba_criteria_sub_level2_id
 * @param {string} nbaAcademicYear - Academic year for filtering
 * @returns {Promise<Object>} Object containing allocatedUsers, completedStatus, and nba_contributor_allocation_id
 */
async function fetchAllIndicatorDataInParallel(keyIndicators, nbaAcademicYear = null) {
  try {
    console.log("Starting parallel data fetch for indicators:", keyIndicators.length);
    const startTime = performance.now();

    // Create arrays of promises for parallel execution
    const allocatedUsersPromises = keyIndicators.map(indicator => 
      nbaAllocationService.getnbaAllocatedUsersBynbaSublevel2id(
        indicator.nba_criteria_sub_level2_id, 
        nbaAcademicYear, 
        false
      ).then(response => ({
        indicatorId: indicator.id,
        data: response,
        contributorId: Array.isArray(response) && response.length > 0
          ? response[0]?.nba_contributor_allocation_id
          : null
      })).catch(error => {
        console.error(`Error fetching allocated users for indicator ${indicator.id}:`, error);
        return { indicatorId: indicator.id, data: [], contributorId: null };
      })
    );

    const completionStatusPromises = keyIndicators.map(indicator => 
      nbaAllocationService.getnbaAllocatedUsersBynbaSublevel2id(indicator.nba_criteria_sub_level2_id)
        .then(response => ({
          indicatorId: indicator.id,
          completed: response && Array.isArray(response) && response.length > 0 ? response[0].completed : false
        })).catch(error => {
          console.error(`Error fetching completion status for indicator ${indicator.id}:`, error);
          return { indicatorId: indicator.id, completed: false };
        })
    );

    // Execute all promises in parallel
    const [allocatedUsersResults, completionStatusResults] = await Promise.all([
      Promise.all(allocatedUsersPromises),
      Promise.all(completionStatusPromises)
    ]);

    // Process allocated users results
    const allocatedUsers = {};
    let nba_contributor_allocation_id = null;
    
    allocatedUsersResults.forEach(result => {
      allocatedUsers[result.indicatorId] = result.data;
      if (result.contributorId && !nba_contributor_allocation_id) {
        nba_contributor_allocation_id = result.contributorId;
      }
    });

    // Process completion status results
    const completedStatus = {};
    completionStatusResults.forEach(result => {
      completedStatus[result.indicatorId] = result.completed;
    });

    const endTime = performance.now();
    console.log(`Parallel data fetch completed in ${endTime - startTime}ms`);
    console.log("Fetched data for indicators:", Object.keys(allocatedUsers).length);

    return {
      allocatedUsers,
      completedStatus,
      nba_contributor_allocation_id,
      fetchTime: endTime - startTime
    };
    
  } catch (error) {
    console.error("Error in parallel data fetching:", error);
    throw error;
  }
}

/**
 * Fetches data in optimized batches to prevent overwhelming the server
 * @param {Array} keyIndicators - Array of indicator objects
 * @param {string} nbaAcademicYear - Academic year for filtering
 * @param {number} batchSize - Number of concurrent requests (default: 5)
 * @returns {Promise<Object>} Combined results from all batches
 */
async function fetchBatchDataInParallel(keyIndicators, nbaAcademicYear = null, batchSize = 5) {
  try {
    console.log(`Starting batch parallel fetch for ${keyIndicators.length} indicators with batch size ${batchSize}`);
    
    const results = {
      allocatedUsers: {},
      completedStatus: {},
      nba_contributor_allocation_id: null,
      totalFetchTime: 0
    };

    // Process indicators in batches
    for (let i = 0; i < keyIndicators.length; i += batchSize) {
      const batch = keyIndicators.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keyIndicators.length / batchSize)}`);
      
      const batchResult = await fetchAllIndicatorDataInParallel(batch, nbaAcademicYear);
      
      // Merge results
      Object.assign(results.allocatedUsers, batchResult.allocatedUsers);
      Object.assign(results.completedStatus, batchResult.completedStatus);
      
      if (batchResult.nba_contributor_allocation_id && !results.nba_contributor_allocation_id) {
        results.nba_contributor_allocation_id = batchResult.nba_contributor_allocation_id;
      }
      
      results.totalFetchTime += batchResult.fetchTime;
      
      // Small delay between batches to prevent server overload
      if (i + batchSize < keyIndicators.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Batch processing completed in total ${results.totalFetchTime}ms`);
    return results;
    
  } catch (error) {
    console.error("Error in batch parallel data fetching:", error);
    throw error;
  }
}

/**
 * Creates optimized promise batches with error handling and retry logic
 * @param {Array} indicators - Array of indicators
 * @param {Function} apiCall - API call function
 * @param {Object} options - Options for retry and timeout
 * @returns {Promise<Array>} Array of results
 */
async function createOptimizedPromiseBatch(indicators, apiCall, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    timeout = 10000,
    concurrency = 5
  } = options;

  const executeWithRetry = async (indicator, retryCount = 0) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );
      
      const apiPromise = apiCall(indicator);
      const result = await Promise.race([apiPromise, timeoutPromise]);
      
      return {
        indicatorId: indicator.id,
        success: true,
        data: result,
        retryCount
      };
    } catch (error) {
      if (retryCount < maxRetries) {
        console.warn(`Retrying API call for indicator ${indicator.id}, attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return executeWithRetry(indicator, retryCount + 1);
      }
      
      console.error(`Failed API call for indicator ${indicator.id} after ${maxRetries} retries:`, error);
      return {
        indicatorId: indicator.id,
        success: false,
        error: error.message,
        retryCount
      };
    }
  };

  // Process in batches to control concurrency
  const results = [];
  for (let i = 0; i < indicators.length; i += concurrency) {
    const batch = indicators.slice(i, i + concurrency);
    const batchPromises = batch.map(indicator => executeWithRetry(indicator));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}