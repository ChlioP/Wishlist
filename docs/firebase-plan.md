# Firebase Integration Plan

## Scope and constraints

Firebase will replace the local mock persistence layer without changing page or presentational component APIs. The existing repository interfaces remain the application boundary.

This plan does not install Firebase packages or modify application code. Firebase integration should begin only after the current mock-backed behavior and permission tests are stable.

## Firebase Authentication strategy

### Initial providers

The first Firebase-backed release will use email and password authentication:

- Account registration with display name, email, and password
- Email/password sign-in
- Sign-out
- Password-reset email
- Email verification before joining or creating rooms
- Firebase Auth persistence using browser-local persistence

Google or Apple sign-in can be added later without changing the `AuthRepository` contract.

### User records

Firebase Authentication is the authority for:

- User ID
- Login email
- Password credentials
- Email-verification state
- Provider identities

Firestore stores application profile data. Authentication passwords are never stored in Firestore.

Use separate private and member-visible documents:

```text
users/{userId}
profiles/{userId}
```

`users/{userId}` contains private account data:

```ts
{
  email: string;
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

`profiles/{userId}` contains data that room members may read:

```ts
{
  displayName: string;
  avatarUrl?: string;
  publicEmail?: string;
  updatedAt: Timestamp;
}
```

`publicEmail` is omitted unless `showEmailToRoomMembers` is enabled. This avoids relying on client-side field redaction, which Firestore Security Rules cannot provide.

### Account lifecycle

1. Create the Firebase Auth account.
2. Send an email-verification message.
3. Create `users/{uid}` and `profiles/{uid}` in a batch.
4. Expose the signed-in domain `User` only after both Auth and profile initialization complete.
5. Update Auth display name and the Firestore profile together where practical.
6. Use a trusted deletion workflow later to remove Auth, Firestore, Storage, and membership data.

The app should never infer authorization from custom claims alone. Room roles remain room-specific Firestore membership records. Custom claims are appropriate only for future global roles such as support staff.

## Firestore collections

### Proposed layout

```text
users/{userId}
profiles/{userId}

rooms/{roomId}
rooms/{roomId}/members/{userId}
rooms/{roomId}/visibilityGrants/{viewerId}_{wishlistOwnerId}
rooms/{roomId}/joinRequests/{requestId}

roomInvites/{inviteHash}

wishlists/{wishlistId}
wishlists/{wishlistId}/items/{itemId}

