import cacheManager from '../cacheManager.js';

describe('cacheManager', () => {
  test('set and get with ttl', (done) => {
    cacheManager.set('t1', 'v1', 50);
    const v = cacheManager.get('t1');
    expect(v).toBe('v1');
    setTimeout(() => {
      const v2 = cacheManager.get('t1', null);
      expect(v2).toBe(null);
      done();
    }, 120);
  });
});
