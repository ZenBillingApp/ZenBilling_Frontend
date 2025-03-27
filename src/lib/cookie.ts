"use server"

import { cookies } from "next/headers"

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  maxAge?: number;
}

export const setCookie = async (name: string, value: string, options: CookieOptions) => {
  const cookieStore = await cookies()
  cookieStore.set(name, value, options)
}

export const getCookie = async (name: string) => {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

export const setAuthCookies = async (token: string, refreshToken: string, expiresIn: number) => {
  await setCookie('access_token', token, {
    httpOnly: true,
    // secure: false,
    sameSite: 'none',
    path: '/',
    maxAge: expiresIn,
  })
  await setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    // secure: false,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 days
  })

}

export const deleteAuthCookies = async () => {
  await deleteCookie('access_token')
  await deleteCookie('refresh_token')
}