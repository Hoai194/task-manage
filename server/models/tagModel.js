import { Schema, model, Types } from "mongoose";

const tagSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

tagSchema.index({ user_id: 1, name: 1 }, { unique: true });

export default model("Tag", tagSchema);
