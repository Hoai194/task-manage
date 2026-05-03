import Tag from "../models/tagModel.js";
import { paginate } from "../utils/paginate.js";

export const getTags = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(Tag, {
      filter: { user_id: req.userId },
      sort_by: 'name',
      sort_order: 'asc',
      page,
      limit: limit || 20,
    });
    res.json({
      success: true,
      data: result.data,
      meta: { total: result.total, page: result.page, limit: result.limit, total_pages: result.total_pages },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.json({ success: false, message: "Tag name is required" });

    const tag = await Tag.create({ user_id: req.userId, name: name.trim() });
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    res.json({ success: false, message: error.code === 11000 ? "Tag already exists" : error.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.json({ success: false, message: "Tag name is required" });

    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!tag) return res.json({ success: false, message: "Tag not found" });
    res.json({ success: true, data: tag });
  } catch (error) {
    res.json({ success: false, message: error.code === 11000 ? "Tag already exists" : error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!tag) return res.json({ success: false, message: "Tag not found" });

    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
