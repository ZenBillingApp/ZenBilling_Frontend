import { Company } from "./Company";

export enum Enum {
    "CHOSING_COMPANY",
    "CONTACT_INFO",
    "FINISH"
}


export interface User {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    street_address: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
    Company: Company;
    onboarding_completed: boolean;
    onboarding_step: Enum;

}