reservations/{reservationId}
activity/{eventId}
notifications/{notificationId}
```

### `rooms/{roomId}`

```ts
{
  name: string;
  description?: string;
  privacyMode: "private" | "shared" | "public";
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Invite codes should not be stored directly on generally readable room documents.

### `rooms/{roomId}/members/{userId}`

```ts
{
  userId: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "active" | "removed";
  joinedAt: Timestamp;
}
```

The document ID equals the user ID, making membership checks deterministic in Security Rules.

### `rooms/{roomId}/visibilityGrants/{viewerId}_{wishlistOwnerId}`

```ts
{
  viewerUserId: string;
  wishlistOwnerId: string;
  grantedByUserId: string;
  createdAt: Timestamp;
}
```

The deterministic document ID allows rules to check one exact grant with `exists()`. Grants only affect rooms in `shared` mode.

### `rooms/{roomId}/joinRequests/{requestId}`

```ts
{
  userId: string;
  status: "pending" | "approved" | "rejected";
  reviewedByUserId?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
}
```

### `roomInvites/{inviteHash}`

```ts
{
  roomId: string;
  active: boolean;
  expiresAt?: Timestamp;
  createdByUserId: string;
  createdAt: Timestamp;
}
```

The client submits an invite code to a callable Cloud Function, which hashes it and performs the lookup. A raw invite code must not be queryable from room data. Rate limiting and Firebase App Check should protect invite redemption.

For an emulator-only first iteration, exact-document invite lookup may temporarily be client-driven. Production should use the callable workflow.

### `wishlists/{wishlistId}`

```ts
{
  roomId: string;
  ownerId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Use one wishlist per user per room. A deterministic ID such as `${roomId}_${ownerId}` simplifies lookup and uniqueness enforcement.

### `wishlists/{wishlistId}/items/{itemId}`

The document maps to `WishlistItem`, with Firestore timestamps replacing ISO strings.

Reservation identity must not be stored on the item document. The item may expose an availability status, but the reserver's user ID belongs only in `reservations`.

### `reservations/{reservationId}`

```ts
{
  roomId: string;
  wishlistId: string;
  wishlistOwnerId: string;
  itemId: string;
  reservedByUserId: string;
  status: "reserved" | "purchased" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Use the item ID as the reservation document ID, or enforce one active reservation with a transaction. Only the reserver and narrowly scoped trusted backend operations should read reservation identity. The wishlist owner must not be able to read `reservedByUserId`.

### `activity/{eventId}`

Activity documents contain the existing `ActivityEvent` fields. User-level events include `actorUserId`; room-level events include `roomId`.

Prefer trusted creation through Cloud Functions for events that claim another user's action or describe administrative changes.

### `notifications/{notificationId}`

Notification documents contain `recipientUserId`, type, related IDs, metadata, `createdAt`, and optional `readAt`. Queries always filter by the authenticated user's ID.

Notification creation should usually occur in trusted backend code. Clients may update only their own `readAt` field.

### Required indexes

Likely composite indexes include:

- `notifications`: `recipientUserId ASC`, `createdAt DESC`
- `activity`: `actorUserId ASC`, `createdAt DESC`
- `activity`: `roomId ASC`, `createdAt DESC`
- `wishlists`: `roomId ASC`, `ownerId ASC`
- `reservations`: `reservedByUserId ASC`, `status ASC`

Only add indexes required by actual queries. Keep generated index definitions in `firestore.indexes.json`.

## Firebase Storage strategy for item images

### Object path

```text
rooms/{roomId}/wishlists/{wishlistId}/items/{itemId}/{imageId}.{extension}
```

Each image record should include:

- Owning room, wishlist, item, and user IDs in the path or metadata
- Original filename for display only
- MIME type
- Size
- Upload timestamp

The Firestore item stores the Storage path, not a permanent download URL. Adapters resolve download URLs when needed.

### Upload constraints

- Authenticated users only
- Wishlist owner only
- Active room membership required
- JPEG, PNG, WebP, or GIF only
- Maximum size initially 5 MB
- Generate a unique image ID; never trust the original filename as a path
- Strip or normalize unsafe filename characters
- Replace an old image only after the new upload succeeds
- Delete orphaned images after item deletion through a trusted cleanup process

Client-side resizing can reduce upload cost, but validation must still exist in Storage Rules. Image moderation and server-generated thumbnails can be future Cloud Function work.

### Upload workflow

1. Create or reserve the item ID.
2. Validate the selected file in the client.
3. Upload to the deterministic item directory.
4. Save the Storage path to the item document.
5. On failure, retain the item without an image or clean up the partial upload.

## Security Rules plan

Security Rules are the real authorization boundary. Route guards and React permission components remain usability controls only.

### Shared rule helpers

Firestore Rules should define helpers equivalent to the frontend permission functions:

```text
isSignedIn()
isSelf(userId)
membership(roomId)
isActiveMember(roomId)
isRoomOwner(roomId)
isRoomAdmin(roomId)
canManageRoom(roomId)
canViewWishlist(roomId, wishlistOwnerId)
canEditWishlist(wishlistOwnerId)
```

`canViewWishlist` must mirror the application policy:

- Active room membership is always required.
- A user can view their own wishlist.
- Owner/admin members can view all room wishlists.
- Private mode denies other members.
- Shared mode requires `visibilityGrants/{viewerId}_{ownerId}`.
- Public mode allows active members.

### Rules by collection

#### Users and profiles

- A user can read and update only `users/{theirUid}`.
- Authenticated active room members can read profiles of users in the same room.
- A user can update only their own profile.
- Rules validate allowed fields and field types.
- Clients cannot set server-controlled timestamps arbitrarily.

#### Rooms

- Active members can read their rooms.
- An authenticated user can create a room only when `ownerId == request.auth.uid`.
- Creation should atomically create the owner's membership; rules should validate the batch with `getAfter()`.
- Owner/admin members can update name, description, and privacy mode.
- Only the owner can transfer ownership or delete the room.
- `ownerId` cannot change through a normal room update.

#### Memberships

- Active members can read memberships in their room.
- Owner/admin members can approve or remove regular members.
- Only the owner can promote, demote, or remove administrators.
- The owner membership cannot be removed through a normal membership write.
- Users may leave by updating only their own non-owner membership.

#### Visibility grants

- Owner/admin members can create and delete grants.
- Viewer and wishlist owner must both be active members of the same room.
- A grant cannot target the same user as viewer and owner.
- Members may read grants needed for their own visibility checks; broad grant listing should be limited to admins.

#### Wishlists and items

- Wishlist reads use `canViewWishlist`.
- Only the wishlist owner can create or update their wishlist.
- Only the wishlist owner can create, update, or remove its items.
- Item writes validate supported status, quantity, price, URL, and string lengths.
- Administrative visibility does not grant edit permission.

#### Reservations

- A user cannot reserve their own item.
- The user must be an active room member who can view the wishlist.
- Creation must fail if an active reservation already exists.
- Only the reserver can cancel or mark their reservation purchased.
- The wishlist owner cannot read reservation identity.
- Use a transaction so the item availability and reservation document cannot diverge.

Firestore Rules cannot provide field-level redaction. If recipients must see reservation status without identity, store public availability on the item and private identity in the reservation document.

#### Join requests and invites

- A signed-in user creates a request only for their own user ID.
- Owner/admin members read and review requests.
- A requester may read their own request.
- Invite redemption is preferably handled by a callable function.

#### Activity and notifications

- Users read activity where they are the actor.
- Owner/admin members read room activity.
- Trusted backend code creates security-sensitive activity events.
- A user reads only notifications where `recipientUserId == request.auth.uid`.
- A user may update only `readAt` on their own notification.

### Storage Rules

Storage Rules should:

- Require authentication.
- Resolve the related wishlist and room membership through Firestore.
- Allow upload/delete only to the wishlist owner.
- Validate the path IDs against Firestore ownership.
- Validate content type and size.
- Deny directory listing where it is unnecessary.

### Rule maintenance

Every frontend permission rule must have a matching emulator rule test. Changes to `permissionRules.ts` and Firebase Rules should be reviewed together.

## Repository adapter mapping

The provider layer will select local or Firebase implementations. Pages and components continue to use repository interfaces.

| Interface | Firebase adapter | Firebase services |
| --- | --- | --- |
| `AuthRepository` | `FirebaseAuthRepository` | Auth, `users`, `profiles` |
| `RoomRepository` | `FirestoreRoomRepository` | `rooms`, members, grants, requests, invite callable |
| `WishlistRepository` | `FirestoreWishlistRepository` | wishlists, items, reservations, Storage |
| `ActivityRepository` | `FirestoreActivityRepository` | `activity` |
| `NotificationRepository` | `FirestoreNotificationRepository` | `notifications`, snapshots |

### Adapter responsibilities

Each adapter will:

- Convert Firestore `Timestamp` values to domain ISO strings.
- Convert domain inputs back to Firestore-safe documents.
- Translate Firebase errors into `RepositoryError` codes.
- Execute queries that satisfy Security Rules.
- Unsubscribe snapshot listeners during cleanup.
- Avoid leaking Firebase document snapshots into components.
- Keep reservation and recipient-safe item data separate.

Image upload may be implemented as a dedicated `ItemImageRepository` if adding image methods to `WishlistRepository` would mix too many responsibilities.

### Provider selection

`AppProviders` should construct one adapter set:

```ts
type RepositorySet = {
  auth: AuthRepository;
  rooms: RoomRepository;
  wishlists: WishlistRepository;
  activity: ActivityRepository;
  notifications: NotificationRepository;
};
```

Select adapters from an explicit environment setting. Do not scatter Firebase imports or environment checks through pages.

## Migration steps from mock repositories to Firebase

1. Freeze the current repository contracts and add contract tests for local adapters.
2. Add Firebase packages in a dedicated integration change.
3. Create Firebase project configuration and emulator configuration files.
4. Add a single Firebase initialization module.
5. Add a typed repository provider instead of importing `localRepositories` directly in pages.
6. Implement `FirebaseAuthRepository`.
7. Add Auth emulator tests for registration, sign-in, sign-out, reset, and profile initialization.
8. Implement Firestore converters for each domain model.
9. Implement `FirestoreRoomRepository`.
10. Implement room, membership, join-request, and visibility Security Rules with tests.
11. Implement `FirestoreWishlistRepository` without image upload.
12. Implement reservation transactions and privacy rules.
13. Implement Storage upload/delete behavior and Storage Rules.
14. Implement activity and notification adapters.
15. Add snapshot subscriptions only where the interface already exposes them.
16. Add Cloud Functions for invite redemption, trusted activity, notification fan-out, and cleanup where required.
17. Run the full application against the Emulator Suite.
18. Add a controlled switch between local and Firebase adapters.
19. Test a staging Firebase project with non-production accounts.
20. Enable Firebase adapters in production only after rules and emulator tests pass.

### Mock-data migration

Development fixture data does not need to migrate automatically. Provide an explicit emulator seed script that writes equivalent fixture documents.

Do not upload browser `localStorage` data silently. If a future product requirement calls for preserving user-created local data, build an explicit authenticated import flow that:

- Validates every entity.
- Reassigns ownership to the authenticated user.
- Rejects roles or grants the user is not authorized to create.
- Deduplicates rooms, wishlists, items, and reservations.
- Reports partial failures.

## Testing plan with Firebase Emulator

### Emulator services

Use:

- Authentication Emulator
- Firestore Emulator
- Storage Emulator
- Functions Emulator when callable workflows are introduced
- Emulator UI for debugging only

### Test layers

#### Repository contract tests

Run the same behavioral suite against local and Firebase adapters:

- Authentication lifecycle
- Room creation and membership
- Privacy-mode changes
- Visibility grants
- Wishlist reads and CRUD
- Reservation conflicts
- Activity queries
- Notification read state

#### Firestore Rules tests

Use `@firebase/rules-unit-testing` with isolated test environments. Cover allow and deny cases for:

- Unauthenticated access
- Non-member access
- Removed and pending memberships
- Owner, admin, and member actions
- Private, shared, and public wishlist reads
- Missing and present visibility grants
- Editing another user's wishlist
- Self-reservation
- Duplicate reservations
- Reading reservation identity as the recipient
- Administrator removal and role changes
- Notification access by another user
- Illegal field or ownership changes

Every permission matrix row should have at least one positive and one negative test where applicable.

#### Storage Rules tests

Test:

- Owner image upload
- Non-owner upload denial
- Non-member denial
- Invalid MIME type
- Oversized file
- Path ownership mismatch
- Owner deletion

#### Integration tests

Run critical browser flows against emulators:

- Register and initialize profile
- Create a room
- Join through an invite
- Add and edit wishlist items
- Upload and replace an image
- Change privacy modes and grants
- Reserve and purchase an item
- Review a join request
- Read notifications

### Emulator data lifecycle

- Start emulators with deterministic ports.
- Clear data between test suites.
- Seed fixed IDs and timestamps.
- Never connect tests to production.
- Fail tests when required emulator environment variables are absent.
- Export emulator data only for manual development fixtures, not automated tests.

## Environment variable plan

### Client variables

Vite exposes only variables prefixed with `VITE_`:

```text
VITE_DATA_PROVIDER=local|firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATORS=false
```

Firebase web configuration is not a secret. Security depends on Authentication, Security Rules, App Check, and backend validation.

### Environment files

```text
.env.example
.env.development.local
.env.test.local
.env.staging.local
.env.production.local
```

Commit `.env.example` with empty values and documentation. Ignore all `*.local` environment files.

Recommended provider behavior:

- Development defaults to `local`.
- Emulator development explicitly uses `firebase` plus `VITE_USE_FIREBASE_EMULATORS=true`.
- Test configuration points only to emulators.
- Staging and production require explicit Firebase values.
- The application fails fast with a clear configuration error when Firebase is selected but variables are missing.

### Server variables

Cloud Functions use server-managed Firebase configuration or secret management. Never expose:

- Service-account JSON
- Admin SDK private keys
- Email-provider credentials
- Webhook signing secrets
- Third-party API secrets

Use Secret Manager for function secrets and separate Firebase projects for development, staging, and production.

### Deployment safeguards

- Confirm the target Firebase project before deployment.
- Deploy rules and indexes through version-controlled configuration.
- Run emulator rule tests in CI before deployment.
- Use Firebase App Check for production web traffic.
- Restrict API keys by appropriate APIs and web origins as defense in depth.
- Monitor denied-rule events, Auth abuse, Storage usage, and callable-function errors.
