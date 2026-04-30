

const SORT_ORDERS = { asc: 1, desc: -1 };

export const paginate = async (model, { filter = {}, sort_by = "created_at", sort_order = "desc", page = 1, limit = 20, populate } = {}) => {
  const safePage  = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;
  const sortDir = SORT_ORDERS[sort_order] ?? -1;

  let query = model.find(filter).sort({ [sort_by]: sortDir }).skip(skip).limit(safeLimit).lean();

  if (populate) query = query.populate(populate);

  const [data, total] = await Promise.all([query, model.countDocuments(filter)]);

  return {
    data,
    total,
    page:        safePage,
    limit:       safeLimit,
    total_pages: Math.ceil(total / safeLimit),
  };
};