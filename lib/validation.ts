// utils/validation.ts
import { User, ValidationError, LoginRequest, Organisation } from '@/lib/types';

export const validateUser = (user: Partial<User>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!user.firstName) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!user.lastName) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  if (!user.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (!user.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

export const validateLogin = (loginRequest: Partial<LoginRequest>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!loginRequest.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  if (!loginRequest.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

export const validateOrganisation = (organisation: Partial<Organisation>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!organisation.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  if (organisation.description && typeof organisation.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  return errors;
};
