import duesToCache from "@/app/lib/cache";

// Cache invalidation utilities for users-with-dues related data
export class CacheInvalidator {
  // Invalidate all users-with-dues cache
  static invalidateUsersDuesCache(): void {
    const deletedCount = duesToCache.invalidateByPattern("users-with-dues");
    console.log(
      `[CACHE INVALIDATE] Cleared ${deletedCount} users-with-dues cache entries`
    );
  }

  // Invalidate cache when user data changes
  static invalidateUserCache(userId?: string): void {
    this.invalidateUsersDuesCache();
    if (userId) {
      const deletedCount = duesToCache.invalidateByPattern(`user-${userId}`);
      console.log(
        `[CACHE INVALIDATE] Cleared ${deletedCount} cache entries for user ${userId}`
      );
    }
  }

  // Invalidate cache when payment data changes
  static invalidatePaymentCache(userId?: string): void {
    this.invalidateUsersDuesCache();
    if (userId) {
      const deletedCount = duesToCache.invalidateByPattern(`payment-${userId}`);
      console.log(
        `[CACHE INVALIDATE] Cleared ${deletedCount} payment cache entries for user ${userId}`
      );
    }
  }

  // Invalidate cache when due data changes
  static invalidateDueCache(userId?: string): void {
    this.invalidateUsersDuesCache();
    if (userId) {
      const deletedCount = duesToCache.invalidateByPattern(`due-${userId}`);
      console.log(
        `[CACHE INVALIDATE] Cleared ${deletedCount} due cache entries for user ${userId}`
      );
    }
  }

  // Invalidate cache when settlement data changes
  static invalidateSettlementCache(userId?: string): void {
    this.invalidateUsersDuesCache();
    if (userId) {
      const deletedCount = duesToCache.invalidateByPattern(
        `settlement-${userId}`
      );
      console.log(
        `[CACHE INVALIDATE] Cleared ${deletedCount} settlement cache entries for user ${userId}`
      );
    }
  }

  // Invalidate all related cache for a user
  static invalidateAllUserRelatedCache(userId: string): void {
    this.invalidateUserCache(userId);
    this.invalidatePaymentCache(userId);
    this.invalidateDueCache(userId);
    this.invalidateSettlementCache(userId);
  }
}

export default CacheInvalidator;
