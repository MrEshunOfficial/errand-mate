// src/models/index.ts
// Base model exports
export { 
  BaseUser, 
  FeatureLevel, 
  baseUserSchema 
} from './BaseUser';

// Export types separately for isolatedModules compatibility
export type { 
  BaseUserDocument, 
  ProfileCompletionStatus 
} from './BaseUser';

// Client model exports
export { Client } from './Client';
export type { ClientDocument } from './Client';

// Provider model exports
export { Provider } from './Provider';
export type { ProviderDocument } from './Provider';

// Schema methods
export { addBaseUserMethods } from './schemaMethods';

// Utility exports
export { FeatureGate } from '@/utils/FeatureGate';

// Re-export common types for convenience (adjust path as needed)
export type { 
  ContactDetails,
  IdDetails,
  clientLocation,
  ProfilePicture,
  SocialMediaHandle,
  BaseUser as BaseUserType,
  ClientData,
  ServiceProviderData,
  WitnessDetails,
  ProviderContactDetails
} from '@/store/types/dataTypes'; // Adjust this path to match your project structure