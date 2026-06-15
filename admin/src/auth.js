import { createAuthClient as createBetterAuthClient } from 'better-auth/client';
import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from '@postbase/client/auth';

export const authClient = createBetterAuthClient({
    baseURL: import.meta.env.VITE_API_BASE + '/auth', // Specify if on a different domain/path,
    plugins: [
        adminClient()
    ],
});

export const auth = createAuthClient(authClient);
export const { getBetterAuthToken } = auth;

export const { signUp, signIn, signOut, getSession } = authClient;
