export interface IUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  company_id?: string;
  onboarding_completed: boolean;
  onboarding_step: 'CHOOSING_COMPANY' | 'CONTACT_INFO' | 'FINISH';
  created_at: string;
  updated_at: string;
}

export interface IUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface IUserResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_id?: string;
  onboarding_completed: boolean;
  onboarding_step: string;
  created_at: string;
  updated_at: string;
} 