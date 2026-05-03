
import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import { paginate } from "../utils/paginate.js";

const ALLOWED_SORT_FIELDS = new Set([
  "created_at", "updated_at", "due_date", "start_date",
  "priority", "status", "order_index", "title",
]);

export const getTasks = async (req, res) => {
  try {
    const { project_id, status, priority, sort_by, sort_order, page, limit } = req.query;

    const filter = {};
    if (project_id) {
      filter.project_id = project_id;
    } else {
      const projects = await Project.find({ user_id: req.userId }).select("_id").lean();
      filter.project_id = { $in: projects.map((project) => project._id) };
    }

    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const safeSortBy = ALLOWED_SORT_FIELDS.has(sort_by) ? sort_by : "created_at";

    let data;
    let total;

    if (page) {
      const result = await paginate(Task, {
        filter,
        sort_by: safeSortBy,
        sort_order,
        page,
        limit: limit || 20,
        populate: "tags",
      });
      data = result.data;
      total = result.total;
    } else {
      data = await Task.find(filter)
        .sort({ [safeSortBy]: sort_order === "asc" ? 1 : -1 })
        .populate("tags")
        .lean();
      total = data.length;
    }

    res.json({
      success: true,
      data,
      meta: { total },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, status, priority, due_date, start_date, order_index, tags } = req.body;

    if (!project_id) return res.status(400).json({ success: false, message: "project_id is required" });
    if (!title)      return res.status(400).json({ success: false, message: "title is required" });

    const project = await Project.findOne({ _id: project_id, user_id: req.userId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const task = await Task.create({
      project_id, title, description,
      status, priority, due_date, start_date, order_index, tags,
    });

    const populatedTask = await task.populate("tags");
    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, start_date, order_index, tags } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, status, priority, due_date, start_date, order_index, tags },
      { new: true, runValidators: true }
    ).populate("tags");

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.status = task.status === "done" ? "todo" : "done";
    await task.save();
    await task.populate("tags");

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





export const createSubTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.subtasks.push({ title });
    await task.save();

    res.status(201).json({ success: true, data: task.subtasks.at(-1) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleSubTask = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const subtask = task.subtasks.id(subId);
    if (!subtask) return res.status(404).json({ success: false, message: "Subtask not found" });

    if (task.status === "done") {
      return res.status(400).json({ success: false, message: "Cannot toggle subtask of a completed task" });
    }

    subtask.is_done = !subtask.is_done;
    await task.save();

    res.json({ success: true, data: subtask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSubTask = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { title, is_done } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const subtask = task.subtasks.id(subId);
    if (!subtask) return res.status(404).json({ success: false, message: "Subtask not found" });

    if (task.status === "done" && is_done !== undefined) {
      return res.status(400).json({ success: false, message: "Cannot update subtask status of a completed task" });
    }

    if (title   !== undefined) subtask.title   = title;
    if (is_done !== undefined) subtask.is_done = is_done;

    await task.save();

    res.json({ success: true, data: subtask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSubTask = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const subtask = task.subtasks.id(subId);
    if (!subtask) return res.status(404).json({ success: false, message: "Subtask not found" });

    subtask.deleteOne();
    await task.save();

    res.json({ success: true, message: "Subtask deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getTasksByDateRange = async (req, res) => {
  try {
    const { project_id, start, end } = req.query;

    if (!start || !end) return res.status(400).json({ success: false, message: "start and end date are required" });

    const filter = {
      status: { $ne: "done" },
    };

    if (project_id && project_id !== "all") {
      filter.project_id = project_id;
    } else {
      const projects = await Project.find({ user_id: req.userId }).select("_id").lean();
      filter.project_id = { $in: projects.map((p) => p._id) };
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Lấy task có start_date hoặc due_date nằm trong range,
    // hoặc task kéo dài qua toàn bộ range (start trước, end sau)
    const tasks = await Task.find({
      ...filter,
      $or: [
        { due_date:   { $gte: startDate, $lte: endDate } },
        { start_date: { $gte: startDate, $lte: endDate } },
        { start_date: { $lte: startDate }, due_date: { $gte: endDate } },
      ],
    })
      .sort({ start_date: 1, due_date: 1 })
      .lean();

    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
