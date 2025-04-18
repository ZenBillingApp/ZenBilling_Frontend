'use server';

import * as jose from 'jose';

// Secret pour le chiffrement JWT (à remplacer par une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_à_changer_en_production';
const secretEncoder = new TextEncoder().encode(JWT_SECRET);

/**
 * Chiffre des données avec JWT
 */
export const encryptData = async (data: Record<string, unknown>) => {
  return await new jose.SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secretEncoder);
}

/**
 * Déchiffre un token JWT
 */
export const decryptData = async (token: string) => {
  try {
    const { payload } = await jose.jwtVerify(token, secretEncoder);
    return payload;
  } catch (error) {
    console.error('Erreur lors du déchiffrement du token:', error);
    throw error;
  }
} 