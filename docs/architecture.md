# WishList Hub Architecture

## 1. Project goal

WishList Hub is a responsive React application for creating and sharing personal wishlists inside private rooms. It supports families, friends, celebrations, and gift exchanges while preventing duplicate purchases and preserving surprise gifts.

The first implementation phase will:

- Build a production-oriented React, TypeScript, and Tailwind CSS application at the repository root.
- Use the existing `prototype/` application and static HTML mockups as the visual and interaction reference.
- Keep `prototype/` unchanged as a reference implementation.
- Provide local, versioned mock data behind repository interfaces.
- Enforce room roles and wishlist visibility consistently in routes, UI, and data operations.
- Keep Firebase-specific code out of UI components so Firebase can replace local persistence later.

The initial application is frontend-only. Authentication, persistence, and server-side authorization are simulated locally until the Firebase phase.

### Design principles

- Use strict TypeScript and stable IDs for all domain entities.
- Keep domain rules independent from React components.
- Keep storage access behind typed repository interfaces.
- Treat UI permission guards as usability controls, not security boundaries.
- Reproduce the prototype's soft pink, cream, lavender, rounded-card design while improving responsiveness and accessibility.
- Prefer app-owned Tailwind components over adding a second full UI framework.

## 2. Final folder structure

The production application will live at the repository root. The existing `prototype/` directory remains intact.

