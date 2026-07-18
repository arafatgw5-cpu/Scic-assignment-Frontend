import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // No baseURL — defaults to current origin, works for both production and preview deployments
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
