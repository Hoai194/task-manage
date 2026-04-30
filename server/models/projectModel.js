import { Schema, model, Types } from "mongoose";

const projectSchema = new Schema(
  {
    user_id:     { type: Types.ObjectId, ref: "User", required: true },
    name:        { type: String, required: true },
    description: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default model("Project", projectSchema);