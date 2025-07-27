import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  user: string; // user ID from JWT
  text: string;
  completed: boolean;
  createdAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    user: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ITodo>('Todo', todoSchema);
