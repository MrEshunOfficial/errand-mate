// src/models/Client.ts
import { Schema, Types } from 'mongoose';
import { BaseUser, BaseUserDocument, FeatureLevel } from './BaseUser';

// Service request history schema
const serviceRequestSchema = new Schema({
  requestId: { type: Types.ObjectId, required: true },
  serviceId: { type: Types.ObjectId, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    required: true 
  },
  requestNumber: { type: String, required: true },
  serviceProvider: {
    providerId: { type: Types.ObjectId, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    profilePicture: {
      url: { type: String },
      fileName: { type: String }
    }
  }
}, { _id: false });

// Service rating schema
const serviceRatingSchema = new Schema({
  serviceId: { type: Types.ObjectId, required: true },
  providerId: { type: Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  date: { type: Date, required: true }
}, { _id: false });

// Client document interface
export interface ClientDocument extends BaseUserDocument {
  serviceRequestHistory?: Array<typeof serviceRequestSchema>;
  serviceProviderRating?: Array<typeof serviceRatingSchema>;
  
  // Feature access methods
  canMakeServiceRequest(): boolean;
  canRateProviders(): boolean;
  canAccessPremiumFeatures(): boolean;
}

// Client-specific schema
const clientSchema = new Schema({
  serviceRequestHistory: [serviceRequestSchema],
  serviceProviderRating: [serviceRatingSchema]
});

// Client-specific feature access methods
clientSchema.methods.canMakeServiceRequest = function(): boolean {
  return this.featureLevel === FeatureLevel.FULL || this.featureLevel === FeatureLevel.VERIFIED;
};

clientSchema.methods.canRateProviders = function(): boolean {
  return this.featureLevel !== FeatureLevel.BASIC;
};

clientSchema.methods.canAccessPremiumFeatures = function(): boolean {
  return this.featureLevel === FeatureLevel.VERIFIED;
};

// Create and export the Client model as a discriminator
export const Client = BaseUser.discriminator<ClientDocument>('Client', clientSchema);