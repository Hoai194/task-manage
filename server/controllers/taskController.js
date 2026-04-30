
import Task from "../models/taskModel.js";
import { paginate } from "../utils/paginate.js";

const ALLOWED_SORT_FIELDS = new Set([
  "created_at", "updated_at", "due_date", "start_date",
  "priority", "status", "order_index", "title",
]);

export const getTasks = async (req, res) => {
  try {
    const { project_id, status, priority, sort_by, sort_order, page, limit } = req.query;

    if (!project_id) return res.status(400).json({ message: "project_id is required" });

    const filter = { project_id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const safeSortBy = ALLOWED_SORT_FIELDS.has(sort_by) ? sort_by : "created_at";

    const result = await paginate(Task, { filter, sort_by: safeSortBy, sort_order, page, limit });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, status, priority, due_date, start_date, order_index } = req.body;

    if (!project_id) return res.status(400).json({ message: "project_id is required" });
    if (!title)      return res.status(400).json({ message: "title is required" });

    const task = await Task.create({
      project_id, title, description,
      status, priority, due_date, start_date, order_index,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, start_date, order_index } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, status, priority, due_date, start_date, order_index },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





export const createSubTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) return res.status(400).json({ message: "title is required" });

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.subtasks.push({ title });
    await task.save();

    res.status(201).json(task.subtasks.at(-1));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleSubTask = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(subId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    subtask.is_done = !subtask.is_done;
    await task.save();

    res.json(subtask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubTask = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { title, is_done } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(subId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    if (title   !== undefined) subtask.title   = title;
    if (is_done !== undefined) subtask.is_done = is_done;

    await task.save();

    res.json(subtask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubTask = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(subId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    subtask.deleteOne();
    await task.save();

    res.json({ message: "Subtask deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const getTasksByDateRange = async (req, res) => {
  try {
    const { project_id, start, end } = req.query;

    if (!project_id) return res.status(400).json({ message: "project_id is required" });
    if (!start || !end) return res.status(400).json({ message: "start and end date are required" });

    const tasks = await Task.find({
      project_id,
      due_date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    })
      .sort({ due_date: 1 })
      .lean();

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};