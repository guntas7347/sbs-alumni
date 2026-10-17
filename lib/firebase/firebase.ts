import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!privateKey) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing");
}

const admin =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: "sbs-alumni",
      clientEmail: "firebase-adminsdk-fbsvc@sbs-alumni.iam.gserviceaccount.com",
      privateKey,
    }),
  });

export const db = getFirestore(admin);
export default admin;
