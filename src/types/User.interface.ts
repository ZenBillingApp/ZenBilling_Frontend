export type IOnboardingStep = 'CHOOSING_COMPANY' | 'STRIPE_SETUP' | 'FINISH';

/**
 * Interface utilisateur de base (champs standard)
 */
export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface utilisateur étendue avec les champs Better Auth
 * Utilisée pour le stockage local et la synchronisation
 */
export interface IExtendedUser extends IUser {
  // Champs Better Auth additionnels
  company_id?: string;
  onboarding_completed?: boolean;
  onboarding_step?: IOnboardingStep;
  stripe_account_id?: string;
  stripe_onboarded?: boolean;
}

/**
 * Données utilisateur stockées dans le store Zustand
 * Version partielle pour la flexibilité
 * Note: Accepte null pour compatibilité avec Better Auth
 */
export interface IStoredUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  image?: string | null;
  company_id?: string | null;
  onboarding_completed?: boolean | null;
  onboarding_step?: IOnboardingStep | null;
  stripe_account_id?: string | null;
  stripe_onboarded?: boolean | null;
}

export interface IUpdateUserRequest {
  first_name?: string;
  last_name?: string;
}
