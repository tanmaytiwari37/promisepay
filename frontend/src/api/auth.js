import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google using Firebase popup.
 * Returns the Firebase user and ID token.
 */
export async function loginWithGoogle() {
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
    throw new Error(error.message || 'Google sign-in failed. Please try again.');
  }
}

/**
 * Sign out from Firebase.
 */
export async function logout() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Firebase sign out error:', error);
  }
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current Firebase user (if any).
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Get the ID token for the current user.
 */
export async function getIdToken() {
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
}