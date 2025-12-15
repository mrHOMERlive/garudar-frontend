import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "1", 
  token: import.meta.env.VITE_BASE44_TOKEN,
  requiresAuth: !import.meta.env.DEV || Boolean(import.meta.env.VITE_BASE44_TOKEN) // Ensure authentication is required for all operations
});
