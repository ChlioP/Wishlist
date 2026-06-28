import type { MockDatabase } from "@/data/mock/database";
import {
  cloneDatabase,
  loadMockDatabase,
  saveMockDatabase,
} from "@/data/mock/localStorage";

type StoreListener = (database: MockDatabase) => void;

export class LocalMockStore {
  private database: MockDatabase;
  private readonly listeners = new Set<StoreListener>();

  constructor(initialDatabase: MockDatabase = loadMockDatabase()) {
    this.database = cloneDatabase(initialDatabase);
  }

  read(): MockDatabase {
    return cloneDatabase(this.database);
  }

  mutate(mutator: (database: MockDatabase) => void): MockDatabase {
    const next = cloneDatabase(this.database);
    mutator(next);
    this.database = next;
    saveMockDatabase(next);
    const snapshot = this.read();
    this.listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const localMockStore = new LocalMockStore();
