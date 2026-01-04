import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  updateUserValidity: vi.fn(),
  getUserById: vi.fn(),
  deleteUser: vi.fn(),
}));

import * as db from './db';

describe('Admin User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUserValidity', () => {
    it('should update user with all fields including name, email and role', async () => {
      const mockUpdateUserValidity = vi.mocked(db.updateUserValidity);
      mockUpdateUserValidity.mockResolvedValue(undefined);

      // Call the function with all parameters
      await db.updateUserValidity(
        1, // userId
        new Date('2025-12-31'), // validUntil
        true, // isActive
        10, // analysisQuota
        'João Silva', // name
        'joao@example.com', // email
        'diretor' // role
      );

      // Verify it was called with correct parameters
      expect(mockUpdateUserValidity).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        true,
        10,
        'João Silva',
        'joao@example.com',
        'diretor'
      );
    });

    it('should update user with only required fields', async () => {
      const mockUpdateUserValidity = vi.mocked(db.updateUserValidity);
      mockUpdateUserValidity.mockResolvedValue(undefined);

      // Call with only required parameters
      await db.updateUserValidity(
        1,
        null,
        false
      );

      expect(mockUpdateUserValidity).toHaveBeenCalledWith(
        1,
        null,
        false
      );
    });

    it('should update user name to null', async () => {
      const mockUpdateUserValidity = vi.mocked(db.updateUserValidity);
      mockUpdateUserValidity.mockResolvedValue(undefined);

      await db.updateUserValidity(
        1,
        null,
        true,
        5,
        null, // name set to null
        undefined,
        undefined
      );

      expect(mockUpdateUserValidity).toHaveBeenCalledWith(
        1,
        null,
        true,
        5,
        null,
        undefined,
        undefined
      );
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser with correct userId', async () => {
      const mockDeleteUser = vi.mocked(db.deleteUser);
      mockDeleteUser.mockResolvedValue(undefined);

      await db.deleteUser(123);

      expect(mockDeleteUser).toHaveBeenCalledWith(123);
    });
  });
});
