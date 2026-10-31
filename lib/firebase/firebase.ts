import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!privateKey) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing");
}

const isProd = process.env.NODE_ENV === "production";

const admin =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: isProd ? "alumni-sbssu" : "sbs-alumni",
      clientEmail: isProd
        ? "firebase-adminsdk-fbsvc@alumni-sbssu.iam.gserviceaccount.com"
        : "firebase-adminsdk-fbsvc@sbs-alumni.iam.gserviceaccount.com",
      privateKey,
    }),
  });

export const db = getFirestore(admin);
export default admin;
