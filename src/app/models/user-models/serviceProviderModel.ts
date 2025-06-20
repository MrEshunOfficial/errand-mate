// src/models/user-models/serviceProviderModel.ts
import { ProviderContactDetails, WitnessDetails, ProviderServiceRequest, ProviderRating, IdDetails, clientLocation, ProfilePicture, SocialMediaHandle, ServiceProviderData } from "@/store/type/dataTypes";
import { Schema, model, models, Document, Types, Model } from "mongoose";
import { idDetailsSchema, locationSchema, profilePictureSchema, socialMediaHandleSchema } from "../shared-schemas/common-schemas";

// Reuse schemas from client model where applicable
const providerContactDetailsSchema = new Schema<ProviderContactDetails>({
  primaryContact: { type: String, required: true, trim: true },
  secondaryContact: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  emergencyContact: { type: String, required: true, trim: true },
}, { _id: false });

const witnessDetailsSchema = new Schema<WitnessDetails>({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  idType: { type: String, required: true, trim: true },
  idNumber: { type: String, required: true, trim: true },
  relationship: { type: String, required: true, trim: true },
}, { _id: false });

const providerServiceRequestSchema = new Schema<ProviderServiceRequest>({
  requestId: { type: Schema.Types.ObjectId, required: true },
  serviceId: { type: Schema.Types.ObjectId, required: true, ref: "Service" },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'] 
  },
  requestNumber: { type: String, required: true, trim: true },
  clientId: { type: Schema.Types.ObjectId, required: true, ref: "Client" },
}, { _id: false });

const providerRatingSchema = new Schema<ProviderRating>({
  serviceId: { type: Schema.Types.ObjectId, required: true, ref: "Service" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  clientId: { type: Schema.Types.ObjectId, required: true, ref: "Client" },
  requestId: { type: Schema.Types.ObjectId, required: true },
}, { _id: false });

export interface IServiceProviderDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  fullName: string;
  contactDetails: ProviderContactDetails;
  witnessDetails: WitnessDetails[];
  idDetails: IdDetails;
  location: clientLocation;
  profilePicture: ProfilePicture;
  socialMediaHandles?: SocialMediaHandle[];
  serviceRendering?: Types.ObjectId[];
  serviceHistory?: ProviderServiceRequest[];
  clientRating?: ProviderRating[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new Schema<IServiceProviderDocument>(
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
      type: providerContactDetailsSchema,
      required: true,
    },
    witnessDetails: {
      type: [witnessDetailsSchema],
      required: true,
      validate: {
        validator: function(arr: WitnessDetails[]) {
          return arr && arr.length >= 1;
        },
        message: 'At least one witness is required'
      }
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
    serviceRendering: [{
      type: Schema.Types.ObjectId,
      ref: "Service"
    }],
    serviceHistory: [providerServiceRequestSchema],
    clientRating: [providerRatingSchema],
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
serviceProviderSchema.index({ userId: 1 }, { unique: true });
serviceProviderSchema.index({ "contactDetails.email": 1 });
serviceProviderSchema.index({ "contactDetails.primaryContact": 1 });
serviceProviderSchema.index({ "location.region": 1, "location.city": 1 });
serviceProviderSchema.index({ serviceRendering: 1 });
serviceProviderSchema.index({ createdAt: -1 });

// Virtual for populated services
serviceProviderSchema.virtual("services", {
  ref: "Service",
  localField: "serviceRendering",
  foreignField: "_id",
});

// Static method to transform to ServiceProviderData interface
serviceProviderSchema.statics.transformToServiceProviderData = function (
  doc: IServiceProviderDocument
): ServiceProviderData {
  if (!doc) return doc;
  return {
    _id: doc._id,
    userId: doc.userId,
    fullName: doc.fullName,
    contactDetails: doc.contactDetails,
    witnessDetails: doc.witnessDetails,
    idDetails: doc.idDetails,
    location: doc.location,
    profilePicture: doc.profilePicture,
    socialMediaHandles: doc.socialMediaHandles,
    serviceRendering: doc.serviceRendering,
    serviceHistory: doc.serviceHistory,
    clientRating: doc.clientRating,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export interface IServiceProviderModel extends Model<IServiceProviderDocument> {
  transformToServiceProviderData(doc: IServiceProviderDocument): ServiceProviderData;
}

// Safe model creation
let ServiceProviderModel: IServiceProviderModel;

if (typeof window === 'undefined') {
  ServiceProviderModel = (models?.ServiceProvider as IServiceProviderModel) || 
    model<IServiceProviderDocument, IServiceProviderModel>("ServiceProvider", serviceProviderSchema);
} else {
  ServiceProviderModel = {
    transformToServiceProviderData: (doc: IServiceProviderDocument): ServiceProviderData => {
      if (!doc) return doc;
      return {
        _id: doc._id,
        userId: doc.userId,
        fullName: doc.fullName,
        contactDetails: doc.contactDetails,
        witnessDetails: doc.witnessDetails,
        idDetails: doc.idDetails,
        location: doc.location,
        profilePicture: doc.profilePicture,
        socialMediaHandles: doc.socialMediaHandles,
        serviceRendering: doc.serviceRendering,
        serviceHistory: doc.serviceHistory,
        clientRating: doc.clientRating,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  } as IServiceProviderModel;
}

export { ServiceProviderModel };