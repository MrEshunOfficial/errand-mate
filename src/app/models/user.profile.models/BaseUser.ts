// src/models/BaseUser.ts
import { Schema, Document, model } from 'mongoose';
import { addBaseUserMethods } from './schemaMethods';

// Profile completion tracking
export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  completedSections: string[];
  missingSections: string[];
  lastUpdated: Date;
}

// Feature access levels
export enum FeatureLevel {
  BASIC = 'basic',           // Can browse, view profiles
  INTERMEDIATE = 'intermediate', // Can contact, basic interactions
  FULL = 'full',            // Can make/accept requests, payments
  VERIFIED = 'verified'     // Full access + verified status
}

// Base interface for common fields
export interface BaseUserDocument extends Document {
  userId: string;
  fullName: string;
  userType: 'client' | 'provider';
  
  // Contact details - progressive completion
  contactDetails: {
    primaryContact: string;
    secondaryContact?: string;
    email: string;
    emergencyContact?: string; // Only for providers
  };
  
  // ID details - optional initially, required for full access
  idDetails?: {
    idType: string;
    idNumber: string;
    idFile: {
      url: string;
      fileName: string;
    };
    verified: boolean;
    verifiedAt?: Date;
  };
  
  // Location - partial initially, complete later
  location: {
    gpsAddress?: string;
    nearbyLandmark?: string;
    region: string;
    city: string;
    district?: string;
    locality?: string;
  };
  
  // Profile completion tracking
  profileStatus: ProfileCompletionStatus;
  featureLevel: FeatureLevel;
  
  // Optional fields
  profilePicture?: {
    url: string;
    fileName: string;
  };
  
  socialMediaHandles?: Array<{
    nameOfSocial: string;
    userName: string;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  
  // Methods
  calculateProfileCompletion(): ProfileCompletionStatus;
  determineFeatureLevel(): FeatureLevel;
}

// Sub-schemas
const contactDetailsSchema = new Schema({
  primaryContact: { type: String, required: true },
  secondaryContact: { type: String },
  email: { type: String, required: true },
  emergencyContact: { type: String } // Only used by providers
}, { _id: false });

const idDetailsSchema = new Schema({
  idType: { type: String, required: true },
  idNumber: { type: String, required: true },
  idFile: {
    url: { type: String, required: true },
    fileName: { type: String, required: true }
  },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date }
}, { _id: false });

const locationSchema = new Schema({
  gpsAddress: { type: String },
  nearbyLandmark: { type: String },
  region: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String },
  locality: { type: String }
}, { _id: false });

const profileCompletionSchema = new Schema({
  isComplete: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedSections: [{ type: String }],
  missingSections: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Base user schema
export const baseUserSchema = new Schema<BaseUserDocument>({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  userType: { type: String, enum: ['client', 'provider'], required: true },
  
  contactDetails: { type: contactDetailsSchema, required: true },
  idDetails: { type: idDetailsSchema },
  location: { type: locationSchema, required: true },
  
  profileStatus: { type: profileCompletionSchema, required: true },
  featureLevel: { 
    type: String, 
    enum: Object.values(FeatureLevel), 
    default: FeatureLevel.BASIC 
  },
  
  profilePicture: {
    url: { type: String },
    fileName: { type: String }
  },
  
  socialMediaHandles: [{
    nameOfSocial: { type: String, required: true },
    userName: { type: String, required: true }
  }],
  
  lastActiveAt: { type: Date }
}, {
  timestamps: true,
  discriminatorKey: 'userType'
});

// Add methods to the schema
addBaseUserMethods(baseUserSchema);

// Export the base model
export const BaseUser = model<BaseUserDocument>('User', baseUserSchema);