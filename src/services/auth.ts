import { Restaurant, User } from '../types';
import { readApiResponse } from './http';

type AuthResponse = {
  user: User;
  restaurant: Restaurant;
};

async function request(path: string, body?: unknown): Promise<AuthResponse> {
  try {
    const response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return await readApiResponse<AuthResponse>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the account API. Start it with `npm run dev:api` and check its server configuration.');
    }
    throw error;
  }
}

export const AuthService = {
  signUp(name: string, restaurantName: string, whatsappNumber: string, email: string, password: string) {
    return request('/api/auth/signup', { name, restaurantName, whatsappNumber, email, password });
  },

  signIn(email: string, password: string) {
    return request('/api/auth/login', { email, password });
  },

  getSession() {
    return request('/api/auth/me');
  },

  signOut() {
    return request('/api/auth/logout', {});
  },
};
