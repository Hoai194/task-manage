import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import { paginate } from '../utils/paginate.js';

export const getProjects = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(Project, {
      filter: { user_id: req.userId },
      sort_by: 'created_at',
      sort_order: 'desc',
      page,
      limit: limit || 20,
    });

    const projectIds = result.data.map(p => p._id);
    const counts = await Task.aggregate([
      { $match: { project_id: { $in: projectIds } } },
      { $group: { _id: '$project_id', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => countMap[c._id.toString()] = c.count);

    const dataWithCounts = result.data.map(p => ({
      ...p,
      task_count: countMap[p._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: dataWithCounts,
      meta: { total: result.total, page: result.page, limit: result.limit, total_pages: result.total_pages },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ user_id: req.userId, name, description });
    res.json({ success: true, data: project });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({ _id: id, user_id: req.userId });
    if (!project) return res.json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
