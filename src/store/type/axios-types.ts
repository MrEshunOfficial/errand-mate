import { Types } from "mongoose";

// Generic constraint for API data
export type ApiData = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface ApiResponse<T extends ApiData = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface CustomResponse<T extends ApiData = Record<string, unknown>> {
  success: boolean;
  data: T | null;
  error?: ApiError;
  message?: string;
}

// Standardized Axios error handling
export interface StandardAxiosError<T extends ApiData = Record<string, unknown>> extends Error {
  isAxiosError: boolean;
  config?: Record<string, unknown>;
  code?: string;
  request?: XMLHttpRequest | NodeJS.ReadableStream;
  response?: {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string | string[]>;
    config?: Record<string, unknown>;
  };
  toJSON(): Record<string, unknown>;
}

// API Error Response structure
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
}

// Standardized HTTP status codes enum
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

// Request/Response wrapper types
export interface ApiRequest<T extends ApiData = Record<string, unknown>> {
  data?: T;
  params?: Record<string, string | number | boolean>;
  query?: Record<string, string | number | boolean | string[]>;
  headers?: Record<string, string>;
}

export interface ApiSuccessResponse<T extends ApiData = Record<string, unknown>> extends ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponseType {
  success: false;
  error: ApiError;
  data?: never;
  message?: string;
}

export type ApiResult<T extends ApiData = Record<string, unknown>> = ApiSuccessResponse<T> | ApiErrorResponseType;

// Generic API endpoint configuration
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  requiresAuth?: boolean;
  timeout?: number;
}

// API endpoints constants
export const ENDPOINTS = {
  // Client endpoints
  CLIENT_BY_USER_ID: (userId: string) => `/api/client/${userId}`,
  CLIENT_CREATE: '/api/client',
  CLIENT_UPDATE: (id: Types.ObjectId | string) => `/api/client/${id.toString()}`,
  CLIENT_DELETE: (id: Types.ObjectId | string) => `/api/client/${id.toString()}`,
  
  // Provider endpoints
  PROVIDER_BY_USER_ID: (userId: string) => `/api/provider/${userId}`,
  PROVIDER_CREATE: '/api/provider',
  PROVIDER_UPDATE: (id: Types.ObjectId | string) => `/api/provider/${id.toString()}`,
  PROVIDER_DELETE: (id: Types.ObjectId | string) => `/api/provider/${id.toString()}`,
  
  // Service endpoints
  SERVICES: '/api/services',
  SERVICE_BY_ID: (id: Types.ObjectId | string) => `/api/services/${id.toString()}`,
  SERVICE_CREATE: '/api/services',
  SERVICE_UPDATE: (id: Types.ObjectId | string) => `/api/services/${id.toString()}`,
  SERVICE_DELETE: (id: Types.ObjectId | string) => `/api/services/${id.toString()}`,
  SERVICES_BY_CATEGORY: (categoryId: Types.ObjectId | string) => `/api/services/category/${categoryId.toString()}`,
  
  // Category endpoints
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: Types.ObjectId | string) => `/api/categories/${id.toString()}`,
  CATEGORY_CREATE: '/api/categories',
  CATEGORY_UPDATE: (id: Types.ObjectId | string) => `/api/categories/${id.toString()}`,
  CATEGORY_DELETE: (id: Types.ObjectId | string) => `/api/categories/${id.toString()}`,
  CATEGORY_WITH_SERVICES: (id: Types.ObjectId | string) => `/api/categories/${id.toString()}/services`,
  
  // Service Request endpoints
  SERVICE_REQUESTS: '/api/service-requests',
  SERVICE_REQUEST_BY_ID: (id: Types.ObjectId | string) => `/api/service-requests/${id.toString()}`,
  SERVICE_REQUEST_CREATE: '/api/service-requests',
  SERVICE_REQUEST_UPDATE: (id: Types.ObjectId | string) => `/api/service-requests/${id.toString()}`,
  CLIENT_SERVICE_REQUESTS: (clientId: Types.ObjectId | string) => `/api/service-requests/client/${clientId.toString()}`,
  PROVIDER_SERVICE_REQUESTS: (providerId: Types.ObjectId | string) => `/api/service-requests/provider/${providerId.toString()}`,
} as const;

// Type guard functions for better type safety
export function isApiSuccessResponse<T extends ApiData>(
  response: ApiResult<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse<T extends ApiData>(
  response: ApiResult<T>
): response is ApiErrorResponseType {
  return response.success === false;
}

export function isAxiosError<T extends ApiData = Record<string, unknown>>(
  error: unknown
): error is StandardAxiosError<T> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as Record<string, unknown>).isAxiosError === true
  );
}

// Additional utility types for common API operations
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedApiResponse<T extends ApiData> extends ApiSuccessResponse<T[]> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, string | number | boolean | string[]>;
}

// File upload response
export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// Common API operation results
export interface CreateOperationResult {
  id: Types.ObjectId;
  createdAt: string;
}

export interface UpdateOperationResult {
  id: Types.ObjectId;
  updatedAt: string;
  modifiedCount: number;
}

export interface DeleteOperationResult {
  id: Types.ObjectId;
  deletedAt: string;
  deletedCount: number;
}

// Batch operation types
export interface BatchOperationRequest<T extends ApiData> {
  items: T[];
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
  };
}

export interface BatchOperationResult {
  successful: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// Webhook types
export interface WebhookPayload<T extends ApiData = Record<string, unknown>> {
  event: string;
  data: T;
  timestamp: string;
  signature: string;
}

// Rate limiting info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}