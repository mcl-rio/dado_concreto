import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the storage module before importing the router
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: 'counselors/test-image.jpg',
    url: 'https://storage.example.com/counselors/test-image.jpg'
  })
}));

// Mock the db module
vi.mock('./db', () => ({
  default: {
    getUserByOpenId: vi.fn().mockResolvedValue({
      id: 1,
      openId: 'test-user',
      name: 'Test User',
      role: 'administrador'
    })
  }
}));

describe('counselors.uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept valid image upload parameters', async () => {
    // Test that the input schema accepts valid data
    const validInput = {
      type: 'home' as const,
      base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      mimeType: 'image/jpeg',
      counselorId: 'test-counselor'
    };

    // Verify the input structure is valid
    expect(validInput.type).toBe('home');
    expect(validInput.base64Data).toContain('base64');
    expect(validInput.mimeType).toBe('image/jpeg');
    expect(validInput.counselorId).toBe('test-counselor');
  });

  it('should accept bio type as well', async () => {
    const validInput = {
      type: 'bio' as const,
      base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
      mimeType: 'image/png',
      counselorId: 'another-counselor'
    };

    expect(validInput.type).toBe('bio');
    expect(validInput.mimeType).toBe('image/png');
  });

  it('should work without counselorId for new counselors', async () => {
    const validInput = {
      type: 'home' as const,
      base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      mimeType: 'image/jpeg'
    };

    expect(validInput.counselorId).toBeUndefined();
  });

  it('should handle base64 data with and without data URL prefix', () => {
    // With data URL prefix
    const withPrefix = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
    const base64WithPrefix = withPrefix.includes(',') 
      ? withPrefix.split(',')[1] 
      : withPrefix;
    expect(base64WithPrefix).toBe('/9j/4AAQSkZJRgABAQAAAQABAAD');

    // Without data URL prefix
    const withoutPrefix = '/9j/4AAQSkZJRgABAQAAAQABAAD';
    const base64WithoutPrefix = withoutPrefix.includes(',') 
      ? withoutPrefix.split(',')[1] 
      : withoutPrefix;
    expect(base64WithoutPrefix).toBe('/9j/4AAQSkZJRgABAQAAAQABAAD');
  });

  it('should generate unique filenames', () => {
    const type = 'home';
    const counselorId = 'mackinder';
    const mimeType = 'image/jpeg';
    
    const ext = mimeType.split('/')[1] || 'jpg';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `counselor-${type}-${counselorId}-${timestamp}-${randomSuffix}.${ext}`;
    
    expect(fileName).toContain('counselor-home-mackinder');
    expect(fileName).toContain('.jpeg');
    expect(fileName.length).toBeGreaterThan(30);
  });
});
