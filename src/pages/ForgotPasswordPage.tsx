import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authRepository } from "@/data/repositories/auth";
import { AuthLayout } from "@/pages/LoginPage";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authRepository.requestPasswordReset(email);
    setSent(true);
  }

  return (
    <AuthLayout
      description="This mock flow confirms the request without sending email."
      title="Reset your password"
    >
      {sent ? (
        <div className="space-y-5">
          <Badge variant="success">Mock reset requested</Badge>
          <p className="text-sm leading-6 text-muted">
            No email was sent because this phase uses local authentication.
          </p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <Button className="w-full" type="submit">
            Request reset
          </Button>
        </form>
      )}
      <Link
        className="mt-5 block text-center text-sm text-primary-dark"
        to="/login"
      >
        Return to sign in
      </Link>
    </AuthLayout>
  );
}
