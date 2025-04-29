import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheManager, CACHE_KEYS, CACHE_TTL, memoize } from '@/lib/cache';

describe('CacheManager', () => {
  // 타이머 모킹 (setTimeout/setInterval)
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should store and retrieve values correctly', () => {
    const cache = CacheManager.getInstance();
    const testKey = 'test_key';
    const testValue = { data: 'test_value' };
    
    cache.set(testKey, testValue);
    
    const retrievedValue = cache.get(testKey);
    expect(retrievedValue).toEqual(testValue);
  });
  
  it('should return null for non-existent keys', () => {
    const cache = CacheManager.getInstance();
    const nonExistentKey = 'non_existent_key';
    
    const retrievedValue = cache.get(nonExistentKey);
    expect(retrievedValue).toBeNull();
  });
  
  it('should respect TTL of cache items', () => {
    const cache = CacheManager.getInstance();
    const testKey = 'expiring_key';
    const testValue = { data: 'expiring_value' };
    const ttl = 1000; // 1초 TTL
    
    cache.set(testKey, testValue, ttl);
    
    // TTL 전에는 값이 있어야 함
    expect(cache.get(testKey)).toEqual(testValue);
    
    // TTL 후에는 값이 없어야 함
    vi.advanceTimersByTime(ttl + 100);
    expect(cache.get(testKey)).toBeNull();
  });
  
  it('should delete specific keys', () => {
    const cache = CacheManager.getInstance();
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.get('key1')).toEqual('value1');
    expect(cache.get('key2')).toEqual('value2');
    
    cache.delete('key1');
    
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toEqual('value2');
  });
  
  it('should clear all cache', () => {
    const cache = CacheManager.getInstance();
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.get('key1')).toEqual('value1');
    expect(cache.get('key2')).toEqual('value2');
    
    cache.clear();
    
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });
  
  it('should delete keys by pattern', () => {
    const cache = CacheManager.getInstance();
    
    cache.set('prefix_key1', 'value1');
    cache.set('prefix_key2', 'value2');
    cache.set('other_key', 'value3');
    
    const deletedCount = cache.deleteByPattern('prefix_');
    
    expect(deletedCount).toBe(2);
    expect(cache.get('prefix_key1')).toBeNull();
    expect(cache.get('prefix_key2')).toBeNull();
    expect(cache.get('other_key')).toEqual('value3');
  });
  
  it('should clean expired items', () => {
    const cache = CacheManager.getInstance();
    
    cache.set('expiring_key1', 'value1', 1000);
    cache.set('expiring_key2', 'value2', 2000);
    cache.set('non_expiring_key', 'value3', 10000);
    
    // 1.5초 진행 - 첫 번째 키만 만료
    vi.advanceTimersByTime(1500);
    
    const cleanedCount = cache.cleanExpired();
    
    expect(cleanedCount).toBe(1);
    expect(cache.get('expiring_key1')).toBeNull();
    expect(cache.get('expiring_key2')).toEqual('value2');
    expect(cache.get('non_expiring_key')).toEqual('value3');
  });
  
  it('should return correct cache size', () => {
    const cache = CacheManager.getInstance();
    
    cache.clear();
    expect(cache.size()).toBe(0);
    
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.size()).toBe(2);
    
    cache.delete('key1');
    expect(cache.size()).toBe(1);
    
    cache.set('key3', 'value3');
    expect(cache.size()).toBe(2);
  });
});

describe('memoize function', () => {
  let mockFn;
  let memoizedFn;
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    // 프라미스를 반환하는 목 함수 생성
    mockFn = vi.fn().mockImplementation(async (arg) => {
      return `result_for_${arg}`;
    });
    
    // memoize 적용
    memoizedFn = memoize(
      mockFn,
      (arg) => `key_for_${arg}`,
      5000 // 5초 캐시
    );
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    CacheManager.getInstance().clear();
  });
  
  it('should call original function on first call', async () => {
    const result = await memoizedFn('test');
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(result).toBe('result_for_test');
  });
  
  it('should return cached result on subsequent calls', async () => {
    // 첫 번째 호출
    await memoizedFn('test');
    
    // 두 번째 호출 (캐시 사용)
    const result = await memoizedFn('test');
    
    expect(mockFn).toHaveBeenCalledTimes(1); // 함수는 한 번만 호출되어야 함
    expect(result).toBe('result_for_test');
  });
  
  it('should call original function after TTL expires', async () => {
    // 첫 번째 호출
    await memoizedFn('test');
    
    // TTL 시간 경과
    vi.advanceTimersByTime(6000);
    
    // 두 번째 호출 (캐시 만료)
    await memoizedFn('test');
    
    expect(mockFn).toHaveBeenCalledTimes(2); // 함수가 두 번 호출되어야 함
  });
  
  it('should use different cache keys for different arguments', async () => {
    // 서로 다른 인자로 호출
    await memoizedFn('test1');
    await memoizedFn('test2');
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('test1');
    expect(mockFn).toHaveBeenCalledWith('test2');
  });
});

describe('CACHE_KEYS', () => {
  it('should have expected keys', () => {
    expect(CACHE_KEYS).toHaveProperty('ALL_POSTS');
    expect(CACHE_KEYS).toHaveProperty('POSTS_BY_CATEGORY');
    expect(CACHE_KEYS).toHaveProperty('POST_BY_SLUG');
    expect(CACHE_KEYS).toHaveProperty('POST_BY_ID');
    expect(CACHE_KEYS).toHaveProperty('CATEGORY_STATS');
  });
  
  it('should generate correct keys with parameters', () => {
    expect(CACHE_KEYS.POSTS_BY_CATEGORY('crypto-morning')).toBe('posts_by_category:crypto-morning');
    expect(CACHE_KEYS.POST_BY_SLUG('test-post')).toBe('post_by_slug:test-post');
    expect(CACHE_KEYS.POST_BY_ID('123456')).toBe('post_by_id:123456');
  });
});

describe('CACHE_TTL', () => {
  it('should have expected TTL values', () => {
    expect(CACHE_TTL).toHaveProperty('SHORT');
    expect(CACHE_TTL).toHaveProperty('MEDIUM');
    expect(CACHE_TTL).toHaveProperty('LONG');
    expect(CACHE_TTL).toHaveProperty('VERY_LONG');
    
    // 값 타입 확인
    expect(typeof CACHE_TTL.SHORT).toBe('number');
    expect(typeof CACHE_TTL.MEDIUM).toBe('number');
    expect(typeof CACHE_TTL.LONG).toBe('number');
    expect(typeof CACHE_TTL.VERY_LONG).toBe('number');
    
    // 예상 범위 확인
    expect(CACHE_TTL.SHORT).toBeLessThan(CACHE_TTL.MEDIUM);
    expect(CACHE_TTL.MEDIUM).toBeLessThan(CACHE_TTL.LONG);
    expect(CACHE_TTL.LONG).toBeLessThan(CACHE_TTL.VERY_LONG);
  });
});