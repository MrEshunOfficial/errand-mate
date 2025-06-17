// app/models/auth/authModel.ts - Fixed User model

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  role: 'user' | 'admin' | 'super_admin';
  provider?: string;
  providerId?: string;
  isActive: boolean;
  
  // Admin management fields
  promotedBy?: string;
  promotedAt?: Date;
  demotedBy?: string;
  demotedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,      // This already creates a unique index
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // Don't include password by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user',
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials',
  },
  providerId: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Admin management tracking
  promotedBy: {
    type: String, // Email of the person who promoted this user
  },
  promotedAt: {
    type: Date,
  },
  demotedBy: {
    type: String, // Email of the person who demoted this user
  },
  demotedAt: {
    type: Date,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ provider: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for checking if user is admin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin' || this.role === 'super_admin';
});

// Virtual for checking if user is super admin
userSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'super_admin';
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);