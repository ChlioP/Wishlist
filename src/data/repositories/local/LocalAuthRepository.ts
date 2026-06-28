import type { AuthRepository } from "@/data/repositories/contracts";
import { defaultUserPreferences } from "@/features/auth/defaultPreferences";
import { RepositoryError } from "@/data/repositories/errors";
import {
  createId,
  now,
} from "@/data/repositories/local/helpers";
import {
  localMockStore,
  type LocalMockStore,
} from "@/data/repositories/local/LocalMockStore";
import type { User } from "@/types/domain";
import type { UserPreferences } from "@/types/domain";

export class LocalAuthRepository implements AuthRepository {
  constructor(private readonly store: LocalMockStore = localMockStore) {}

  async getCurrentUser(): Promise<User | null> {
    const database = this.store.read();
    return (
      database.users.find((user) => user.id === database.currentUserId) ?? null
    );
  }

  async signIn(input: { email: string; password?: string }): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const user = this.store
      .read()
      .users.find((candidate) => candidate.email.toLowerCase() === email);

    if (!user) {
      throw new RepositoryError("unauthenticated", "Email was not found.");
    }

    this.store.mutate((database) => {
      database.currentUserId = user.id;
    });
    return user;
  }

  async register(input: {
    displayName: string;
    email: string;
    password?: string;
  }): Promise<User> {
    const displayName = input.displayName.trim();
    const email = input.email.trim().toLowerCase();
    if (!displayName || !email) {
      throw new RepositoryError(
        "validation",
        "Display name and email are required.",
      );
    }

    const database = this.store.read();
    if (
      database.users.some(
        (candidate) => candidate.email.toLowerCase() === email,
      )
    ) {
      throw new RepositoryError("conflict", "Email is already registered.");
    }

    const timestamp = now();
    const user: User = {
      id: createId("user"),
      displayName,
      email,
      preferences: defaultUserPreferences,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.mutate((next) => {
      next.users.push(user);
      next.currentUserId = user.id;
    });
    return user;
  }

  async signOut(): Promise<void> {
    this.store.mutate((database) => {
      database.currentUserId = null;
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    if (!email.trim()) {
      throw new RepositoryError("validation", "Email is required.");
    }
  }

  async updateProfile(
    patch: Partial<Pick<User, "displayName" | "avatarUrl">>,
  ): Promise<User> {
    const database = this.store.read();
    const currentUser = database.users.find(
      (user) => user.id === database.currentUserId,
    );
    if (!currentUser) {
      throw new RepositoryError("unauthenticated", "Sign in is required.");
    }

    const updated: User = {
      ...currentUser,
      ...patch,
      displayName: patch.displayName?.trim() || currentUser.displayName,
      updatedAt: now(),
    };
    this.store.mutate((next) => {
      next.users = next.users.map((user) =>
        user.id === updated.id ? updated : user,
      );
    });
    return updated;
  }

  async updatePreferences(
    patch: Partial<UserPreferences>,
  ): Promise<User> {
    const database = this.store.read();
    const currentUser = database.users.find(
      (user) => user.id === database.currentUserId,
    );
    if (!currentUser) {
      throw new RepositoryError("unauthenticated", "Sign in is required.");
    }
    const updated: User = {
      ...currentUser,
      preferences: {
        ...currentUser.preferences,
        ...patch,
      },
      updatedAt: now(),
    };
    this.store.mutate((next) => {
      next.users = next.users.map((user) =>
        user.id === updated.id ? updated : user,
      );
    });
    return updated;
  }

  subscribe(listener: (user: User | null) => void): () => void {
    return this.store.subscribe((database) => {
      listener(
        database.users.find((user) => user.id === database.currentUserId) ??
          null,
      );
    });
  }
}
