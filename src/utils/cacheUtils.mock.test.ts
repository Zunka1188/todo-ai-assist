import { appCache } from './cacheUtils';
import { describe, it, expect, beforeEach } from 'vitest';

describe('appCache', () => {
  let cache = appCache;

  beforeEach(() => {
    cache.clear();
  });

  it('should set and get a value', () => {
    cache.set('key', 'value', 60);
    expect(cache.get('key')).toBe('value');
  });

  it('should return null if key does not exist', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should remove a value', () => {
    cache.set('key', 'value', 60);
    cache.remove('key');
    expect(cache.get('key')).toBeNull();
  });

  it('should clear the cache', () => {
    cache.set('key1', 'value1', 60);
    cache.set('key2', 'value2', 60);
    cache.clear();
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });

  it('should expire a value after the specified time', async () => {
    cache.set('key', 'value', 1); // Expires in 1 second
    await new Promise(resolve => setTimeout(resolve, 1500));
    expect(cache.get('key')).toBeNull();
  });

  it('should handle complex objects', () => {
    const obj = { a: 1, b: 'hello' };
    cache.set('object', obj, 60);
    expect(cache.get('object')).toEqual(obj);
  });

  it('should not return expired value immediately after setting', () => {
    cache.set('freshKey', 'freshValue', 1);
    expect(cache.get('freshKey')).toBe('freshValue');
  });

  it('should work with different data types', () => {
    cache.set('string', 'test', 60);
    cache.set('number', 123, 60);
    cache.set('boolean', true, 60);
    cache.set('null', null, 60);
    cache.set('undefined', undefined, 60);

    expect(cache.get('string')).toBe('test');
    expect(cache.get('number')).toBe(123);
    expect(cache.get('boolean')).toBe(true);
    expect(cache.get('null')).toBeNull();
    expect(cache.get('undefined')).toBeUndefined();
  });

  it('should handle concurrent set and get operations', async () => {
    const setPromises = Array.from({ length: 10 }, (_, i) =>
      Promise.resolve().then(() => cache.set(`key${i}`, `value${i}`, 1))
    );

    await Promise.all(setPromises);

    const getPromises = Array.from({ length: 10 }, (_, i) =>
      Promise.resolve().then(() => expect(cache.get(`key${i}`)).toBe(`value${i}`))
    );

    await Promise.all(getPromises);
  });

  it('should handle data eviction correctly', async () => {
    cache.set('data', { user: { id: 1 }, posts: [{ id: 1 }, { id: 2 }] }, 60);
    const data = cache.get('data') as { user: { id: number }, posts: any[] };
    expect(data.user).toEqual({ id: 1 });
    expect(data.posts).toHaveLength(2);
  });
});
