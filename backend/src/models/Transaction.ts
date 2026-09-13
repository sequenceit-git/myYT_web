import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'earning' | 'referral_commission' | 'campaign_spend' | 'payout' | 'refund' | 'admin_adjustment' | 'watch_credit' | 'credit_conversion';
  amount: number; // positive for credits, negative for debits
  balanceAfter: number;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string; // campaignId, taskId, payoutId, or TrxID
  gateway?: 'faucetpay' | 'crypto' | 'bkash' | 'nagad' | 'rocket' | 'webmoney' | 'payeer' | 'internal';
  senderAccount?: string;
  receiverAccount?: string;
  proofImage?: string;
  adminNotes?: string;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'deposit',
        'earning',
        'referral_commission',
        'campaign_spend',
        'payout',
        'refund',
        'admin_adjustment',
        'watch_credit',
        'credit_conversion',
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    referenceId: { type: String },
    gateway: {
      type: String,
      enum: ['faucetpay', 'crypto', 'bkash', 'nagad', 'rocket', 'webmoney', 'payeer', 'internal'],
      default: 'internal',
    },
    senderAccount: { type: String },
    receiverAccount: { type: String },
    proofImage: { type: String },
    adminNotes: { type: String },
    processedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
