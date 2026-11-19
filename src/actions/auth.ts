'use server';

import { getCurrentUser, setAuthCookie, clearAuthCookie, createSessionToken, DEMO_ACCOUNTS, AuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function loginAction(formData: { username: string; password?: string }) {
  const username = formData.username.trim().toLowerCase();
  const password = formData.password?.trim();

  // Check demo accounts
  let matchedUser: AuthUser | null = null;

  if (username === 'admin' && (!password || password === 'admin')) {
    matchedUser = DEMO_ACCOUNTS.admin;
  } else if ((username === 'alex' || username === 'user') && (!password || password === 'user')) {
    matchedUser = DEMO_ACCOUNTS.user;
  } else {
    // Custom user login as regular user role
    if (!username) {
      return { success: false, error: 'Введите имя пользователя' };
    }
    matchedUser = {
      id: 99,
      username,
      name: username,
      role: 'user',
    };
  }

  const token = await createSessionToken(matchedUser);
  await setAuthCookie(token);

  revalidatePath('/');
  return { success: true, user: matchedUser };
}

export async function logoutAction() {
  await clearAuthCookie();
  revalidatePath('/');
  return { success: true };
}

export async function getSessionUserAction() {
  return await getCurrentUser();
}
