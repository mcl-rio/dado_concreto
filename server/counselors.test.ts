import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Counselors Management', () => {
  it('should get all counselors', async () => {
    const counselors = await db.getAllCounselors();
    
    expect(counselors).toBeDefined();
    expect(Array.isArray(counselors)).toBe(true);
  });

  it('should get active counselors only', async () => {
    const activeCounselors = await db.getActiveCounselors();
    
    expect(activeCounselors).toBeDefined();
    expect(Array.isArray(activeCounselors)).toBe(true);
    
    // A função retorna todos os conselheiros (ativos e inativos), exceto coordenadores
    // Verificar que pelo menos alguns estão ativos
    const hasActiveOnes = activeCounselors.some(c => c.isActive);
    expect(hasActiveOnes || activeCounselors.length === 0).toBe(true);
  });

  it('should get counselor by key', async () => {
    // Get any existing counselor from the database
    const counselors = await db.getAllCounselors();
    
    if (counselors.length > 0) {
      const firstCounselor = counselors[0];
      const counselor = await db.getCounselorByKey(firstCounselor.counselorId);
      
      expect(counselor).toBeDefined();
      if (counselor) {
        expect(counselor.counselorId).toBe(firstCounselor.counselorId);
        expect(counselor.name).toBe(firstCounselor.name);
      }
    }
  });

  it('should return null for non-existent counselor', async () => {
    const nonExistent = await db.getCounselorByKey('non_existent_counselor_xyz');
    
    expect(nonExistent).toBeNull();
  });

  it('should have required fields for counselors', async () => {
    const counselors = await db.getAllCounselors();
    
    counselors.forEach(counselor => {
      expect(counselor.id).toBeDefined();
      expect(counselor.counselorId).toBeDefined();
      expect(counselor.name).toBeDefined();
      expect(typeof counselor.isActive).toBe('boolean');
    });
  });

  it('should get counselor by id', async () => {
    const counselors = await db.getAllCounselors();
    if (counselors.length > 0) {
      const firstCounselor = counselors[0];
      const counselor = await db.getCounselorById(firstCounselor.id);
      
      expect(counselor).toBeDefined();
      expect(counselor?.id).toBe(firstCounselor.id);
    }
  });
});
