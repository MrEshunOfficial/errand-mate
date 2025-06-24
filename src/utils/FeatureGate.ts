// src/utils/FeatureGate.ts

import { BaseUserDocument, FeatureLevel } from "@/app/models/user.profile.models";

/**
 * Feature access utility class for managing user permissions based on profile completion
 * and verification status
 */
export class FeatureGate {
  /**
   * Check if a user can access a specific feature
   * @param user - The user document to check
   * @param feature - The feature name to check access for
   * @returns boolean indicating if the user can access the feature
   */
  static canAccess(user: BaseUserDocument, feature: string): boolean {
    const featureRequirements: Record<string, FeatureLevel[]> = {
      'browse_services': [FeatureLevel.BASIC, FeatureLevel.INTERMEDIATE, FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'contact_providers': [FeatureLevel.INTERMEDIATE, FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'make_service_request': [FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'accept_service_request': [FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'process_payments': [FeatureLevel.VERIFIED],
      'access_analytics': [FeatureLevel.VERIFIED],
      'priority_support': [FeatureLevel.VERIFIED]
    };
    
    const requiredLevels = featureRequirements[feature];
    return requiredLevels ? requiredLevels.includes(user.featureLevel) : false;
  }
  
  /**
   * Get the minimum profile completion percentage required for a feature
   * @param feature - The feature name
   * @returns The minimum completion percentage required
   */
  static getRequiredCompletion(feature: string): number {
    const completionRequirements: Record<string, number> = {
      'contact_providers': 40,
      'make_service_request': 70,
      'accept_service_request': 70,
      'process_payments': 90,
      'access_analytics': 90
    };
    
    return completionRequirements[feature] || 0;
  }
  
  /**
   * Get all features accessible by a user
   * @param user - The user document
   * @returns Array of feature names the user can access
   */
  static getAccessibleFeatures(user: BaseUserDocument): string[] {
    const allFeatures = [
      'browse_services',
      'contact_providers', 
      'make_service_request',
      'accept_service_request',
      'process_payments',
      'access_analytics',
      'priority_support'
    ];
    
    return allFeatures.filter(feature => this.canAccess(user, feature));
  }
  
  /**
   * Get features that require a higher access level
   * @param user - The user document
   * @returns Array of feature names that require upgrades
   */
  static getRestrictedFeatures(user: BaseUserDocument): string[] {
    const allFeatures = [
      'browse_services',
      'contact_providers',
      'make_service_request', 
      'accept_service_request',
      'process_payments',
      'access_analytics',
      'priority_support'
    ];
    
    return allFeatures.filter(feature => !this.canAccess(user, feature));
  }
  
  /**
   * Check if a user needs to upgrade their profile for a specific feature
   * @param user - The user document
   * @param feature - The feature name
   * @returns Upgrade requirements or null if accessible
   */
  static getUpgradeRequirements(user: BaseUserDocument, feature: string): {
    requiredLevel: FeatureLevel;
    requiredCompletion: number;
    currentCompletion: number;
    missingRequirements: string[];
  } | null {
    if (this.canAccess(user, feature)) {
      return null;
    }
    
    const featureRequirements: Record<string, FeatureLevel[]> = {
      'browse_services': [FeatureLevel.BASIC, FeatureLevel.INTERMEDIATE, FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'contact_providers': [FeatureLevel.INTERMEDIATE, FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'make_service_request': [FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'accept_service_request': [FeatureLevel.FULL, FeatureLevel.VERIFIED],
      'process_payments': [FeatureLevel.VERIFIED],
      'access_analytics': [FeatureLevel.VERIFIED],
      'priority_support': [FeatureLevel.VERIFIED]
    };
    
    const requiredLevels = featureRequirements[feature];
    if (!requiredLevels) return null;
    
    const lowestRequiredLevel = requiredLevels[0];
    const requiredCompletion = this.getRequiredCompletion(feature);
    
    return {
      requiredLevel: lowestRequiredLevel,
      requiredCompletion,
      currentCompletion: user.profileStatus.completionPercentage,
      missingRequirements: user.profileStatus.missingSections
    };
  }
}