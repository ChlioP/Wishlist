import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6 text-ink">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">
          404
        </p>
        <h1 className="mt-3 font-display text-4xl">Page not found</h1>
        <Link
          className="mt-6 inline-flex rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-white"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
