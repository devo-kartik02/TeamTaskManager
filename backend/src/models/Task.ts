import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'Low' | 'Medium' | 'High';
  assignees: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  deadline?: Date;
  order: number; // For drag and drop ordering within a status column
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['TODO', 'IN_PROGRESS', 'DONE'], 
      default: 'TODO' 
    },
    priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: 'Medium' 
    },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
