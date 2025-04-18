'use server';

import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { encryptData, decryptData } from './encryption';

// Options standard pour les cookies
export type CookieOptions = Omit<ResponseCookie, 'name' | 'value'>;

// Options par défaut
const defaultOptions: CookieOptions = {
  path: '/',
  sameSite: 'strict',
  secure: true,
  httpOnly: true,
  maxAge: 60 * 60 // 1 heure par défaut
};

/**
 * Définit un cookie en utilisant un server action
 */
export async function setCookie(
  name: string, 
  value: string, 
  options: CookieOptions = {}
): Promise<void> {
  'use server';

  const encryptedValue = await encryptData({ value });
  
  const cookieStore = await cookies();
  cookieStore.set(name, encryptedValue, {
    ...defaultOptions,
    ...options
  });
}

/**
 * Récupère un cookie
 */
export async function getCookie(name: string): Promise<string | undefined> {
  'use server';
  
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  if (!cookie) return undefined;
  
  try {
    const decryptedData = await decryptData(cookie.value);
    return typeof decryptedData.value === 'string' ? decryptedData.value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Récupère tous les cookies
 */
export async function getAllCookies() {
  'use server';
  
  const cookieStore = await cookies();
  return Promise.all(cookieStore.getAll().map(async (cookie) => {
    try {
      const decryptedData = await decryptData(cookie.value);
      return {
        name: cookie.name,
        value: typeof decryptedData.value === 'string' ? decryptedData.value : undefined
      };
    } catch {
      return {
        name: cookie.name,
        value: undefined
      };
    }
  }));
}

/**
 * Supprime un cookie
 */
export async function deleteCookie(name: string): Promise<void> {
  'use server';
  
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

/**
 * Vérifie si un cookie existe
 */
export async function hasCookie(name: string): Promise<boolean> {
  'use server';
  
  const cookieStore = await cookies();
  return cookieStore.has(name);
} 