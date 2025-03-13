type PaginateOptions = { page: number; limit: number; total: number };

export const paginator = ({ page, limit, total }: PaginateOptions) => {
  const lastPage = Math.ceil(total / limit);
  page = Number(page);
  limit = Number(limit);
  total = Number(total);
  return {
    total,
    lastPage,
    currentPage: page,
    perPage: limit,
    prev: page > 1 ? page - 1 : null,
    next: page < lastPage ? page + 1 : null,
  };
};
