export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest extends ILoginRequest {
  first_name: string;
  last_name: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    company_id?: number;
    onboarding_completed: boolean;
    onboarding_step: string;
  };
} 