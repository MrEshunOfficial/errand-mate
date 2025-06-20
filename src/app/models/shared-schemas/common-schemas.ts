// Add these schema definitions to your clientModel.ts and serviceProviderModel.ts files

import { Schema } from "mongoose";
import { 
  IdDetails, 
  clientLocation, 
  ProfilePicture, 
  SocialMediaHandle 
} from "@/store/type/dataTypes";

// Schema for ID details
const idDetailsSchema = new Schema<IdDetails>({
  idType: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ['national_id', 'passport', 'drivers_license', 'voters_id'] // Add your valid ID types
  },
  idNumber: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  idFile: {
    url: { 
      type: String, 
      required: true, 
      trim: true 
    },
    fileName: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 255
    },
  },
}, { _id: false });

// Schema for location details
const locationSchema = new Schema<clientLocation>({
  gpsAddress: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200
  },
  nearbyLandmark: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  region: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  city: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  district: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  locality: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
}, { _id: false });

// Schema for profile picture
const profilePictureSchema = new Schema<ProfilePicture>({
  url: { 
    type: String, 
    required: true, 
    trim: true 
  },
  fileName: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 255
  },
}, { _id: false });

// Schema for social media handles
const socialMediaHandleSchema = new Schema<SocialMediaHandle>({
  nameOfSocial: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'whatsapp'], // Add your supported platforms
    maxlength: 50
  },
  userName: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
}, { _id: false });

// Export the schemas for reuse
export {
  idDetailsSchema,
  locationSchema,
  profilePictureSchema,
  socialMediaHandleSchema
};