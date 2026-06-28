import type { FirebaseOptions } from "firebase/app";

export type DataProvider = "local" | "firebase";

export const dataProvider: DataProvider =
  import.meta.env.VITE_DATA_PROVIDER ?? "local";

export const useFirebaseEmulators =
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

const requiredConfiguration = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
};

export function isFirebaseConfigured(): boolean {
  return Object.values(requiredConfiguration).every(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

export function assertFirebaseConfiguration(): void {
  const missingVariables = Object.entries(requiredConfiguration)
    .filter(
      ([, value]) =>
        typeof value !== "string" || value.trim().length === 0,
    )
    .map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missingVariables.join(
        ", ",
      )}.`,
    );
  }
}
