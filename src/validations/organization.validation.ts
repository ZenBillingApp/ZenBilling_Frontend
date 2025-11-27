import { z } from "zod";

// Schéma Zod pour validation des champs d'organisation côté client (aligné avec le backend)
export const organizationFieldsSchema = z.object({
  name: z.string({
    required_error: "Le nom est requis",
  }).min(1, "Le nom est requis"),
  slug: z.string({
    required_error: "Le slug est requis",
  }).min(1, "Le slug est requis"),
  logo: z.string().optional(),

  siret: z
    .string({
      required_error: "Le SIRET est requis",
    })
    .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres"),
  tva_intra: z
    .string()
    .regex(
      /^FR[0-9A-Z]{2}[0-9]{9}$/,
      "La TVA intracommunautaire doit être au format FR + 11 caractères"
    )
    .optional(),
  tva_applicable: z.boolean({
    required_error: "La TVA applicable est requise",
  }),
  RCS_number: z
    .string({
      required_error: "Le numéro RCS est requis",
    })
    .regex(
      /^[A-Za-z0-9\s-]{1,50}$/,
      "Le numéro RCS doit contenir uniquement des lettres, chiffres, espaces et tirets (max 50 caractères)"
    ),
  RCS_city: z
    .string({
      required_error: "La ville RCS est requise",
    })
    .regex(
      /^[A-Za-zÀ-ÿ\s-]{2,50}$/,
      "La ville RCS doit contenir uniquement des lettres, espaces et tirets (entre 2 et 50 caractères)"
    ),
  capital: z
    .number({
      invalid_type_error: "Le capital doit être un nombre",
    })
    .min(0, "Le capital doit être supérieur à 0")
    .max(999999999.99, "Le capital ne peut pas dépasser 999 999 999,99")
    .optional(),
  siren: z
    .string({
      required_error: "Le SIREN est requis",
    })
    .regex(/^\d{9}$/, "Le SIREN doit contenir exactement 9 chiffres"),
  legal_form: z.enum(
    [
      "SAS",
      "SARL",
      "SA",
      "SASU",
      "EURL",
      "SNC",
      "SOCIETE_CIVILE",
      "ENTREPRISE_INDIVIDUELLE",
    ],
    {
      errorMap: () => ({
        message:
          "Forme juridique invalide - doit être l'une des valeurs autorisées",
      }),
    }
  ),
  address: z
    .string({
      required_error: "L'adresse est requise",
    })
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(255, "L'adresse ne peut pas dépasser 255 caractères")
    .regex(
      /^[A-Za-zÀ-ÿ0-9\s,.-]+$/,
      "L'adresse contient des caractères non autorisés"
    ),
  postal_code: z
    .string({
      required_error: "Le code postal est requis",
    })
    .regex(/^\d{5}$/, "Le code postal doit contenir exactement 5 chiffres"),
  city: z
    .string({
      required_error: "La ville est requise",
    })
    .regex(
      /^[A-Za-zÀ-ÿ\s-]{2,50}$/,
      "La ville doit contenir uniquement des lettres, espaces et tirets (entre 2 et 50 caractères)"
    ),
  country: z
    .string(
      {
        required_error: "Le pays est requis",
        
      }
    )
    .regex(
      /^[A-Za-zÀ-ÿ\s-]{2,100}$/,
      "Le pays doit contenir uniquement des lettres, espaces et tirets"
    ),
  email: z
    .string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .optional(),
  phone: z
    .string()
    .regex(
      /^(\+33|0)[1-9](\d{2}){4}$/,
      "Le numéro de téléphone doit être au format français (+33 ou 0 suivi de 9 chiffres)"
    )
    .optional(),
  website: z
    .string()
    .url(
      "Le site web doit être une URL valide (commençant par http:// ou https://)"
    )
    .max(255, "L'URL du site web ne peut pas dépasser 255 caractères")
    .optional(),
});

// Type inféré du schéma
export type OrganizationFieldsInput = z.infer<typeof organizationFieldsSchema>;
