import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import type { Unsubscribe, User as FirebaseUser } from "firebase/auth";

import type { AuthRepository } from "@/data/repositories/contracts";
import { RepositoryError } from "@/data/repositories/errors";
import { defaultUserPreferences } from "@/features/auth/defaultPreferences";
import { getFirebaseAuth } from "@/lib/firebase";
import type { User, UserPreferences } from "@/types/domain";

const PREFERENCES_KEY_PREFIX = "wishlist_hub_firebase_preferences_";

export class FirebaseAuthRepository implements AuthRepository {
  private readonly listeners = new Set<(user: User | null) => void>();
  private stopAuthListener: Unsubscribe | null = null;

  async getCurrentUser(): Promise<User | null> {
    const auth = getFirebaseAuth();
    await auth.authStateReady();
    return auth.currentUser ? this.toDomainUser(auth.currentUser) : null;
  }

  async signIn(input: {
    email: string;
    password?: string;
  }): Promise<User> {
    const password = requirePassword(input.password);
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        input.email.trim(),
        password,
      );
      return this.toDomainUser(credential.user);
    } catch (error) {
      throw translateAuthError(error);
    }
  }

  async register(input: {
    displayName: string;
    email: string;
    password?: string;
  }): Promise<User> {
    const displayName = input.displayName.trim();
    if (displayName.length < 2) {
      throw new RepositoryError(
        "validation",
        "Display name must contain at least two characters.",
      );
    }
    const password = requirePassword(input.password);
    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        input.email.trim(),
        password,
      );
      await updateFirebaseProfile(credential.user, { displayName });
      this.savePreferences(credential.user.uid, defaultUserPreferences);
      const user = this.toDomainUser(credential.user);
      this.emit(user);
      return user;
    } catch (error) {
      throw translateAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(getFirebaseAuth());
    } catch (error) {
      throw translateAuthError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      throw new RepositoryError("validation", "Email is required.");
    }
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), normalizedEmail);
    } catch (error) {
      throw translateAuthError(error);
    }
  }

  async updateProfile(
    patch: Partial<Pick<User, "displayName" | "avatarUrl">>,
  ): Promise<User> {
    const firebaseUser = requireCurrentFirebaseUser();
    const displayName =
      patch.displayName === undefined
        ? firebaseUser.displayName
        : patch.displayName.trim();
    if (displayName !== null && displayName.length < 2) {
      throw new RepositoryError(
        "validation",
        "Display name must contain at least two characters.",
      );
    }
    try {
      await updateFirebaseProfile(firebaseUser, {
        displayName,
        photoURL:
          patch.avatarUrl === undefined
            ? firebaseUser.photoURL
            : patch.avatarUrl || null,
      });
      const user = this.toDomainUser(firebaseUser);
      this.emit(user);
      return user;
    } catch (error) {
      throw translateAuthError(error);
    }
  }

  async updatePreferences(
    patch: Partial<UserPreferences>,
  ): Promise<User> {
    const firebaseUser = requireCurrentFirebaseUser();
    const preferences = {
      ...this.loadPreferences(firebaseUser.uid),
      ...patch,
    };
    this.savePreferences(firebaseUser.uid, preferences);
    const user = this.toDomainUser(firebaseUser);
    this.emit(user);
    return user;
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    this.ensureAuthListener();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopAuthListener?.();
        this.stopAuthListener = null;
      }
    };
  }

  private ensureAuthListener() {
    if (this.stopAuthListener) return;
    this.stopAuthListener = onAuthStateChanged(
      getFirebaseAuth(),
      (firebaseUser) => {
        this.emit(firebaseUser ? this.toDomainUser(firebaseUser) : null);
      },
    );
  }

  private emit(user: User | null) {
    this.listeners.forEach((listener) => listener(user));
  }

  private toDomainUser(firebaseUser: FirebaseUser): User {
    const createdAt =
      firebaseUser.metadata.creationTime ?? new Date().toISOString();
    const updatedAt =
      firebaseUser.metadata.lastSignInTime ?? createdAt;
    return {
      id: firebaseUser.uid,
      displayName:
        firebaseUser.displayName?.trim() ||
        firebaseUser.email?.split("@")[0] ||
        "WishList User",
      email: firebaseUser.email ?? "",
      avatarUrl: firebaseUser.photoURL ?? undefined,
      preferences: this.loadPreferences(firebaseUser.uid),
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(updatedAt).toISOString(),
    };
  }

  private loadPreferences(userId: string): UserPreferences {
    try {
      const raw = localStorage.getItem(
        `${PREFERENCES_KEY_PREFIX}${encodeURIComponent(userId)}`,
      );
      if (!raw) return { ...defaultUserPreferences };
      return {
        ...defaultUserPreferences,
        ...(JSON.parse(raw) as Partial<UserPreferences>),
      };
    } catch {
      return { ...defaultUserPreferences };
    }
  }

  private savePreferences(
    userId: string,
    preferences: UserPreferences,
  ): void {
    try {
      localStorage.setItem(
        `${PREFERENCES_KEY_PREFIX}${encodeURIComponent(userId)}`,
        JSON.stringify(preferences),
      );
    } catch {
      // Firestore will replace this transitional persistence in a later phase.
    }
  }
}

function requirePassword(password: string | undefined): string {
  if (!password) {
    throw new RepositoryError("validation", "Password is required.");
  }
  return password;
}

function requireCurrentFirebaseUser(): FirebaseUser {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new RepositoryError("unauthenticated", "Sign in is required.");
  }
  return user;
}

function translateAuthError(error: unknown): RepositoryError {
  if (error instanceof RepositoryError) return error;
  if (!(error instanceof FirebaseError)) {
    return new RepositoryError(
      "unauthenticated",
      "Authentication request failed.",
    );
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return new RepositoryError("conflict", "Email is already registered.");
    case "auth/invalid-email":
      return new RepositoryError("validation", "Email address is invalid.");
    case "auth/weak-password":
      return new RepositoryError("validation", "Password is too weak.");
    case "auth/invalid-credential":
    case "auth/user-disabled":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return new RepositoryError(
        "unauthenticated",
        "Email or password is incorrect.",
      );
    default:
      return new RepositoryError(
        "unauthenticated",
        "Authentication request failed.",
      );
  }
}
