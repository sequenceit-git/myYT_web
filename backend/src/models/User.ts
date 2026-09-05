import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  avatar?: string;
  role: 'campaigner' | 'viewer' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  balance: number; // In USD Cash Funds
  viewerBalance: number; // In USD Watch Earnings available for cashout
  creatorBalance: number; // In USD Ad Budget deposited for buying views
  credits: number; // Watch Reward Credits (e.g. 10s = 10 Credits)
  totalCreditsEarned: number;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  phoneNumber?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String },
    role: { type: String, enum: ['campaigner', 'viewer', 'admin'], default: 'viewer' },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    balance: { type: Number, default: 0, min: 0 },
    viewerBalance: { type: Number, default: 0, min: 0 },
    creatorBalance: { type: Number, default: 0, min: 0 },
    credits: { type: Number, default: 0, min: 0 },
    totalCreditsEarned: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    trustScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
