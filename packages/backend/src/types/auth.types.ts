import { BaseEntity } from './common.types';

export interface UserEntity extends BaseEntity {
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  isActive: boolean;
  lastLoginAt: Date | null;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isActive: boolean;
  iat?: number;
  exp?: number;
}

export interface EmailVerificationTokenEntity extends BaseEntity {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt: Date | null;
}

export interface PasswordResetTokenEntity extends BaseEntity {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}


export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: UserProfile;
  tokens?: AuthTokens;
}


export interface TokenValidationResult {
  isValid: boolean;
  user?: UserEntity;
  error?: string;
}