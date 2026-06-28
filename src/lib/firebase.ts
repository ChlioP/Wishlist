import { getApp, getApps, initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
} from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";

import {
  assertFirebaseConfiguration,
  firebaseConfig,
  useFirebaseEmulators,
} from "@/lib/firebaseConfig";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;
  assertFirebaseConfiguration();
  firebaseApp =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) return firebaseAuth;
  firebaseAuth = getAuth(getFirebaseApp());
  if (useFirebaseEmulators) {
    connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  }
  return firebaseAuth;
}

export function getFirebaseFirestore(): Firestore {
  if (firestore) return firestore;
  firestore = getFirestore(getFirebaseApp());
  if (useFirebaseEmulators) {
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  }
  return firestore;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (firebaseStorage) return firebaseStorage;
  firebaseStorage = getStorage(getFirebaseApp());
  if (useFirebaseEmulators) {
    connectStorageEmulator(firebaseStorage, "127.0.0.1", 9199);
  }
  return firebaseStorage;
}
