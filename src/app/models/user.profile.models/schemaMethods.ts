// src/models/schemaMethods.ts
import { Schema } from 'mongoose';
import { BaseUserDocument, ProfileCompletionStatus, FeatureLevel } from './BaseUser';

/**
 * Add methods to the base user schema
 * @param schema - The mongoose schema to add methods to
 */
export function addBaseUserMethods(schema: Schema<BaseUserDocument>) {
  // Method for profile completion calculation
  schema.methods.calculateProfileCompletion = function(): ProfileCompletionStatus {
    const sections: Record<string, boolean> = {
      basicInfo: !!(this.fullName && this.contactDetails?.primaryContact && this.contactDetails?.email),
      contactDetails: !!(this.contactDetails?.secondaryContact && (this.userType !== 'provider' || this.contactDetails?.emergencyContact)),
      location: !!(this.location?.gpsAddress && this.location?.district && this.location?.locality),
      identification: !!(this.idDetails?.idType && this.idDetails?.idNumber && this.idDetails?.idFile?.url),
      profilePicture: !!(this.profilePicture?.url),
      verification: !!(this.idDetails?.verified)
    };
    
    // Add provider-specific sections - these will be overridden in Provider model
    if (this.userType === 'provider') {
      // These properties may not exist on base user, but will be available on provider
      interface ProviderFields {
        witnessDetails?: unknown[];
        serviceRendering?: unknown[];
      }
      const providerThis = this as BaseUserDocument & ProviderFields;
      sections.witnessDetails = !!(providerThis.witnessDetails && providerThis.witnessDetails.length > 0);
      sections.serviceOffering = !!(providerThis.serviceRendering && providerThis.serviceRendering.length > 0);
    }
    
    const completedSections = Object.entries(sections)
      .filter(([, completed]) => completed)
      .map(([section]) => section);
    
    const missingSections = Object.entries(sections)
      .filter(([, completed]) => !completed)
      .map(([section]) => section);
    
    const completionPercentage = Math.round((completedSections.length / Object.keys(sections).length) * 100);
    const isComplete = completionPercentage >= 80; // 80% threshold for "complete"
    
    return {
      isComplete,
      completionPercentage,
      completedSections,
      missingSections,
      lastUpdated: new Date()
    };
  };

  // Method to determine feature level
  schema.methods.determineFeatureLevel = function(): FeatureLevel {
    const status = this.calculateProfileCompletion();
    
    if (this.idDetails?.verified && status.completionPercentage >= 90) {
      return FeatureLevel.VERIFIED;
    } else if (status.completionPercentage >= 70 && this.idDetails) {
      return FeatureLevel.FULL;
    } else if (status.completionPercentage >= 40) {
      return FeatureLevel.INTERMEDIATE;
    } else {
      return FeatureLevel.BASIC;
    }
  };

  // Pre-save middleware to update profile status
  schema.pre('save', function(next) {
    // Calculate profile completion
    const completion = this.calculateProfileCompletion();
    this.profileStatus = completion;
    
    // Update feature level
    this.featureLevel = this.determineFeatureLevel();
    
    next();
  });
}