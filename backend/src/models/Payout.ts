import mongoose, { Schema, Document } from 'mongoose';

export interface IPayout extends Document {
  viewerId: mongoose.Types.ObjectId;
  amount: number;
  method: 'bkash' | 'nagad' | 'crypto' | 'faucetpay' | 'webmoney';
  accountDetails: string; // phone number, crypto address, faucetpay email, etc.
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  adminNotes?: string;
  transactionRef?: string;
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    viewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 }, // e.g. min $1
    method: {
      type: String,
      enum: ['bkash', 'nagad', 'crypto', 'faucetpay', 'webmoney'],
      required: true,
      index: true,
    },
    accountDetails: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String },
    transactionRef: { type: String },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema);
