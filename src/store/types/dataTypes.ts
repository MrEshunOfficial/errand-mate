// src/types/base.ts
import { Types } from "mongoose";

export interface BaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/category.ts
export interface Category extends BaseEntity {
  categoryName: string;
  description?: string;
  catImage?: {
    url: string;
    catName: string;
  };
  tags?: string[];
  serviceIds: Types.ObjectId[]; // Changed from string[] to Types.ObjectId[]
  serviceCount?: number;
}

export interface Service extends BaseEntity {
  title: string;
  description: string;
  categoryId: Types.ObjectId; // Changed from string to Types.ObjectId
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular: boolean;
  isActive: boolean;
  tags?: string[];
}

// src/types/composed.ts - For when you need populated data
export interface CategoryWithServices extends Omit<Category, "serviceIds"> {
  services: Service[];
}

export interface ServiceWithCategory extends Service {
  category: Pick<Category, "_id" | "categoryName" | "description" | "catImage">;
}

// src/types/operations.ts - For CRUD operations
export interface CreateServiceInput {
  title: string;
  description: string;
  categoryId: Types.ObjectId; // Changed from string to Types.ObjectId
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular?: boolean;
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  _id: Types.ObjectId;
}

export interface CreateCategoryInput {
  categoryName: string;
  description?: string;
  catImage?: {
    url: string;
    catName: string;
  };
  tags?: string[];
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  _id: Types.ObjectId;
}

// For API responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ServiceFilters {
  categoryId?: Types.ObjectId; // Changed from string to Types.ObjectId
  isActive?: boolean;
  popular?: boolean;
  search?: string;
}

// src/types/user.ts
export interface ContactDetails {
  primaryContact: string;
  secondaryContact: string;
  email: string;
}

export interface IdDetails {
  idType: string;
  idNumber: string;
  idFile: {
    url: string;
    fileName: string;
  };
}

export interface clientLocation {
  gpsAddress: string;
  nearbyLandmark: string;
  region: string;
  city: string;
  district: string;
  locality: string;
}

export interface ProfilePicture {
  url: string;
  fileName: string;
}

export interface SocialMediaHandle {
  nameOfSocial: string;
  userName: string;
}

// Base user interface
export interface BaseUser extends BaseEntity {
  userId: string;
  fullName: string;
  contactDetails: ContactDetails;
  idDetails: IdDetails;
  location: clientLocation;
  profilePicture: ProfilePicture;
  socialMediaHandles?: SocialMediaHandle[];
}

// Service request/history interfaces
export interface ServiceRequest {
  requestId: Types.ObjectId;
  serviceId: Types.ObjectId;
  date: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  requestNumber: string;
}

export interface ServiceRating {
  serviceId: Types.ObjectId;
  rating: number;
  review: string;
  date: Date;
}

// Client-specific interfaces
export interface ClientServiceRequest extends ServiceRequest {
  serviceProvider: {
    providerId: Types.ObjectId;
    name: string;
    phone: string;
    email: string;
    profilePicture: ProfilePicture;
  };
}

export interface ClientData extends BaseUser {
  serviceRequestHistory?: ClientServiceRequest[];
  serviceProviderRating?: (ServiceRating & {
    providerId: Types.ObjectId;
  })[];
}

// Provider-specific interfaces
export interface WitnessDetails {
  fullName: string;
  phone: string;
  idType: string;
  idNumber: string;
  relationship: string;
}

export interface ProviderContactDetails extends ContactDetails {
  emergencyContact: string;
}

export interface ProviderServiceRequest extends ServiceRequest {
  clientId: Types.ObjectId;
}

export interface ProviderRating extends ServiceRating {
  clientId: Types.ObjectId;
  requestId: Types.ObjectId;
}

export interface ServiceProviderData extends Omit<BaseUser, 'contactDetails'> {
  contactDetails: ProviderContactDetails;
  witnessDetails: WitnessDetails[];
  serviceRendering?: Types.ObjectId[];
  serviceHistory?: ProviderServiceRequest[];
  clientRating?: ProviderRating[];
}

// Composed interfaces for populated data
export interface ClientDataWithServices extends Omit<ClientData, 'serviceRequestHistory'> {
  serviceRequestHistory?: (Omit<ClientServiceRequest, 'serviceId'> & {
    service: {
      _id: Types.ObjectId;
      title: string;
      categoryId: Types.ObjectId;
      category: {
        categoryName: string;
        catImage?: { url: string; catName: string; };
      };
    };
  })[];
}

export interface ProviderDataWithServices extends Omit<ServiceProviderData, 'serviceRendering' | 'serviceHistory'> {
  serviceRendering: Array<{
    _id: Types.ObjectId;
    title: string;
    category: {
      categoryName: string;
      catImage?: { url: string; catName: string; };
    };
  }>;
  serviceHistory?: (Omit<ProviderServiceRequest, 'serviceId'> & {
    service: {
      _id: Types.ObjectId;
      title: string;
      category: { categoryName: string; };
    };
  })[];
}

// API operation interfaces
export type CreateClientInput = Omit<ClientData, keyof BaseEntity | 'serviceRequestHistory' | 'serviceProviderRating'>;

export interface UpdateClientInput extends Partial<CreateClientInput> {
  _id: Types.ObjectId;
}

export type CreateProviderInput = Omit<ServiceProviderData, keyof BaseEntity | 'serviceHistory' | 'clientRating'>;

export interface UpdateProviderInput extends Partial<CreateProviderInput> {
  _id: Types.ObjectId;
}

// Alternative: If you prefer explicit interfaces, define the required fields
export interface CreateClientInputExplicit {
  userId: string;
  fullName: string;
  contactDetails: ContactDetails;
  idDetails: IdDetails;
  location: clientLocation;
  profilePicture: ProfilePicture;
  socialMediaHandles?: SocialMediaHandle[];
}

export interface CreateProviderInputExplicit {
  userId: string;
  fullName: string;
  contactDetails: ProviderContactDetails;
  witnessDetails: WitnessDetails[];
  idDetails: IdDetails;
  location: clientLocation;
  profilePicture: ProfilePicture;
  serviceRendering: Types.ObjectId[];
  socialMediaHandles?: SocialMediaHandle[];
}
