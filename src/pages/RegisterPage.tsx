import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RepositoryError } from "@/data/repositories/errors";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthLayout } from "@/pages/LoginPage";

export function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register({ displayName, email });
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof RepositoryError
          ? caught.message
          : "Unable to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      description="Create a local mock account. No password is stored."
      title="Create your account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          autoComplete="name"
          label="Full name"
          onChange={(event) => setDisplayName(event.target.value)}
          value={displayName}
        />
        <Input
          autoComplete="email"
          error={error || undefined}
          label="Email address"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        <Button className="w-full" disabled={submitting} type="submit">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already registered?{" "}
        <Link className="text-primary-dark" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
