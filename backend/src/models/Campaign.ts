import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  youtubeUrl: string;
  videoId: string;
  targetViews: number;
  watchDurationSec: number;
  pricePerView: number;
  totalCost: number;
  viewsDelivered: number;
  status: 'pending_payment' | 'active' | 'paused' | 'completed' | 'cancelled';
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'YouTube Video Campaign' },
    youtubeUrl: { type: String, required: true },
    videoId: { type: String, required: true, index: true },
    targetViews: { type: Number, required: true, min: 100 },
    watchDurationSec: { type: Number, required: true },
    pricePerView: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    viewsDelivered: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending_payment', 'active', 'paused', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
