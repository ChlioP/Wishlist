import {
  MOCK_SCHEMA_VERSION,
  type MockDatabase,
} from "@/data/mock/database";
import { mockFixtures } from "@/data/mock/fixtures";

const STORAGE_KEY = "wishlist_hub_mock_database";

export function cloneDatabase(database: MockDatabase): MockDatabase {
  return structuredClone(database);
}

export function createSeedDatabase(): MockDatabase {
  return cloneDatabase(mockFixtures);
}

function isMockDatabase(value: unknown): value is MockDatabase {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    value.schemaVersion === MOCK_SCHEMA_VERSION
  );
}

export function loadMockDatabase(): MockDatabase {
  if (typeof window === "undefined") {
    return createSeedDatabase();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createSeedDatabase();
    }

    const parsed: unknown = JSON.parse(stored);
    return isMockDatabase(parsed) ? cloneDatabase(parsed) : createSeedDatabase();
  } catch {
    return createSeedDatabase();
  }
}

export function saveMockDatabase(database: MockDatabase): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}
