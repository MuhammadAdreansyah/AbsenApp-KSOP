// tests/lib/pagination.test.ts

import {
  validatePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from '@/lib/pagination';

describe('Pagination Utils', () => {
  describe('validatePaginationParams', () => {
    it('should return default values when params are undefined', () => {
      const result = validatePaginationParams(undefined, undefined);
      expect(result).toEqual({ page: 1, limit: 20 });
    });

    it('should return default values when params are invalid', () => {
      const result = validatePaginationParams('invalid', 'invalid');
      expect(result).toEqual({ page: 1, limit: 20 });
    });

    it('should cap limit to 100', () => {
      const result = validatePaginationParams(1, 200);
      expect(result.limit).toBe(100);
    });

    it('should handle string inputs', () => {
      const result = validatePaginationParams('2', '50');
      expect(result).toEqual({ page: 2, limit: 50 });
    });

    it('should handle negative values by defaulting to 1', () => {
      const result = validatePaginationParams(-1, -10);
      expect(result).toEqual({ page: 1, limit: 20 });
    });
  });

  describe('calculateSkip', () => {
    it('should calculate correct skip for first page', () => {
      expect(calculateSkip(1, 20)).toBe(0);
    });

    it('should calculate correct skip for second page', () => {
      expect(calculateSkip(2, 20)).toBe(20);
    });

    it('should calculate correct skip for nth page', () => {
      expect(calculateSkip(5, 20)).toBe(80);
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create correct paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginatedResponse(data, 100, 1, 20);

      expect(result.data).toEqual(data);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should set hasMore to false on last page', () => {
      const data = [{ id: 1 }];
      const result = createPaginatedResponse(data, 20, 1, 20);

      expect(result.pagination.hasMore).toBe(false);
    });
  });
});
