import Project from '../models/projectModel.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user_id: req.userId });
    res.json({ success: true, count: projects.length, data: projects });
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
