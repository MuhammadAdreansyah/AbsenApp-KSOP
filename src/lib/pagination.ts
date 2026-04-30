/**
 * Pagination utility functions
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Validate and normalize pagination parameters
 * @param page - Current page (default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @returns Normalized pagination parameters
 */
export function validatePaginationParams(
  page?: string | number,
  limit?: string | number
): { page: number; limit: number } {
  // Parse page
  let parsedPage = parseInt(String(page || "1"), 10);
  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }

  // Parse limit
  let parsedLimit = parseInt(String(limit || "20"), 10);
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    parsedLimit = 20;
  }
  if (parsedLimit > 100) {
    parsedLimit = 100;
  }

  return { page: parsedPage, limit: parsedLimit };
}

/**
 * Calculate skip value for database queries
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Skip value for Prisma
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create paginated response
 * @param data - Array of items
 * @param total - Total count of items
 * @param page - Current page
 * @param limit - Items per page
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}
