import type { AuthRepository } from "@/data/repositories/contracts";
import { localMockStore } from "@/data/repositories/local/LocalMockStore";
import { MockAuthRepository } from "@/data/repositories/local/MockAuthRepository";
import { dataProvider } from "@/lib/firebaseConfig";

const mockAuthRepository = new MockAuthRepository(localMockStore);
let selectedRepository: Promise<AuthRepository> | null = null;

function getSelectedRepository(): Promise<AuthRepository> {
  if (selectedRepository) return selectedRepository;
  selectedRepository =
    dataProvider === "firebase"
      ? import(
          "@/data/repositories/firebase/FirebaseAuthRepository"
        ).then(({ FirebaseAuthRepository }) => new FirebaseAuthRepository())
      : Promise.resolve(mockAuthRepository);
  return selectedRepository;
}

export const authRepository: AuthRepository = {
  async getCurrentUser() {
    return (await getSelectedRepository()).getCurrentUser();
  },
  async signIn(input) {
    return (await getSelectedRepository()).signIn(input);
  },
  async register(input) {
    return (await getSelectedRepository()).register(input);
  },
  async signOut() {
    return (await getSelectedRepository()).signOut();
  },
  async requestPasswordReset(email) {
    return (await getSelectedRepository()).requestPasswordReset(email);
  },
  async updateProfile(patch) {
    return (await getSelectedRepository()).updateProfile(patch);
  },
  async updatePreferences(patch) {
    return (await getSelectedRepository()).updatePreferences(patch);
  },
  subscribe(listener) {
    let active = true;
    let unsubscribe = () => {};
    void getSelectedRepository()
      .then((repository) => {
        if (active) unsubscribe = repository.subscribe(listener);
      })
      .catch(() => {
        // getCurrentUser reports configuration and initialization failures.
      });
    return () => {
      active = false;
      unsubscribe();
    };
  },
};
