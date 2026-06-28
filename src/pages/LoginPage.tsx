import { useState } from "react";
import { Gift } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { RepositoryError } from "@/data/repositories/errors";
import { useAuth } from "@/features/auth/AuthContext";

interface LoginLocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const [email, setEmail] = useState("alice@example.com");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signIn({ email });
      const state = location.state as LoginLocationState | null;
      navigate(state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof RepositoryError
          ? caught.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      description="Sign in with a fixture account to explore the routed app."
      title="Welcome back"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          error={error || undefined}
          label="Email address"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <Button className="w-full" disabled={submitting} type="submit">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-muted">
        Fixture accounts: alice@example.com, bob@example.com, or
        carol@example.com.
      </p>
      <div className="mt-5 flex justify-center gap-4 text-sm text-primary-dark">
        <Link to="/register">Create account</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </AuthLayout>
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
  description: string;
  title: string;
}

export function AuthLayout({
  children,
  description,
  title,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-7 flex items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-primary-dark">
            <Gift aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl text-ink">WishList Hub</p>
            <p className="text-xs text-muted">Private group gift planning</p>
          </div>
        </div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-muted">{description}</p>
        {children}
      </Card>
    </main>
  );
}
