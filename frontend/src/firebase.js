
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC4kscmF_Adbwbqfsg_cwN9lRWUY4axBtk',
  authDomain: 'promise-pay-78f8f.firebaseapp.com',
  projectId: 'promise-pay-78f8f',
  appId: '1:512197498045:web:deae2113c49e59ab0953d4',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
