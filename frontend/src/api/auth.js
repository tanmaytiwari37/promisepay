import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google using Firebase popup.
 * Returns the Firebase user and ID token.
 * Throws a clear error if Firebase is not configured.
 */
export async function loginWithGoogle() {
  if (!isFirebaseEnabled) {
    throw new Error(
      'Google Sign-In is not configured. Please contact the administrator or use email/password login.'
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return { user, idToken };
  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Popup was closed. Please try again.');
    }
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Contact support.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site.');
    }
    if (error.code === 'auth/configuration-not-found') {
      throw new Error('Google Sign-In not configured in Firebase Console. Contact support.');
    }
    throw new Error(error.message || 'Google sign-in failed. Please try again.');
  }
}

/**
 * Sign out from Firebase.
 * No-op if Firebase is not configured.
 */
export async function logout() {
  if (!isFirebaseEnabled) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Firebase sign out error:', error);
  }
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function, or a no-op function if Firebase not configured.
 */
export function onAuthChange(callback) {
  if (!isFirebaseEnabled) {
    return () => {}; // no-op unsubscribe
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current Firebase user (if any).
 * Returns null if Firebase not configured.
 */
export function getCurrentUser() {
  if (!isFirebaseEnabled) return null;
  return auth.currentUser;
}

/**
 * Get the ID token for the current user.
 * Returns null if Firebase not configured or no user.
 */
export async function getIdToken() {
  if (!isFirebaseEnabled || !auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
}