```text
Wishlist/
├── docs/
│   └── architecture.md
├── prototype/                    # Unchanged visual and behavioral reference
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── components/
│   │   ├── activity/
│   │   │   ├── ActivityList.tsx
│   │   │   └── ActivityRow.tsx
│   │   ├── admin/
│   │   │   ├── AdminActivityLog.tsx
│   │   │   ├── MemberActionsMenu.tsx
│   │   │   ├── PrivacyModeSelector.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   ├── RoomSettingsForm.tsx
│   │   │   └── VisibilityMatrix.tsx
│   │   ├── dashboard/
│   │   │   ├── RecentNotifications.tsx
│   │   │   ├── RoomSummaryList.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   └── WishlistPreviewCard.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── MobileNavigation.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNavigation.tsx
│   │   ├── navigation/
│   │   │   ├── AdminRoute.tsx
│   │   │   ├── PermissionBoundary.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoomSwitcher.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationRow.tsx
│   │   ├── rooms/
│   │   │   ├── CreateRoomDialog.tsx
│   │   │   ├── InviteCodePanel.tsx
│   │   │   ├── JoinRequestList.tsx
│   │   │   ├── JoinRoomForm.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── RoomHeader.tsx
│   │   │   ├── RoomList.tsx
│   │   │   └── RoomMemberList.tsx
│   │   ├── ui/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   └── wishlist/
│   │       ├── AddItemDrawer.tsx
│   │       ├── DeleteItemDialog.tsx
│   │       ├── ItemStatusBadge.tsx
│   │       ├── ReserveItemDialog.tsx
│   │       ├── WishlistFilters.tsx
│   │       ├── WishlistGrid.tsx
│   │       ├── WishlistItemCard.tsx
│   │       ├── WishlistItemForm.tsx
│   │       ├── WishlistProgress.tsx
│   │       └── WishlistToolbar.tsx
│   ├── data/
│   │   ├── mock/
│   │   │   ├── fixtures.ts
│   │   │   ├── localStorage.ts
│   │   │   └── seed.ts
│   │   └── repositories/
│   │       ├── contracts.ts
│   │       ├── local/
│   │       │   ├── LocalActivityRepository.ts
│   │       │   ├── LocalAuthRepository.ts
│   │       │   ├── LocalNotificationRepository.ts
│   │       │   ├── LocalRoomRepository.ts
│   │       │   └── LocalWishlistRepository.ts
│   │       └── firebase/         # Added during the Firebase phase
│   ├── features/
│   │   ├── activity/
│   │   ├── auth/
│   │   ├── notifications/
│   │   ├── permissions/
│   │   │   └── permissionRules.ts
│   │   ├── reservations/
│   │   ├── rooms/
│   │   └── wishlist/
│   ├── hooks/
│   ├── lib/
│   │   ├── dates.ts
│   │   ├── errors.ts
│   │   ├── ids.ts
│   │   └── validation.ts
│   ├── pages/
│   │   ├── ActivityPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── ProfileSettingsPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RoomActivityPage.tsx
│   │   ├── RoomMembersPage.tsx
│   │   ├── RoomOverviewPage.tsx
│   │   ├── RoomSettingsPage.tsx
│   │   ├── RoomsPage.tsx
│   │   ├── SharedWishlistPage.tsx
│   │   └── WishlistPage.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── test/
│   │   ├── factories.ts
│   │   ├── render.tsx
│   │   └── setup.ts
│   ├── types/
│   │   └── domain.ts
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

Feature folders contain state and use-case logic. Shared presentation belongs in `components/`; route-level composition belongs in `pages/`; persistence belongs in `data/repositories/`.

## 3. Page routes

React Router will provide URL-based navigation. Room routes use stable `roomId` values instead of room names or global selected-room state.

| Route | Page | Access rule | Purpose |
| --- | --- | --- | --- |
| `/login` | `LoginPage` | Public-only | Sign in with the local mock provider, later Firebase Auth. |
| `/register` | `RegisterPage` | Public-only | Create an account. |
| `/forgot-password` | `ForgotPasswordPage` | Public-only | Request a password reset. |
| `/` | Redirect | Authenticated | Redirect to `/dashboard`. |
| `/dashboard` | `DashboardPage` | Authenticated | Show personal statistics, room summaries, wishlist previews, and recent notifications. |
| `/wishlist` | `WishlistPage` | Authenticated | Manage the current user's wishlist. |
| `/wishlist/new` | `WishlistPage` with drawer | Authenticated | Render the add-item drawer over the wishlist route. |
| `/wishlist/:wishlistId` | `SharedWishlistPage` | `canViewWishlist` | View another member's wishlist when room visibility permits it. |
| `/rooms` | `RoomsPage` | Authenticated | List joined rooms and expose create/join actions. |
| `/rooms/:roomId` | `RoomOverviewPage` | Room member | Show room summary and permitted wishlists. |
| `/rooms/:roomId/members` | `RoomMembersPage` | Room member | Show members; admin actions remain permission-gated. |
| `/rooms/:roomId/activity` | `RoomActivityPage` | Room owner/admin | Show room-wide activity. |
| `/rooms/:roomId/settings` | `RoomSettingsPage` | Room owner/admin | Manage room details, privacy mode, roles, and visibility grants. |
| `/activity` | `ActivityPage` | Authenticated | Show the current user's activity. |
| `/notifications` | `NotificationsPage` | Authenticated | Show read and unread notifications. |
| `/settings/profile` | `ProfileSettingsPage` | Authenticated | Update account details and preferences. |
| `*` | `NotFoundPage` | Any | Display a route-aware not-found state. |

Route guards must wait for authentication and repository initialization before redirecting. Permission failures render an explicit unauthorized state or return the user to the room overview without exposing restricted data.

## 4. Component hierarchy

```text
App
└── AppProviders
    └── RouterProvider
        ├── PublicOnlyRoute
        │   ├── LoginPage
        │   ├── RegisterPage
        │   └── ForgotPasswordPage
        ├── ProtectedRoute
        │   └── AppShell
        │       ├── TopNavigation
        │       │   ├── RoomSwitcher
        │       │   └── UserMenu
        │       ├── Sidebar
        │       ├── MobileNavigation
        │       └── Outlet
        │           ├── DashboardPage
        │           │   ├── PageHeader
        │           │   ├── StatsGrid
        │           │   │   └── StatCard
        │           │   ├── WishlistPreviewCard
        │           │   ├── RoomSummaryList
        │           │   └── RecentNotifications
        │           ├── WishlistPage
        │           │   ├── PageHeader
        │           │   ├── WishlistToolbar
        │           │   │   └── WishlistFilters
        │           │   ├── WishlistProgress
        │           │   ├── WishlistGrid
        │           │   │   └── WishlistItemCard
        │           │   │       └── ItemStatusBadge
        │           │   ├── AddItemDrawer
        │           │   │   └── WishlistItemForm
        │           │   └── DeleteItemDialog
        │           ├── SharedWishlistPage
        │           │   ├── PermissionBoundary
        │           │   ├── WishlistGrid
        │           │   └── ReserveItemDialog
        │           ├── RoomsPage
        │           │   ├── RoomList
        │           │   │   └── RoomCard
        │           │   ├── CreateRoomDialog
        │           │   └── JoinRoomForm
        │           ├── RoomOverviewPage
        │           │   ├── RoomHeader
        │           │   ├── InviteCodePanel
        │           │   └── permitted wishlist previews
        │           ├── RoomMembersPage
        │           │   ├── RoomMemberList
        │           │   ├── PermissionBoundary
        │           │   │   ├── MemberActionsMenu
        │           │   │   └── RoleSelector
        │           │   └── JoinRequestList
        │           ├── AdminRoute
        │           │   ├── RoomActivityPage
        │           │   │   └── AdminActivityLog
        │           │   └── RoomSettingsPage
        │           │       ├── RoomSettingsForm
        │           │       ├── PrivacyModeSelector
        │           │       └── VisibilityMatrix
        │           ├── ActivityPage
        │           │   └── ActivityList
        │           ├── NotificationsPage
        │           │   └── NotificationList
        │           └── ProfileSettingsPage
        └── NotFoundPage
