import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const isProd = process.env.NODE_ENV === "production";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: isProd
    ? "alumni-sbssu.firebaseapp.com"
    : "sbs-alumni.firebaseapp.com",
  projectId: isProd ? "alumni-sbssu" : "sbs-alumni",
  storageBucket: isProd
    ? "alumni-sbssu.firebasestorage.app"
    : "sbs-alumni.firebasestorage.app",
  messagingSenderId: isProd ? "377345996671" : "122407210140",
  appId: isProd
    ? "1:377345996671:web:64e11141cb1c7265bb4c4a"
    : "1:122407210140:web:052ae4af7f193e4c35b159",
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
