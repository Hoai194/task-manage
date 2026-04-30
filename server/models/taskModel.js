import { Schema, model, Types } from "mongoose";

const subTaskSchema = new Schema(
  {
    title:   { type: String, required: true },
    is_done: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const taskSchema = new Schema(
  {
    project_id:  { type: Types.ObjectId, ref: "Project", required: true },
    title:       { type: String, required: true },
    description: { type: String },
    status:      { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
    due_date:    { type: Date },
    start_date:  { type: Date },
    order_index: { type: Number, default: 0 },
    images: [
      {
        public_id:  { type: String },
        file_name:  { type: String, required: true },
        file_type:  { type: String },
        file_size:  { type: Number },
        created_at: { type: Date, default: Date.now },
      },
    ],
    subtasks: [subTaskSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("Task", taskSchema);