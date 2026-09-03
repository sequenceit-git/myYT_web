import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  campaignId: mongoose.Types.ObjectId;
  viewerId: mongoose.Types.ObjectId;
  videoId: string;
  requiredDurationSec: number;
  rewardAmount: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'expired';
  startedAt?: Date;
  completedAt?: Date;
  actualDurationSec?: number;
  verificationMeta?: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    overlayConfirmed?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    viewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoId: { type: String, required: true },
    requiredDurationSec: { type: Number, required: true },
    rewardAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'failed', 'expired'],
      default: 'assigned',
      index: true,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    actualDurationSec: { type: Number },
    verificationMeta: {
      ip: { type: String },
      userAgent: { type: String },
      deviceId: { type: String },
      overlayConfirmed: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
