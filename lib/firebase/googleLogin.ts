import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "sbs-alumni.firebaseapp.com",
  projectId: "sbs-alumni",
  storageBucket: "sbs-alumni.firebasestorage.app",
  messagingSenderId: "122407210140",
  appId: "1:122407210140:web:052ae4af7f193e4c35b159",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function googleLogin() {
  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    user,
    idToken,
  };
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export const getCurrentUser = async () => {
  if (!auth.currentUser) {
    return null;
  }

  const idToken = await auth.currentUser.getIdToken();

  return {
    user: auth.currentUser,
    idToken,
  };
};
