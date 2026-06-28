import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

import { authRepository } from "@/data/repositories/auth";
import type { User } from "@/types/domain";

interface SignInInput {
  email: string;
  password?: string;
}

interface RegisterInput extends SignInInput {
  displayName: string;
}

interface AuthContextValue {
  isLoading: boolean;
  register(input: RegisterInput): Promise<void>;
  signIn(input: SignInInput): Promise<void>;
  signOut(): Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void authRepository
      .getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    const unsubscribe = authRepository.subscribe((currentUser) => {
      if (active) {
        setUser(currentUser);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (input: SignInInput) => {
    const signedInUser = await authRepository.signIn(input);
    setUser(signedInUser);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const registeredUser = await authRepository.register(input);
    setUser(registeredUser);
  }, []);

  const signOut = useCallback(async () => {
    await authRepository.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isLoading, register, signIn, signOut, user }),
    [isLoading, register, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
