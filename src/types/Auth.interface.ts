import { IOnboardingStep } from "./User.interface";

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest extends ILoginRequest {
  first_name: string;
  last_name: string;
}

export interface IAuthResponse {
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    company_id?: string;
    onboarding_completed: boolean;
    onboarding_step: IOnboardingStep;
    created_at: string;
    updated_at: string;
  };
} 