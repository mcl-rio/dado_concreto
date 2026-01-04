import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('./db', () => ({
  getAllAnalysesWithUsers: vi.fn(),
  getAnalysisHistoryStats: vi.fn(),
}));

import * as db from './db';

describe('Admin History Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllAnalysesWithUsers', () => {
    it('should return analyses with user info', async () => {
      const mockAnalyses = [
        {
          id: 1,
          userId: 1,
          title: 'Test Analysis',
          objective: 'Test objective',
          status: 'completed',
          actualCost: '0.0050',
          totalTokensUsed: 1000,
          executionTime: 30000,
          savedToHistory: true,
          isPaid: false,
          createdAt: new Date('2025-12-28'),
          completedAt: new Date('2025-12-28'),
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: 'pesquisador',
        },
      ];

      (db.getAllAnalysesWithUsers as any).mockResolvedValue({
        analyses: mockAnalyses,
        total: 1,
      });

      const result = await db.getAllAnalysesWithUsers({});

      expect(result.analyses).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.analyses[0].userName).toBe('Test User');
      expect(result.analyses[0].userEmail).toBe('test@example.com');
    });

    it('should filter by userId', async () => {
      (db.getAllAnalysesWithUsers as any).mockResolvedValue({
        analyses: [],
        total: 0,
      });

      await db.getAllAnalysesWithUsers({ userId: 999 });

      expect(db.getAllAnalysesWithUsers).toHaveBeenCalledWith({ userId: 999 });
    });

    it('should filter by status', async () => {
      (db.getAllAnalysesWithUsers as any).mockResolvedValue({
        analyses: [],
        total: 0,
      });

      await db.getAllAnalysesWithUsers({ status: 'completed' });

      expect(db.getAllAnalysesWithUsers).toHaveBeenCalledWith({ status: 'completed' });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      (db.getAllAnalysesWithUsers as any).mockResolvedValue({
        analyses: [],
        total: 0,
      });

      await db.getAllAnalysesWithUsers({ startDate, endDate });

      expect(db.getAllAnalysesWithUsers).toHaveBeenCalledWith({ startDate, endDate });
    });

    it('should support pagination', async () => {
      (db.getAllAnalysesWithUsers as any).mockResolvedValue({
        analyses: [],
        total: 100,
      });

      await db.getAllAnalysesWithUsers({ limit: 20, offset: 40 });

      expect(db.getAllAnalysesWithUsers).toHaveBeenCalledWith({ limit: 20, offset: 40 });
    });
  });

  describe('getAnalysisHistoryStats', () => {
    it('should return statistics', async () => {
      const mockStats = {
        statusCounts: {
          draft: 5,
          processing: 2,
          completed: 10,
          failed: 1,
        },
        totalCost: 0.5,
        totalTokens: 50000,
        userStats: [
          { userId: 1, userName: 'User 1', userEmail: 'user1@test.com', count: 8 },
          { userId: 2, userName: 'User 2', userEmail: 'user2@test.com', count: 5 },
        ],
        dailyStats: [
          { date: '2025-12-27', count: 3 },
          { date: '2025-12-28', count: 5 },
        ],
      };

      (db.getAnalysisHistoryStats as any).mockResolvedValue(mockStats);

      const result = await db.getAnalysisHistoryStats();

      expect(result).not.toBeNull();
      expect(result?.statusCounts.completed).toBe(10);
      expect(result?.totalCost).toBe(0.5);
      expect(result?.userStats).toHaveLength(2);
      expect(result?.dailyStats).toHaveLength(2);
    });

    it('should handle empty database', async () => {
      (db.getAnalysisHistoryStats as any).mockResolvedValue({
        statusCounts: {},
        totalCost: 0,
        totalTokens: 0,
        userStats: [],
        dailyStats: [],
      });

      const result = await db.getAnalysisHistoryStats();

      expect(result?.totalCost).toBe(0);
      expect(result?.userStats).toHaveLength(0);
    });
  });
});
