'use server';

import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Utilitaire pour gérer les cookies côté serveur via server actions
 */

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
  
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
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
  return cookie?.value;
}

/**
 * Récupère tous les cookies
 */
export async function getAllCookies() {
  'use server';
  
  const cookieStore = await cookies();
  return cookieStore.getAll();
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