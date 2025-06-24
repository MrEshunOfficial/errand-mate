// src/models/Provider.ts
import { Schema, Types } from 'mongoose';
import { BaseUser, BaseUserDocument, FeatureLevel, ProfileCompletionStatus } from './BaseUser';

// Witness details schema
const witnessDetailsSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  idType: { type: String, required: true },
  idNumber: { type: String, required: true },
  relationship: { type: String, required: true }
}, { _id: false });

// Provider service request schema
const providerServiceRequestSchema = new Schema({
  requestId: { type: Types.ObjectId, required: true },
  serviceId: { type: Types.ObjectId, required: true },
  clientId: { type: Types.ObjectId, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    required: true 
  },
  requestNumber: { type: String, required: true }
}, { _id: false });

// Provider rating schema
const providerRatingSchema = new Schema({
  serviceId: { type: Types.ObjectId, required: true },
  clientId: { type: Types.ObjectId, required: true },
  requestId: { type: Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  date: { type: Date, required: true }
}, { _id: false });

// Provider document interface
export interface ProviderDocument extends BaseUserDocument {
  witnessDetails?: Array<typeof witnessDetailsSchema>;
  serviceRendering?: Types.ObjectId[];
  serviceHistory?: Array<typeof providerServiceRequestSchema>;
  clientRating?: Array<typeof providerRatingSchema>;
  
  // Provider-specific feature access methods
  canAcceptServiceRequests(): boolean;
  canReceivePayments(): boolean;
  canAccessProviderDashboard(): boolean;
  requiresWitnessDetails(): boolean;
}

// Provider-specific schema
const providerSchema = new Schema({
  witnessDetails: [witnessDetailsSchema],
  serviceRendering: [{ type: Types.ObjectId, ref: 'Service' }],
  serviceHistory: [providerServiceRequestSchema],
  clientRating: [providerRatingSchema]
});

// Provider-specific methods
providerSchema.methods.canAcceptServiceRequests = function(): boolean {
  return this.featureLevel === FeatureLevel.FULL || this.featureLevel === FeatureLevel.VERIFIED;
};

providerSchema.methods.canReceivePayments = function(): boolean {
  return this.featureLevel === FeatureLevel.VERIFIED && this.idDetails?.verified;
};

providerSchema.methods.canAccessProviderDashboard = function(): boolean {
  return this.featureLevel !== FeatureLevel.BASIC;
};

providerSchema.methods.requiresWitnessDetails = function(): boolean {
  return this.serviceRendering && this.serviceRendering.length > 0;
};

// Override profile completion for providers with higher requirements
providerSchema.methods.calculateProfileCompletion = function(): ProfileCompletionStatus {
  // Get base completion data first
  const sections: Record<string, boolean> = {
    basicInfo: !!(this.fullName && this.contactDetails?.primaryContact && this.contactDetails?.email),
    contactDetails: !!(this.contactDetails?.secondaryContact),
    location: !!(this.location?.gpsAddress && this.location?.district && this.location?.locality),
    identification: !!(this.idDetails?.idType && this.idDetails?.idNumber && this.idDetails?.idFile?.url),
    profilePicture: !!(this.profilePicture?.url),
    verification: !!(this.idDetails?.verified),
    // Provider-specific requirements
    witnessDetails: !!(this.witnessDetails && this.witnessDetails.length >= 2),
    serviceOffering: !!(this.serviceRendering && this.serviceRendering.length > 0),
    emergencyContact: !!(this.contactDetails?.emergencyContact)
  };
  
  const completedSections = Object.entries(sections)
    .filter(([, completed]) => completed)
    .map(([section]) => section);
  
  const missingSections = Object.entries(sections)
    .filter(([, completed]) => !completed)
    .map(([section]) => section);
  
  const completionPercentage = Math.round((completedSections.length / Object.keys(sections).length) * 100);
  
  return {
    isComplete: completionPercentage >= 85, // Higher threshold for providers
    completionPercentage,
    completedSections,
    missingSections,
    lastUpdated: new Date()
  };
};

// Create and export the Provider model as a discriminator
export const Provider = BaseUser.discriminator<ProviderDocument>('Provider', providerSchema);