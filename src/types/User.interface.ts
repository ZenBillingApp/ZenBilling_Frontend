export type IOnboardingStep = 'CHOOSING_COMPANY' | 'FINISH';

export interface IUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  company_id?: string;
  onboarding_completed: boolean;
  onboarding_step: IOnboardingStep;
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
  onboarding_step: IOnboardingStep;
  created_at: string;
  updated_at: string;
} 