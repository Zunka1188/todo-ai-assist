# API Integration Guide

This document provides a guide for integrating with APIs in this application. The application uses TanStack Query (React Query) with custom enhancements for efficient API data fetching, caching, and state management.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Cache System](#cache-system)
3. [Hooks API](#hooks-api)
4. [Examples](#examples)
5. [Best Practices](#best-practices)

## Core Concepts

The API integration system is built on these principles:

- **Multi-level caching**: Both in-memory cache and React Query cache
- **Optimized request patterns**: Debouncing, deduplication, and automatic retries
- **Automatic invalidation**: Related queries are invalidated on mutations
- **Performance monitoring**: API calls are tracked for performance issues

## Cache System

### In-memory Cache (`appCache`)

The application uses a lightweight in-memory cache system that provides:

- Customizable TTL (Time To Live) for each cache entry
- Automatic expiration of stale data
- Memory consumption monitoring
- Methods for direct cache manipulation

```typescript
// Example usage
import { appCache } from '@/utils/cacheUtils';

// Set a value with 5 minute expiration
appCache.set('user:123', userData, 300);

// Get a value (returns null if expired or not found)
const userData = appCache.get('user:123');

// Check if a key exists and is not expired
if (appCache.has('user:123')) {
  // Use the cached data
}

// Remove a key from cache
appCache.remove('user:123');

// Clean up expired entries
appCache.cleanup();

// Get cache statistics
const stats = appCache.stats();
console.log(`Cache has ${stats.totalItems} items using ~${stats.memoryUsageEstimate}`);
```

### React Query Cache

TanStack Query provides a robust caching layer with:

- Automatic background refetching
- Stale-while-revalidate pattern
- Cache invalidation by query keys
- Garbage collection of unused queries

## Hooks API

### `useCachedQuery`

Enhanced version of `useQuery` that integrates with the in-memory cache.

```typescript
import { useCachedQuery } from '@/hooks/use-cached-query';

function UserProfile({ userId }) {
  const { data, isLoading, error } = useCachedQuery(
    ['user', userId],
    () => fetchUserData(userId),
    {
      cacheTime: 300, // Local cache TTL in seconds
      staleTime: 5 * 60 * 1000, // React Query stale time in milliseconds
      skipLocalCache: false, // Bypass local cache if needed
      retry: 2 // Number of retries
    }
  );
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <UserProfileView user={data} />;
}
```

### `useInvalidateCache`

Hook for invalidating specific queries or the entire cache.

```typescript
import { useInvalidateCache } from '@/hooks/use-cached-query';

function UserSettings() {
  const { invalidateQuery, clearAllQueries } = useInvalidateCache();
  
  const handleUpdateProfile = async (data) => {
    await updateUserProfile(data);
    
    // Invalidate specific query
    invalidateQuery(['user', userId]);
    
    // Other related queries that should be refetched
    invalidateQuery(['userPosts', userId]);
  };
  
  const handleLogout = () => {
    // Clear all cached data
    clearAllQueries();
  };
}
```

### `useCachingMutation`

Hook for mutations with automatic cache invalidation.

```typescript
import { useCachingMutation } from '@/hooks/use-cached-query';

function PostEditor({ postId }) {
  const { mutate, isLoading } = useCachingMutation(
    (data) => updatePost(postId, data),
    {
      // Automatically invalidate these queries after successful mutation
      invalidateQueries: [
        ['post', postId],
        ['postList']
      ],
      onSuccess: (data) => {
        // Handle success (navigate, show toast, etc.)
      },
      onError: (error) => {
        // Handle error
      }
    }
  );
  
  const handleSubmit = (formData) => {
    mutate(formData);
  };
}
```

## Examples

### Fetching and Displaying a List

```typescript
import { useCachedQuery } from '@/hooks/use-cached-query';

function ProductList({ categoryId }) {
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useCachedQuery(
    ['products', categoryId],
    () => fetchProductsByCategory(categoryId),
    {
      cacheTime: 600, // 10 minutes local cache
      staleTime: 2 * 60 * 1000, // 2 minutes until stale in React Query
      refetchOnWindowFocus: true // Refetch when tab becomes active
    }
  );
  
  if (isLoading) return <ProductListSkeleton />;
  if (error) return <ErrorWithRetry error={error} onRetry={refetch} />;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Creating a New Item

```typescript
import { useCachingMutation } from '@/hooks/use-cached-query';

function AddProductForm({ categoryId }) {
  const { mutate, isLoading } = useCachingMutation(
    (productData) => createProduct(productData),
    {
      invalidateQueries: [['products', categoryId]],
      onSuccess: (newProduct) => {
        toast({
          title: "Product Added",
          description: `${newProduct.name} has been added successfully`
        });
        resetForm();
      }
    }
  );
  
  const handleSubmit = (formData) => {
    mutate({ ...formData, categoryId });
  };
}
```

## Best Practices

1. **Use appropriate cache times** based on data volatility:
   - Static data: long cache times (hours or days)
   - Dynamic data: shorter cache times (minutes)
   - Real-time data: minimal caching (seconds) or no caching

2. **Structure query keys** with specificity:
   - Array format: `['entityType', entityId, 'subEntity', params]`
   - Example: `['user', 123, 'posts', { page: 2 }]`

3. **Prefetch critical data** when possible:
   - Use `queryClient.prefetchQuery` for anticipated routes
   - Implement hover prefetching for better UX

4. **Handle loading and error states** consistently:
   - Show skeletons during initial loading
   - Use error boundaries for error handling
   - Provide retry mechanisms

5. **Monitor performance**:
   - Track slow queries
   - Watch cache size
   - Consider optimizations for large datasets
