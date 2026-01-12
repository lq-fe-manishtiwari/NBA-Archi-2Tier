/** @format */
/**
 * NBA Cache Service for optimizing API calls and reducing load times
 * Implements memory caching with TTL (Time To Live) and localStorage fallback
 */

export const nbaCacheService = {
  // Memory cache with TTL
  memoryCache: new Map(),
  
  // Default cache settings
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100, // Maximum number of cached items
  
  /**
   * Generate cache key from parameters
   */
  generateKey(prefix, ...params) {
    return `${prefix}_${params.filter(p => p !== null && p !== undefined).join('_')}`;
  },

  /**
   * Set cache with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      // Memory cache
      this.memoryCache.set(key, cacheItem);
      
      // Cleanup old entries if cache is too large
      if (this.memoryCache.size > this.maxCacheSize) {
        this.cleanup();
      }
      
      // localStorage fallback for persistence
      try {
        localStorage.setItem(`nba_cache_${key}`, JSON.stringify(cacheItem));
      } catch (e) {
        console.warn('localStorage cache failed:', e);
      }
      
      console.log(`Cache SET: ${key} (TTL: ${ttl}ms)`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Get cached data if not expired
   */
  get(key) {
    try {
      // Try memory cache first
      let cacheItem = this.memoryCache.get(key);
      
      // Fallback to localStorage
      if (!cacheItem) {
        try {
          const stored = localStorage.getItem(`nba_cache_${key}`);
          if (stored) {
            cacheItem = JSON.parse(stored);
            // Restore to memory cache
            this.memoryCache.set(key, cacheItem);
          }
        } catch (e) {
          console.warn('localStorage cache read failed:', e);
        }
      }
      
      if (!cacheItem) {
        return null;
      }
      
      // Check if expired
      const now = Date.now();
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.delete(key);
        console.log(`Cache EXPIRED: ${key}`);
        return null;
      }
      
      console.log(`Cache HIT: ${key}`);
      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Delete cache entry
   */
  delete(key) {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`nba_cache_${key}`);
    } catch (e) {
      console.warn('localStorage cache delete failed:', e);
    }
  },

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('nba_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('localStorage cache clear failed:', e);
    }
    console.log('Cache cleared');
  },

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const toDelete = [];
    
    this.memoryCache.forEach((value, key) => {
      if (now - value.timestamp > value.ttl) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.delete(key));
    
    // Keep only the most recent entries if still too large
    if (this.memoryCache.size > this.maxCacheSize) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      // Keep only the newest entries
      const toKeep = entries.slice(0, this.maxCacheSize);
      this.memoryCache.clear();
      
      toKeep.forEach(([key, value]) => {
        this.memoryCache.set(key, value);
      });
    }
    
    console.log(`Cache cleanup completed. Size: ${this.memoryCache.size}`);
  },

  /**
   * Cached API call wrapper
   */
  async cachedApiCall(cacheKey, apiCall, ttl = this.defaultTTL) {
    // Try cache first
    const cached = this.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      console.log(`Cache MISS: ${cacheKey} - Making API call`);
      const result = await apiCall();
      
      // Cache the result
      this.set(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.error(`API call failed for ${cacheKey}:`, error);
      throw error;
    }
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      maxSize: this.maxCacheSize,
      defaultTTL: this.defaultTTL
    };
  },

  /**
   * Preload cache with common data
   */
  async preloadCache(preloadConfig) {
    console.log('Starting cache preload...');
    
    const preloadPromises = preloadConfig.map(async (config) => {
      try {
        const { key, apiCall, ttl } = config;
        await this.cachedApiCall(key, apiCall, ttl);
      } catch (error) {
        console.warn(`Preload failed for ${config.key}:`, error);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('Cache preload completed');
  }
};

// Auto cleanup every 10 minutes
setInterval(() => {
  nbaCacheService.cleanup();
}, 10 * 60 * 1000);