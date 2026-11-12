import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if all required Firebase config values are present and non-empty.
 */
function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

let app = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    // Avoid re-initializing if already initialized (e.g., during HMR)
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Use session-only persistence so each tab has its own auth state
    setPersistence(auth, browserSessionPersistence);
  } catch (err) {
    console.error('[Firebase] Initialization failed:', err.message);
    console.warn('[Firebase] Google Sign-In will be disabled. Email/password login still works.');
    app = null;
    auth = null;
  }
} else {
  // Only warn once in development
  if (import.meta.env.DEV) {
    console.warn(
      '[Firebase] Not configured (missing VITE_FIREBASE_* env vars). ' +
      'Google Sign-In disabled. Email/password login still works. ' +
      'See frontend/.env.example for required variables.'
    );
  }
}

export { auth, app };
export const isFirebaseEnabled = !!auth;
export default app;