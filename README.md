# WishList Hub

WishList Hub is a collaborative wishlist application for families, friends,
and gift exchanges. Users can create rooms, manage wishlists, reserve gifts,
and control list visibility through private, shared, or public room modes.

The frontend uses React, TypeScript, Vite, Tailwind CSS, and React Router.
Application data can come from the built-in local mock repositories or from
Firebase Authentication, Cloud Firestore, and Firebase Storage.

## Requirements

- Node.js 20.19 or newer
- npm
- A Firebase project only when using the Firebase data provider

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Keep `VITE_DATA_PROVIDER=local` to run with seeded browser-local mock data.
   No external service is required in this mode.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the URL printed by Vite, normally
   [http://localhost:5173](http://localhost:5173).

Mock data is stored in browser `localStorage`. Clear site data to restore the
seeded state.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run typecheck` | Run TypeScript checks |
| `npm run build` | Typecheck and create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |

Before deployment, run:

```bash
npm run test
npm run typecheck
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` for local development. Vite exposes
variables prefixed with `VITE_` to browser code, so these values must not
contain server secrets.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_DATA_PROVIDER` | Yes | `local` selects mock repositories; `firebase` selects Firebase adapters. |
| `VITE_FIREBASE_API_KEY` | Firebase only | Firebase web app API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase only | Firebase Authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Firebase only | Firebase project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase only | Default Firebase Storage bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase only | Firebase web app messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | Firebase only | Firebase web app ID. |
| `VITE_USE_FIREBASE_EMULATORS` | No | Set to `true` to connect Auth, Firestore, and Storage to local emulators. Defaults to `false`. |

Use these settings for mock-backed local development:

```dotenv
VITE_DATA_PROVIDER=local
VITE_USE_FIREBASE_EMULATORS=false
```

When `VITE_DATA_PROVIDER=firebase`, all six Firebase web configuration values
must be present or the application reports an incomplete configuration error.
Restart the Vite server after changing environment variables.

Do not commit `.env.local`. Firebase web configuration identifies the Firebase
project but is not an authorization mechanism; Authentication and Security
Rules enforce access.

## Firebase setup

1. Create separate Firebase projects for development and production.
2. In Firebase Console, add a Web app and copy its configuration values into
   `.env.local` or the deployment provider's environment settings.
3. In **Authentication → Sign-in method**, enable Email/Password.
4. Create a Cloud Firestore database.
5. Enable Firebase Storage and create its default bucket.
6. Install or invoke the Firebase CLI, authenticate, and select the project:

   ```bash
   npx firebase-tools login
   npx firebase-tools use --add
   ```

7. Deploy the checked-in Firestore and Storage rules:

   ```bash
   npx firebase-tools deploy --only firestore:rules,storage
   ```

8. Set `VITE_DATA_PROVIDER=firebase`,
   `VITE_USE_FIREBASE_EMULATORS=false`, and provide every Firebase web
   configuration variable.
9. Add each deployed Vercel domain under
   **Authentication → Settings → Authorized domains**.
10. Run the application and register a test account before production use.

The rules are defined in `firestore.rules` and `storage.rules`. Review and
deploy them whenever the permission model changes. Emulator setup and security
test cases are documented in
[docs/firebase-emulator.md](docs/firebase-emulator.md); the broader adapter and
data model notes are in [docs/firebase-plan.md](docs/firebase-plan.md).

To use the local Firebase Emulator Suite, set
`VITE_USE_FIREBASE_EMULATORS=true`, then run:

```bash
npx firebase-tools emulators:start
```

The configured ports are Auth `9099`, Firestore `8080`, Storage `9199`, and
Emulator UI `4000`.

## Vercel deployment

1. Push the repository to a Git provider and import it into Vercel.
2. Select **Vite** as the framework preset.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Choose the data provider:
   - For a demo deployment, set `VITE_DATA_PROVIDER=local`.
   - For persistent shared data, set `VITE_DATA_PROVIDER=firebase` and add all
     Firebase variables from the table above.
5. Set `VITE_USE_FIREBASE_EMULATORS=false`.
6. Apply variables to each intended Vercel environment (Preview and/or
   Production), then deploy.
7. If Firebase is enabled, add the generated Vercel domain to Firebase
   Authentication's authorized domains.
8. Verify sign-in, direct navigation to a nested route, room permissions,
   wishlist writes, and image upload after deployment.

`vercel.json` rewrites application routes to `index.html`, allowing React
Router URLs to load directly and survive browser refreshes.

## Screenshots

Screenshots will be added here before the public release.

<!-- Add desktop and mobile screenshots from the deployed application. -->

## Architecture and design reference

- [docs/architecture.md](docs/architecture.md) describes routes, components,
  repositories, models, and permissions.
- `prototype/` contains the preserved visual reference and is not part of the
  production build.
- Root-level static HTML mockups are additional historical design references.

## Security notes

- Route guards and frontend permission helpers improve the UI but are not a
  security boundary.
- Firebase Security Rules must enforce every protected read, write, and image
  upload.
- Never place service-account credentials, private keys, or server secrets in
  `VITE_` variables.
- Validate Security Rule changes with the Emulator Suite before deployment.
