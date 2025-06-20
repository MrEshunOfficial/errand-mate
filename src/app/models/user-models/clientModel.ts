// src/models/user-models/clientModel.ts
import { ContactDetails, IdDetails, clientLocation, ProfilePicture, SocialMediaHandle, ClientServiceRequest, ClientData } from "@/store/type/dataTypes";
import { Schema, model, models, Document, Types, Model } from "mongoose";

// Sub-schema definitions
const contactDetailsSchema = new Schema<ContactDetails>({
  primaryContact: { type: String, required: true, trim: true },
  secondaryContact: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
}, { _id: false });

const idDetailsSchema = new Schema<IdDetails>({
  idType: { type: String, required: true, trim: true },
  idNumber: { type: String, required: true, trim: true },
  idFile: {
    url: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
  },
}, { _id: false });

const locationSchema = new Schema<clientLocation>({
  gpsAddress: { type: String, required: true, trim: true },
  nearbyLandmark: { type: String, required: true, trim: true },
  region: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  locality: { type: String, required: true, trim: true },
}, { _id: false });

const profilePictureSchema = new Schema<ProfilePicture>({
  url: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, trim: true },
}, { _id: false });

const socialMediaHandleSchema = new Schema<SocialMediaHandle>({
  nameOfSocial: { type: String, required: true, trim: true },
  userName: { type: String, required: true, trim: true },
}, { _id: false });

const clientServiceRequestSchema = new Schema<ClientServiceRequest>({
  requestId: { type: Schema.Types.ObjectId, required: true },
  serviceId: { type: Schema.Types.ObjectId, required: true, ref: "Service" },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'] 
  },
  requestNumber: { type: String, required: true, trim: true },
  serviceProvider: {
    providerId: { type: Schema.Types.ObjectId, required: true, ref: "ServiceProvider" },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    profilePicture: profilePictureSchema,
  },
}, { _id: false });

export interface IClientDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  fullName: string;
  contactDetails: ContactDetails;
  idDetails: IdDetails;
  location: clientLocation;
  profilePicture: ProfilePicture;
  socialMediaHandles?: SocialMediaHandle[];
  serviceRequestHistory?: ClientServiceRequest[];
  serviceProviderRating?: Array<{
    serviceId: Types.ObjectId;
    rating: number;
    review: string;
    date: Date;
    providerId: Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClientDocument>(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true 
    },
    fullName: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100 
    },
    contactDetails: {
      type: contactDetailsSchema,
      required: true,
    },
    idDetails: {
      type: idDetailsSchema,
      required: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    profilePicture: {
      type: profilePictureSchema,
      required: true,
    },
    socialMediaHandles: [socialMediaHandleSchema],
    serviceRequestHistory: [clientServiceRequestSchema],
    serviceProviderRating: [{
      serviceId: { type: Schema.Types.ObjectId, required: true, ref: "Service" },
      rating: { type: Number, required: true, min: 1, max: 5 },
      review: { type: String, required: true, trim: true },
      date: { type: Date, required: true },
      providerId: { type: Schema.Types.ObjectId, required: true, ref: "ServiceProvider" },
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
clientSchema.index({ userId: 1 }, { unique: true });
clientSchema.index({ "contactDetails.email": 1 });
clientSchema.index({ "contactDetails.primaryContact": 1 });
clientSchema.index({ "location.region": 1, "location.city": 1 });
clientSchema.index({ createdAt: -1 });

// Static method to transform to ClientData interface
clientSchema.statics.transformToClientData = function (doc: IClientDocument): ClientData {
  if (!doc) return doc;
  return {
    _id: doc._id,
    userId: doc.userId,
    fullName: doc.fullName,
    contactDetails: doc.contactDetails,
    idDetails: doc.idDetails,
    location: doc.location,
    profilePicture: doc.profilePicture,
    socialMediaHandles: doc.socialMediaHandles,
    serviceRequestHistory: doc.serviceRequestHistory,
    serviceProviderRating: doc.serviceProviderRating,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export interface IClientModel extends Model<IClientDocument> {
  transformToClientData(doc: IClientDocument): ClientData;
}

// Safe model creation
let ClientModel: IClientModel;

if (typeof window === 'undefined') {
  ClientModel = (models?.Client as IClientModel) || 
    model<IClientDocument, IClientModel>("Client", clientSchema);
} else {
  ClientModel = {
    transformToClientData: (doc: IClientDocument): ClientData => {
      if (!doc) return doc;
      return {
        _id: doc._id,
        userId: doc.userId,
        fullName: doc.fullName,
        contactDetails: doc.contactDetails,
        idDetails: doc.idDetails,
        location: doc.location,
        profilePicture: doc.profilePicture,
        socialMediaHandles: doc.socialMediaHandles,
        serviceRequestHistory: doc.serviceRequestHistory,
        serviceProviderRating: doc.serviceProviderRating,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  } as IClientModel;
}

export { ClientModel };