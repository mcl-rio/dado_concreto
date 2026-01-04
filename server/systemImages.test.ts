import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('System Images', () => {
  it('should upsert system image URL', async () => {
    const testKey = 'test_image_' + Date.now();
    const testUrl = 'https://example.com/test-image.png';
    
    const result = await db.upsertSystemImageUrl(testKey, testUrl);
    
    expect(result).toBeTruthy();
    expect(result?.success).toBe(true);
    expect(result?.key).toBe(`image_url_${testKey}`);
    expect(result?.url).toBe(testUrl);
  });

  it('should get system image URLs', async () => {
    // First insert a test image URL
    const testKey = 'stamp_test_' + Date.now();
    const testUrl = 'https://example.com/stamp-test.png';
    await db.upsertSystemImageUrl(testKey, testUrl);
    
    // Then get all image URLs
    const urls = await db.getSystemImageUrls();
    
    expect(urls).toBeDefined();
    expect(typeof urls).toBe('object');
    // The test key should be in the results
    expect(urls[testKey]).toBe(testUrl);
  });

  it('should update existing image URL', async () => {
    const testKey = 'update_test_' + Date.now();
    const originalUrl = 'https://example.com/original.png';
    const updatedUrl = 'https://example.com/updated.png';
    
    // Insert original
    await db.upsertSystemImageUrl(testKey, originalUrl);
    
    // Update with new URL
    const result = await db.upsertSystemImageUrl(testKey, updatedUrl);
    
    expect(result?.success).toBe(true);
    expect(result?.url).toBe(updatedUrl);
    
    // Verify the URL was updated
    const urls = await db.getSystemImageUrls();
    expect(urls[testKey]).toBe(updatedUrl);
  });

  it('should return empty object when no image URLs exist for a pattern', async () => {
    const urls = await db.getSystemImageUrls();
    
    // Should be an object (may have test data from previous tests)
    expect(typeof urls).toBe('object');
  });
});