```

Pages retrieve data through feature hooks and repository contracts. Presentational components receive typed props and do not read from `localStorage` or Firebase directly.

## 5. Data models

All IDs are opaque strings. All persisted timestamps are ISO 8601 strings in mock storage and Firebase timestamps in Firestore adapters.

```ts
type EntityId = string;
type ISODateString = string;

interface User {
  id: EntityId;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

type RoomRole = "owner" | "admin" | "member";
type RoomPrivacyMode = "private" | "shared" | "public";
type MembershipStatus = "pending" | "active" | "removed";

interface Room {
  id: EntityId;
  name: string;
  description?: string;
  inviteCode: string;
  privacyMode: RoomPrivacyMode;
  ownerId: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

interface RoomMembership {
  id: EntityId;
  roomId: EntityId;
  userId: EntityId;
  role: RoomRole;
  status: MembershipStatus;
  joinedAt: ISODateString;
}

interface VisibilityGrant {
  id: EntityId;
  roomId: EntityId;
  viewerUserId: EntityId;
  wishlistOwnerId: EntityId;
  grantedByUserId: EntityId;
  createdAt: ISODateString;
}

interface Wishlist {
  id: EntityId;
  roomId: EntityId;
  ownerId: EntityId;
  title: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

type WishlistItemStatus =
  | "available"
  | "reserved"
  | "purchased"
  | "removed"
  | "out_of_stock";

type WishlistItemPriority = "low" | "medium" | "high";

interface WishlistItem {
  id: EntityId;
  wishlistId: EntityId;
  name: string;
  description?: string;
  category?: string;
  priority: WishlistItemPriority;
  estimatedPriceCents?: number;
  currency?: string;
  productUrl?: string;
  imageUrl?: string;
  quantityDesired: number;
  notes?: string;
  status: WishlistItemStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

type ReservationStatus = "reserved" | "purchased" | "cancelled";

interface Reservation {
  id: EntityId;
  roomId: EntityId;
  itemId: EntityId;
  reservedByUserId: EntityId;
  status: ReservationStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

type JoinRequestStatus = "pending" | "approved" | "rejected";

interface JoinRequest {
  id: EntityId;
  roomId: EntityId;
  userId: EntityId;
  status: JoinRequestStatus;
  reviewedByUserId?: EntityId;
  createdAt: ISODateString;
  reviewedAt?: ISODateString;
}

type ActivityAction =
  | "room_created"
  | "room_joined"
  | "room_updated"
  | "member_added"
  | "member_removed"
  | "role_changed"
  | "visibility_changed"
  | "item_added"
  | "item_updated"
  | "item_removed"
  | "item_reserved"
  | "item_purchased";

interface ActivityEvent {
  id: EntityId;
  actorUserId: EntityId;
  roomId?: EntityId;
  wishlistId?: EntityId;
  itemId?: EntityId;
  action: ActivityAction;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: ISODateString;
}

type NotificationType =
  | "room_invitation"
  | "join_request"
  | "member_joined"
  | "visibility_changed"
  | "item_reserved"
  | "item_purchased";

interface Notification {
  id: EntityId;
  recipientUserId: EntityId;
  type: NotificationType;
  roomId?: EntityId;
  actorUserId?: EntityId;
  metadata: Record<string, string | number | boolean | null>;
  readAt?: ISODateString;
  createdAt: ISODateString;
}
```

### Reservation privacy

Reservation records are separate from wishlist items. Repository responses must be shaped for the viewer:

- The wishlist owner receives item information without reservation identity.
- Eligible gift-givers can see that an item is unavailable and whether they hold the reservation.
- Other gift-givers cannot see the reserver's identity unless the product explicitly adds that feature.
- Admin access to reservation identity should be denied by default because room administration does not require revealing surprise-gift details.

## 6. Repository interfaces

The UI depends on interfaces, not storage implementations. All mutating methods perform authorization checks in the repository or a use-case layer before changing data.

```ts
interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  signIn(input: { email: string; password?: string }): Promise<User>;
  register(input: {
    displayName: string;
    email: string;
    password?: string;
  }): Promise<User>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updateProfile(patch: Partial<Pick<User, "displayName" | "avatarUrl">>): Promise<User>;
  subscribe(listener: (user: User | null) => void): () => void;
}

interface RoomRepository {
  listForUser(userId: EntityId): Promise<Room[]>;
  getById(roomId: EntityId): Promise<Room | null>;
  create(input: {
    name: string;
    description?: string;
    ownerId: EntityId;
  }): Promise<Room>;
  update(roomId: EntityId, patch: Partial<Pick<
    Room,
    "name" | "description" | "privacyMode"
  >>): Promise<Room>;
  joinByCode(userId: EntityId, inviteCode: string): Promise<RoomMembership>;
  leave(roomId: EntityId, userId: EntityId): Promise<void>;
  listMembers(roomId: EntityId): Promise<Array<RoomMembership & { user: User }>>;
  changeRole(roomId: EntityId, userId: EntityId, role: RoomRole): Promise<RoomMembership>;
  removeMember(roomId: EntityId, userId: EntityId): Promise<void>;
  listJoinRequests(roomId: EntityId): Promise<JoinRequest[]>;
  reviewJoinRequest(
    requestId: EntityId,
    decision: "approved" | "rejected"
  ): Promise<JoinRequest>;
  listVisibilityGrants(roomId: EntityId): Promise<VisibilityGrant[]>;
  setVisibilityGrant(input: {
    roomId: EntityId;
    viewerUserId: EntityId;
    wishlistOwnerId: EntityId;
    allowed: boolean;
  }): Promise<void>;
}

interface WishlistRepository {
  getOwn(roomId: EntityId, ownerId: EntityId): Promise<Wishlist | null>;
  getVisible(roomId: EntityId, viewerId: EntityId): Promise<Wishlist[]>;
  getById(wishlistId: EntityId, viewerId: EntityId): Promise<Wishlist | null>;
  listItems(wishlistId: EntityId, viewerId: EntityId): Promise<WishlistItem[]>;
  addItem(
    wishlistId: EntityId,
    input: Omit<WishlistItem, "id" | "wishlistId" | "createdAt" | "updatedAt">
  ): Promise<WishlistItem>;
  updateItem(
    itemId: EntityId,
    patch: Partial<Omit<WishlistItem, "id" | "wishlistId" | "createdAt">>
  ): Promise<WishlistItem>;
  removeItem(itemId: EntityId): Promise<void>;
  reserveItem(itemId: EntityId, userId: EntityId): Promise<Reservation>;
  cancelReservation(itemId: EntityId, userId: EntityId): Promise<void>;
  markPurchased(itemId: EntityId, userId: EntityId): Promise<Reservation>;
}

interface ActivityRepository {
  listForUser(userId: EntityId): Promise<ActivityEvent[]>;
  listForRoom(roomId: EntityId): Promise<ActivityEvent[]>;
  append(event: Omit<ActivityEvent, "id" | "createdAt">): Promise<ActivityEvent>;
}

interface NotificationRepository {
  listForUser(userId: EntityId): Promise<Notification[]>;
  markRead(notificationId: EntityId): Promise<Notification>;
  markAllRead(userId: EntityId): Promise<void>;
  subscribe(
    userId: EntityId,
    listener: (notifications: Notification[]) => void
  ): () => void;
}
```

Expected failure types include unauthenticated, forbidden, not found, validation, conflict, and storage unavailable. Components receive typed errors and must not silently discard repository failures.

## 7. Permission matrix

### Role permissions

| Action | Owner | Admin | Member | Non-member |
| --- | ---: | ---: | ---: | ---: |
| View room overview | Yes | Yes | Yes | No |
| Edit room name or description | Yes | Yes | No | No |
| Change room privacy mode | Yes | Yes | No | No |
| View room members | Yes | Yes | Yes | No |
| Invite or approve members | Yes | Yes | No | No |
| Remove regular members | Yes | Yes | No | No |
| Remove an admin | Yes | No | No | No |
| Promote or demote admins | Yes | No, unless delegated later | No | No |
| Transfer ownership | Yes | No | No | No |
| Delete room | Yes | No | No | No |
| View room-wide activity | Yes | Yes | No | No |
| Manage visibility grants | Yes | Yes | No | No |
| Create and manage own wishlist | Yes | Yes | Yes | No |
| Edit another user's wishlist | No | No | No | No |
| Reserve an eligible item for another user | Yes | Yes | Yes | No |
| Reserve own wishlist item | No | No | No | No |

An owner or admin's ability to view all wishlists does not grant the ability to edit or reserve items on their own wishlist.

### Wishlist visibility

| Room mode | Owner/Admin viewer | Member viewing own list | Member viewing another list | Non-member |
| --- | ---: | ---: | ---: | ---: |
| Private | Yes | Yes | No | No |
| Shared | Yes | Yes | Only with an explicit grant | No |
| Public | Yes | Yes | Yes | No |

### Central permission functions

Pure functions in `features/permissions/permissionRules.ts` are the canonical frontend policy:

```ts
canViewRoom(actor, room, membership): boolean
canManageRoom(actor, room, membership): boolean
canManageRoles(actor, room, membership): boolean
canViewWishlist(actor, wishlist, room, memberships, grants): boolean
canEditWishlist(actor, wishlist): boolean
canReserveItem(actor, item, wishlist, room, memberships, grants): boolean
canViewRoomActivity(actor, membership): boolean
```

These functions are unit-tested against every matrix row. Route guards, controls, repositories, and future Firestore Security Rules must implement the same policy. The browser implementation alone is not a security boundary.

## 8. Mock data strategy

### Goals

- Exercise all routes and permission states without a backend.
- Persist user changes across reloads.
- Keep test runs deterministic.
- Avoid the prototype's global room-mode storage and destructive partial writes.
- Make replacement with Firebase adapters mechanical.

### Storage format

Use one versioned root document in `localStorage`:

```ts
interface MockDatabase {
  schemaVersion: 1;
  currentUserId: EntityId | null;
  users: User[];
  rooms: Room[];
  memberships: RoomMembership[];
  visibilityGrants: VisibilityGrant[];
  wishlists: Wishlist[];
  wishlistItems: WishlistItem[];
  reservations: Reservation[];
  joinRequests: JoinRequest[];
  activityEvents: ActivityEvent[];
  notifications: Notification[];
}
```

The local database module will:

1. Load and validate the complete document.
2. Seed fixtures only when data is absent.
3. Run explicit migrations when `schemaVersion` changes.
4. Update entities transactionally in memory.
5. Persist the complete validated result.
6. Emit a same-tab subscription event after successful writes.
7. Listen for browser `storage` events for cross-tab synchronization.

Repositories return copies or mapped view models so components cannot mutate stored objects accidentally.

### Required fixture scenarios

- An owner/admin user and a regular-member user.
- Private, shared, and public rooms.
- Active, pending, and removed memberships.
- Explicit shared-mode visibility grants and denied pairs.
- Empty and populated wishlists.
- Every wishlist item status and priority.
- A reservation owned by the current viewer.
- A reservation owned by another gift-giver.
- Join requests awaiting admin review.
- Read and unread notifications.
- User-level and admin-only activity.
- Empty-state fixtures for dashboard, rooms, wishlist, activity, and notifications.

Fixtures use fixed IDs and timestamps. Runtime-created entities use a centralized ID generator. Tests create isolated in-memory repository instances rather than sharing browser `localStorage`.

### Mock authentication

The local auth adapter selects fixture users or registers a local user. It may accept a password field for UI parity but must state clearly that local authentication is simulated and insecure. No production password should ever be persisted in mock storage.

## 9. Firebase-later plan

Firebase integration is a separate phase after the mock-backed application and permission tests are stable.

### Service mapping

| Application concern | Firebase service |
| --- | --- |
| Registration, login, logout, password reset | Firebase Authentication |
| Users, rooms, memberships, grants, wishlists, items | Cloud Firestore |
| Wishlist item images | Cloud Storage |
| Trusted notification fan-out or multi-document workflows | Cloud Functions, only where needed |
| Local integration and security testing | Firebase Emulator Suite |

### Proposed Firestore layout

```text
users/{userId}
rooms/{roomId}
rooms/{roomId}/members/{userId}
rooms/{roomId}/visibilityGrants/{grantId}
rooms/{roomId}/joinRequests/{requestId}
wishlists/{wishlistId}
wishlists/{wishlistId}/items/{itemId}
reservations/{reservationId}
activity/{eventId}
notifications/{notificationId}
```

Reservation documents must not be readable by wishlist recipients. Item documents should expose only the availability information appropriate for the authenticated viewer. If Firestore query constraints make safe redaction impractical, use separate public item state and private reservation documents rather than relying on client-side field removal.

### Migration sequence

1. Add Firebase configuration through environment variables and commit only an example environment file.
2. Implement `FirebaseAuthRepository`.
3. Implement Firestore repository adapters one domain at a time.
4. Select local or Firebase adapters in `AppProviders`; page components remain unchanged.
5. Implement Firestore Security Rules from the tested permission matrix.
6. Add rule tests for allow and deny cases with the Emulator Suite.
7. Implement Storage Rules for authenticated item-image upload and owner-only modification.
8. Add transactional reservation creation to prevent duplicate reservations.
9. Add server-created activity and notification records for operations that require trusted attribution.
10. Migrate or discard local mock data explicitly; do not silently mix local and cloud records.
11. Run end-to-end tests against emulators before enabling production Firebase.

The Firebase adapter must translate Firestore timestamps and snapshots into the domain models at the repository boundary.

## 10. Step-by-step implementation milestones

### Milestone 1: Application foundation

- Scaffold Vite with React and strict TypeScript at the repository root.
- Add Tailwind CSS, React Router, Vitest, and React Testing Library.
- Configure linting, formatting, import aliases, and test setup.
- Preserve `prototype/` and exclude its build output from production tooling.

**Exit criteria:** The root application builds, tests run, and `prototype/` is unchanged.

### Milestone 2: Design system and responsive shell

- Define Tailwind tokens for the prototype palette, typography, radii, borders, and shadows.
- Load Inter and Playfair Display.
- Build accessible UI primitives.
- Build desktop top navigation/sidebar and a purpose-built mobile navigation.
- Add focus, reduced-motion, loading, empty, and error styles.

**Exit criteria:** The shell matches the prototype at desktop widths and remains usable on mobile.

### Milestone 3: Domain and permissions

- Add all domain types and validation boundaries.
- Implement the permission functions.
- Add exhaustive table-driven tests for role and visibility rules.
- Define typed application errors.

**Exit criteria:** Every permission-matrix row has a passing allow or deny test.

### Milestone 4: Mock repositories

- Create deterministic fixtures and the versioned mock database.
- Implement local auth, room, wishlist, activity, and notification repositories.
- Add schema validation, atomic updates, subscriptions, and typed errors.
- Test persistence without using shared global test state.

**Exit criteria:** Repository contract tests pass and unrelated collections survive every mutation.

### Milestone 5: Routing and authentication

- Configure public, protected, nested room, admin, and not-found routes.
- Add simulated login, registration, logout, and password-reset flows.
- Preserve intended destinations through authentication redirects.
- Prevent redirects before auth initialization completes.

**Exit criteria:** Direct URL entry, refreshes, protected routes, and unauthorized routes behave predictably.

### Milestone 6: Dashboard

- Implement statistics, wishlist previews, room summaries, notifications, skeletons, and empty states.
- Connect all data through repository-backed feature hooks.

**Exit criteria:** Dashboard states match prototype styling and derive from mock data rather than hard-coded component values.

### Milestone 7: Wishlist management

- Implement filters, progress, item grid, status badges, and item actions.
- Implement add/edit using the route-aware drawer.
- Add validation and delete confirmation.
- Ensure only owners can mutate their wishlist.

**Exit criteria:** Wishlist CRUD persists across reloads and all validation/error states are tested.

### Milestone 8: Rooms

- Implement joined-room listing, create-room dialog, and join-by-code flow.
- Implement room overview, member list, invite code, and join requests.
- Use route `roomId` as the source of selected-room state.

**Exit criteria:** Create, join, leave, select, and refresh flows use stable IDs and preserve data integrity.

### Milestone 9: Admin controls

- Implement room settings, privacy selector, visibility matrix, membership actions, and role management.
- Guard admin routes and individual controls.
- Record administrative actions in the room activity log.

**Exit criteria:** Non-admin users cannot invoke admin operations through either UI controls or repositories.

### Milestone 10: Reservations, activity, and notifications

- Implement reserve, cancel, and purchased workflows.
- Prevent self-reservation and duplicate reservation conflicts.
- Redact reservation identity from recipients.
- Implement user activity, admin room activity, and notification read state.

**Exit criteria:** Reservation privacy and conflict cases pass integration tests.

### Milestone 11: Quality and visual parity

- Test critical routes, forms, repository failures, and permission transitions.
- Perform keyboard and screen-reader checks.
- Compare pages with the prototype and static mockups at desktop and mobile widths.
- Resolve inconsistent loading, empty, error, and unauthorized states.

**Exit criteria:** Production build succeeds, tests pass, primary flows are accessible, and visual review is complete.

### Milestone 12: Firebase integration

- Add Firebase adapters behind existing contracts.
- Implement and test Security Rules and Storage Rules with emulators.
- Add transactional reservation handling and trusted event creation.
- Run end-to-end tests against the Emulator Suite.

**Exit criteria:** Switching repository providers enables Firebase without page or presentational-component rewrites, and emulator tests prove both allowed and denied access.
