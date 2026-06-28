import { afterEach, describe, expect, it, vi } from "vitest";

import { fixtureIds } from "@/data/mock/fixtures";

describe.sequential("auth repository selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses the mock auth repository when the local provider is configured", async () => {
    vi.stubEnv("VITE_DATA_PROVIDER", "local");
    const { authRepository } = await import("@/data/repositories/auth");

    expect((await authRepository.getCurrentUser())?.id).toBe(
      fixtureIds.users.admin,
    );
  });

  it("selects Firebase auth when configured and reports missing configuration", async () => {
    vi.stubEnv("VITE_DATA_PROVIDER", "firebase");
    vi.stubEnv("VITE_FIREBASE_API_KEY", "");
    vi.stubEnv("VITE_FIREBASE_APP_ID", "");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "");
    vi.stubEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "");
    vi.stubEnv("VITE_FIREBASE_STORAGE_BUCKET", "");
    const { authRepository } = await import("@/data/repositories/auth");

    await expect(authRepository.getCurrentUser()).rejects.toThrow(
      "Firebase configuration is incomplete.",
    );
  });
});
