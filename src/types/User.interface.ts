export interface IUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  company_id?: number;
  onboarding_completed: boolean;
  onboarding_step: 'CHOOSING_COMPANY' | 'CONTACT_INFO' | 'FINISH';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface IUserResponse {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_id?: number;
  onboarding_completed: boolean;
  onboarding_step: string;
  createdAt: Date;
  updatedAt: Date;
} 