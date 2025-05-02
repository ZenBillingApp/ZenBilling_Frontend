export type IOnboardingStep = 'CHOOSING_COMPANY' | 'STRIPE_SETUP' | 'FINISH';

export interface IUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  image: string;
  company_id?: string;
  onboarding_completed: boolean;
  onboarding_step: IOnboardingStep;
  createdAt: Date;
  updatedAt: Date;
  stripe_account_id?: string | null;
  stripe_onboarded: boolean;
}

export interface IUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  // email?: string;
}