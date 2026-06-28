# Firebase Emulator Security Testing

## Purpose

Use the Firebase Emulator Suite to validate Authentication, Firestore Rules,
and Storage Rules without connecting tests or development data to a live
Firebase project.

No Cloud Functions are required by this setup.

## Prerequisites

- Node.js and npm
- Java 11 or newer
- Firebase CLI, invoked with `npx firebase-tools`

The CLI does not need to be installed globally.

## Local environment

Create `.env.development.local`:

```text
VITE_DATA_PROVIDER=firebase
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-wishlist-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-wishlist-hub
VITE_FIREBASE_STORAGE_BUCKET=demo-wishlist-hub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:demo
```

The app connects to:

| Emulator | Host | Port |
| --- | --- | ---: |
| Auth | `127.0.0.1` | 9099 |
| Firestore | `127.0.0.1` | 8080 |
| Storage | `127.0.0.1` | 9199 |
| Emulator UI | `127.0.0.1` | 4000 |

## Start the environment

Terminal 1:

```bash
npx firebase-tools emulators:start \
  --project demo-wishlist-hub \
  --only auth,firestore,storage
```

Terminal 2:

```bash
npm run dev
```

Use the Emulator UI to inspect documents and files. Clear emulator data before
each manual test run.

## Recommended automated test setup

When automated rules tests are added, use:

```text
@firebase/rules-unit-testing
vitest
firebase-tools
```

Run tests through `firebase emulators:exec` so the emulators start, tests run,
and state is discarded:

```bash
npx firebase-tools emulators:exec \
  --project demo-wishlist-hub \
  --only auth,firestore,storage \
  "npm run test:rules"
```

Each test must:

1. Create a fresh `RulesTestEnvironment`.
2. Seed data with rules disabled.
3. Use authenticated contexts for owner, admin, member, granted member, and
   outsider.
4. Use `assertSucceeds` for allowed operations.
5. Use `assertFails` for denied operations.
6. Clear Firestore and Storage between tests.

## Base fixture

Seed fixed IDs:

```text
owner = user-owner
admin = user-admin
member = user-member
grantedMember = user-granted
outsider = user-outsider

privateRoom = room-private
sharedRoom = room-shared
publicRoom = room-public
```

Each room should contain active memberships for owner, admin, member, and
granted member. The outsider has no membership. Seed one wishlist per member,
one available item, and one visibility grant:

```text
rooms/room-shared/visibilityGrants/user-granted_user-member
```

## Required Firestore rule cases

### Room owner, admin, member, and outsider

| Case | Expected |
| --- | --- |
| Active owner reads room | Allow |
| Active admin reads room | Allow |
| Active member reads room | Allow |
| Outsider reads room | Deny |
| Owner changes privacy mode | Allow |
| Admin changes privacy mode | Allow |
| Member changes privacy mode | Deny |
| Outsider changes privacy mode | Deny |
| Owner deletes room | Allow |
| Admin deletes room | Allow |
| Member deletes room | Deny |
| Owner/admin reads visibility grants | Allow |
| Member lists all visibility grants | Deny |
| Viewer queries their own grants | Allow |

### Private, shared, and public wishlist visibility

| Case | Expected |
| --- | --- |
| Wishlist owner reads own list in any mode | Allow |
| Room owner/admin reads any room wishlist | Allow |
| Member reads another list in private room | Deny |
| Member reads another list in shared room without grant | Deny |
| Granted member reads granted shared-room list | Allow |
| Granted member reads a different ungranted list | Deny |
| Active member reads another list in public room | Allow |
| Outsider reads any room wishlist | Deny |
| Removed or pending member reads room wishlist | Deny |

Queries must request only documents the caller may read. Shared/private member
queries should request the user's own wishlist and explicitly granted
wishlists; they must not query every wishlist in the room and filter in the
browser.

### Wishlist item create, edit, and delete

| Case | Expected |
| --- | --- |
| Wishlist owner creates available item with quantity >= 1 | Allow |
| Owner creates item with mismatched document `id` | Deny |
| Owner creates item with invalid quantity | Deny |
| Another member creates item in someone else's wishlist | Deny |
| Wishlist owner edits own item | Allow |
| Another member edits product fields | Deny |
| Wishlist owner soft-deletes own item | Allow |
| Room owner/admin deletes item during room cleanup | Allow |
| Outsider reads or deletes item | Deny |

### Reservations

| Case | Expected |
| --- | --- |
| Eligible member reserves visible available item | Allow |
| Wishlist owner reserves own item | Deny |
| Member reserves private/ungranted item | Deny |
| Reservation document ID differs from item ID | Deny |
| Duplicate active reservation | Deny through transaction conflict/rules |
| Reserver changes reserved item to purchased atomically | Allow |
| Reserver cancels and returns item to available atomically | Allow |
| Different member updates reservation | Deny |
| Wishlist recipient reads reservation identity | Deny |
| Reserver reads own reservation | Allow |

Reservation tests must use Firestore transactions or atomic batches containing
both the reservation and item status changes.

### Activity and notifications

| Case | Expected |
| --- | --- |
| Actor reads own activity | Allow |
| Room owner/admin reads room activity | Allow |
| Member reads another actor's room activity | Deny |
| Client creates activity event | Deny |
| Recipient reads notification | Allow |
| Other user reads notification | Deny |
| Recipient updates only `readAt` | Allow |
| Recipient changes notification content | Deny |

## Required Storage rule cases

Use paths shaped as:

```text
rooms/{roomId}/wishlists/{wishlistId}/items/{itemId}/{filename}
```

| Case | Expected |
| --- | --- |
| Wishlist owner uploads JPEG <= 5 MB | Allow |
| Wishlist owner uploads PNG <= 5 MB | Allow |
| Wishlist owner uploads WebP <= 5 MB | Allow |
| Wishlist owner uploads GIF <= 5 MB | Allow |
| Wishlist owner uploads image over 5 MB | Deny |
| Wishlist owner uploads PDF or SVG | Deny |
| Another room member uploads to owner's wishlist | Deny |
| Outsider uploads or reads image | Deny |
| Authorized viewer reads image under private/shared/public policy | Allow |
| Ungranted member reads shared/private image | Deny |
| Wishlist owner deletes image | Allow |
| Room owner/admin deletes image during room cleanup | Allow |

Storage tests require the corresponding room, membership, wishlist, and
visibility documents in the Firestore Emulator because Storage Rules consult
Firestore.

## Manual smoke test

1. Register owner, admin, member, and outsider accounts in the Auth Emulator.
2. Seed memberships and wishlists in the Emulator UI.
3. Confirm owner/admin can open room settings and change privacy.
4. Confirm member receives the app's access-denied state.
5. Verify private, shared, and public wishlist reads with each account.
6. Add, edit, and remove an item as its owner.
7. Reserve and cancel an item as another authorized member.
8. Upload valid images below 5 MB and reject oversized or invalid MIME types.
9. Inspect the Firestore and Storage Emulator data after each operation.

## Deployment gate

Before deploying rules:

- All allow and deny cases above must pass.
- `npm run typecheck` and `npm run build` must pass.
- The app must be tested with `VITE_USE_FIREBASE_EMULATORS=true`.
- Rules must be deployed to staging before production.
- Production rules must never be tested with real user data.
