export type IOnboardingStep = 'CHOOSING_COMPANY' | 'FINISH';

export interface IUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id?: string;
  onboarding_completed: boolean;
  onboarding_step: IOnboardingStep;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  // email?: string;
}