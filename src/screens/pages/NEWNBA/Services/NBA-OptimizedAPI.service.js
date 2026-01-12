/** @format */
/**
 * NBA Optimized API Service
 * Combines caching, parallel processing, and error handling for maximum performance
 */

import { nbaCacheService } from './NBA-CacheService.js';
import { nbaParallelDataService } from './NBA-ParallelData.service.js';
import { nbaDashboardService } from './NBA-dashboard.service.js';
import { nbaAllocationService } from './NBA-Allocation.service.js';

export const nbaOptimizedAPIService = {
  // Cache TTL configurations (in milliseconds)
  cacheTTL: {
    criteria: 10 * 60 * 1000,        // 10 minutes
    allocations: 5 * 60 * 1000,      // 5 minutes
    users: 3 * 60 * 1000,            // 3 minutes
    profile: 15 * 60 * 1000,         // 15 minutes
    static: 30 * 60 * 1000           // 30 minutes for static data
  },

  /**
   * Optimized getCriteriaByAccrediatedprogramid with caching
   */
  async getCriteriaByAccrediatedprogramidOptimized(nbaAccreditedProgramId) {
    const cacheKey = nbaCacheService.generateKey('criteria_program', nbaAccreditedProgramId);
    
    return nbaCacheService.cachedApiCall(
      cacheKey,
      () => Promise.race([
        nbaDashboardService.getCriteriaByAccrediatedprogramid(nbaAccreditedProgramId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Criteria fetch timeout')), 10000)
        )
      ]),
      this.cacheTTL.criteria
    );
  },

  /**
   * Optimized profile fetching with caching
   */
  async getProfileOptimized(adminProfileService) {
    const cacheKey = nbaCacheService.generateKey('profile', 'current_user');
    
    return nbaCacheService.cachedApiCall(
      cacheKey,
      () => Promise.race([
        adminProfileService.getProfile(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
        )
      ]),
      this.cacheTTL.profile
    );
  },

  /**
   * Optimized allocation fetching for contributors with parallel processing
   */
  async getAllocatedSectionsForContributorOptimized(school_user_id, nbaAcademicYear, nbaAccreditedProgramId) {
    const cacheKey = nbaCacheService.generateKey('contributor_allocations', school_user_id, nbaAcademicYear, nbaAccreditedProgramId);
    
    return nbaCacheService.cachedApiCall(
      cacheKey,
      () => Promise.race([
        (async () => {
          console.log("Fetching contributor allocations with optimization...");
          const startTime = performance.now();
          
          const response = await nbaDashboardService.getAllAllocatedListingContributor(school_user_id, nbaAcademicYear, false);
          const nbaAllocation = response || [];
          
          if (nbaAllocation.length === 0) {
            return [];
          }

          // Process allocations in parallel
          const processedAllocations = await this.processAllocationsInParallel(nbaAllocation, nbaAccreditedProgramId);
          
          const endTime = performance.now();
          console.log(`Contributor allocations processed in ${endTime - startTime}ms`);
          
          return processedAllocations;
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Contributor allocations timeout')), 12000)
        )
      ]),
      this.cacheTTL.allocations
    );
  },

  /**
   * Optimized allocation fetching for sub-coordinators
   */
  async getAllocatedSectionsForSubCoordinatorOptimized(school_user_id, nbaAcademicYear, nbaAccreditedProgramId) {
    const cacheKey = nbaCacheService.generateKey('subcoordinator_allocations', school_user_id, nbaAcademicYear, nbaAccreditedProgramId);
    
    return nbaCacheService.cachedApiCall(
      cacheKey,
      () => Promise.race([
        (async () => {
          console.log("Fetching sub-coordinator allocations with optimization...");
          const startTime = performance.now();
          
          const response = await nbaAllocationService.getAllAllocatedListing(school_user_id, nbaAcademicYear, false);
          const nbaAllocation = response?.nba_allocation || [];
          
          if (nbaAllocation.length === 0) {
            return [];
          }

          // Process allocations in parallel
          const processedAllocations = await this.processSubCoordinatorAllocationsInParallel(nbaAllocation, nbaAccreditedProgramId);
          
          const endTime = performance.now();
          console.log(`Sub-coordinator allocations processed in ${endTime - startTime}ms`);
          
          return processedAllocations;
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sub-coordinator allocations timeout')), 12000)
        )
      ]),
      this.cacheTTL.allocations
    );
  },

  /**
   * Process contributor allocations in parallel
   */
  async processAllocationsInParallel(nbaAllocation, nbaAccreditedProgramId) {
    console.log("Processing contributor allocations:", nbaAllocation);
    
    // Sort allocations
    nbaAllocation.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    
    // Add IDs in parallel
    const idPromises = nbaAllocation.map(async (item) => {
      // Handle different data structures for contributor allocations
      if (item.nba_criteria_sub_level2) {
        // Direct sub-level2 allocation
        item.id = item.nba_criteria_sub_level2.nba_criteria_sub_level2_id || "Unknown";
        item.nba_criteria_id = item.nba_criteria_sub_level2.nba_criteria?.nba_criteria_id || item.id;
        item.criteria_name = item.nba_criteria_sub_level2.nba_criteria?.criteria_name || "Unknown";
        item.sequence = item.nba_criteria_sub_level2.nba_criteria?.sequence || item.sequence || 0;
      } else if (item.nba_criteria) {
        // Direct criteria allocation
        item.id = item.nba_criteria.nba_criteria_id || "Unknown";
        item.nba_criteria_id = item.nba_criteria.nba_criteria_id || "Unknown";
        item.criteria_name = item.nba_criteria.criteria_name || "Unknown";
        item.sequence = item.nba_criteria.sequence || item.sequence || 0;
      } else {
        // Fallback
        item.id = item.nba_criteria_id || "Unknown";
        item.nba_criteria_id = item.nba_criteria_id || "Unknown";
        item.criteria_name = item.criteria_name || "Unknown";
      }
      return item;
    });
    
    const processedItems = await Promise.all(idPromises);
    console.log("Processed contributor items:", processedItems);
    
    // Remove duplicates by criteria_id
    const uniqueList = [...new Map(processedItems.map((item) => [item.nba_criteria_id, item])).values()];
    
    // Filter criteria in parallel - but be more lenient for contributors
    const filterPromises = uniqueList.map(async (element) => {
      const shouldInclude = await this.shouldIncludeAllocation(element, nbaAccreditedProgramId);
      return shouldInclude ? element : null;
    });
    
    const filteredResults = await Promise.all(filterPromises);
    const filteredCriteria = filteredResults.filter(item => item !== null);
    
    console.log("Filtered contributor criteria:", filteredCriteria);
    
    // If no filtered criteria, return all processed items (fallback for contributors)
    const finalCriteria = filteredCriteria.length > 0 ? filteredCriteria : processedItems;
    
    // Remove duplicates again and map to sections
    const uniqueCriteria = [...new Map(finalCriteria.map((item) => [item.nba_criteria_id, item])).values()];
    
    return this.mapToSections(uniqueCriteria);
  },

  /**
   * Process sub-coordinator allocations in parallel
   */
  async processSubCoordinatorAllocationsInParallel(nbaAllocation, nbaAccreditedProgramId) {
    // Sort allocations
    nbaAllocation.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    
    // Process in parallel
    const processPromises = nbaAllocation.map(async (item) => {
      if (!item.nba_criteria) {
        item.id = item.nba_criteria_sub_level1?.nba_criteria_sub_level1_id || "Unknown";
      } else {
        item.id = item.nba_criteria?.nba_criteria_id || "Unknown";
      }
      
      const shouldInclude = await this.shouldIncludeSubCoordinatorAllocation(item, nbaAccreditedProgramId);
      return shouldInclude ? item : null;
    });
    
    const processedResults = await Promise.all(processPromises);
    const filteredCriteria = processedResults.filter(item => item !== null);
    
    // Remove duplicates
    const uniqueCriteria = [...new Map(filteredCriteria.map((item) => [item.nba_criteria_id, item])).values()];
    
    return this.mapToSections(uniqueCriteria);
  },

  /**
   * Check if allocation should be included (contributor)
   */
  async shouldIncludeAllocation(element, nbaAccreditedProgramId) {
    // More flexible matching for contributor allocations
    let criteriaId = null;
    
    // Try multiple paths to find the program ID
    if (element.nba_criteria_sub_level2?.nba_criteria?.nba_accredited_program?.nba_accredited_program_id) {
      criteriaId = element.nba_criteria_sub_level2.nba_criteria.nba_accredited_program.nba_accredited_program_id;
    } else if (element.nba_criteria_sub_level2?.nba_accredited_program?.nba_accredited_program_id) {
      criteriaId = element.nba_criteria_sub_level2.nba_accredited_program.nba_accredited_program_id;
    } else if (element.nba_criteria?.nba_accredited_program?.nba_accredited_program_id) {
      criteriaId = element.nba_criteria.nba_accredited_program.nba_accredited_program_id;
    } else if (element.nba_accredited_program_id) {
      criteriaId = element.nba_accredited_program_id;
    }
    
    console.log("Checking allocation inclusion:", {
      element: element.criteria_name || element.id,
      criteriaId,
      nbaAccreditedProgramId,
      match: criteriaId === nbaAccreditedProgramId
    });
    
    // If no program ID found, include it (fallback for contributors)
    if (!criteriaId) {
      console.warn("No program ID found for allocation, including by default:", element);
      return true;
    }
    
    return nbaAccreditedProgramId === criteriaId;
  },

  /**
   * Check if allocation should be included (sub-coordinator)
   */
  async shouldIncludeSubCoordinatorAllocation(element, nbaAccreditedProgramId) {
    if (!element.nba_criteria_sub_level1) {
      const criteriaId = element.nba_criteria_sub_level1?.nba_criteria?.nba_accredited_program?.nba_accredited_program_id;
      return nbaAccreditedProgramId === criteriaId;
    } else {
      const criteriaId = element.nba_criteria_sub_level1?.nba_accredited_program?.nba_accredited_program_id;
      return nbaAccreditedProgramId === criteriaId;
    }
  },

  /**
   * Map criteria to sections with pathnames
   */
  mapToSections(uniqueCriteria) {
    return uniqueCriteria.map((element) => {
      const section = {
        id: element.nba_criteria_id || element.id || "Unknown",
        name: element.criteria_name || "Unknown",
        sequence: element.sequence || 0,
      };

      // Add pathnames
      if (section.name === "Institutional Information") {
        section.pathname = "/nba-institution";
      } else if (section.name === "Criteria Summary") {
        section.pathname = "/nba-criteria-summary";
      } else if (section.name === "Declaration") {
        section.pathname = "/nba-declaration";
      }

      return section;
    });
  },

  /**
   * Optimized allocated users fetching with parallel processing and caching
   */
  async fetchAllocatedUsersForAllSectionsOptimized(sections, nbaAcademicYear) {
    const cacheKey = nbaCacheService.generateKey('allocated_users_all', sections.map(s => s.id).join(','), nbaAcademicYear);
    
    return nbaCacheService.cachedApiCall(
      cacheKey,
      () => Promise.race([
        (async () => {
          console.log("Fetching allocated users for all sections in parallel...");
          const startTime = performance.now();
          
          // Create parallel promises for all sections with individual timeouts
          const userPromises = sections.map(async (section) => {
            try {
              const users = await Promise.race([
                nbaAllocationService.getNBAAllocatedUsersBySublevel1ID(section.id, nbaAcademicYear, false),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error(`User fetch timeout for section ${section.id}`)), 5000)
                )
              ]);
              return { sectionId: section.id, users };
            } catch (error) {
              console.error(`Error fetching users for section ${section.id}:`, error);
              return { sectionId: section.id, users: [] };
            }
          });
          
          const results = await Promise.all(userPromises);
          
          // Convert to object format
          const allocatedUsers = {};
          results.forEach(result => {
            allocatedUsers[result.sectionId] = result.users;
          });
          
          const endTime = performance.now();
          console.log(`All allocated users fetched in ${endTime - startTime}ms`);
          
          return allocatedUsers;
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('All users fetch timeout')), 15000)
        )
      ]),
      this.cacheTTL.users
    );
  },

  /**
   * Batch preload common data
   */
  async preloadCommonData(nbaAccreditedProgramId, school_user_id, nbaAcademicYear) {
    console.log("Preloading common NBA data...");
    
    const preloadConfig = [
      {
        key: nbaCacheService.generateKey('criteria_program', nbaAccreditedProgramId),
        apiCall: () => nbaDashboardService.getCriteriaByAccrediatedprogramid(nbaAccreditedProgramId),
        ttl: this.cacheTTL.criteria
      }
    ];
    
    if (school_user_id) {
      preloadConfig.push({
        key: nbaCacheService.generateKey('contributor_allocations', school_user_id, nbaAcademicYear, nbaAccreditedProgramId),
        apiCall: () => this.getAllocatedSectionsForContributorOptimized(school_user_id, nbaAcademicYear, nbaAccreditedProgramId),
        ttl: this.cacheTTL.allocations
      });
    }
    
    await nbaCacheService.preloadCache(preloadConfig);
  },

  /**
   * Clear cache for specific program
   */
  clearProgramCache(nbaAccreditedProgramId) {
    const patterns = [
      `criteria_program_${nbaAccreditedProgramId}`,
      `contributor_allocations_*_${nbaAccreditedProgramId}`,
      `subcoordinator_allocations_*_${nbaAccreditedProgramId}`
    ];
    
    patterns.forEach(pattern => {
      // Simple pattern matching for cache keys
      nbaCacheService.memoryCache.forEach((value, key) => {
        if (key.includes(nbaAccreditedProgramId.toString())) {
          nbaCacheService.delete(key);
        }
      });
    });
    
    console.log(`Cache cleared for program ${nbaAccreditedProgramId}`);
  },

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return {
      cache: nbaCacheService.getStats(),
      cacheTTL: this.cacheTTL
    };
  }
};