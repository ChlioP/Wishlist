# Prototype: WishList Hub

This is a small, dependency-light React prototype demonstrating the privacy model and mockup components.

Run locally:

```bash
cd prototype
npm install
npm run dev
```

Open http://localhost:5173 (or the port Vite reports).

Run tests:

```bash
cd prototype
npm test
```

## Per-User Persistence & Activity Log

All user data is stored in **browser localStorage**, scoped by email address. Each user's data is isolated and persists across browser sessions.

### What Gets Stored
- **Wishlist items**: name, price, status (Available/Reserved/Purchased)
- **Rooms**: created and joined rooms
- **Activity log**: timestamped record of all user actions

### Accessing Activity

1. Sign in with your name and email
2. Click the **Activity** tab in the nav bar or sidebar
3. View all actions with timestamps (most recent first)
4. Click **Clear** to reset the log

### Logged Actions

- `Added item: [name]` — when you add a wishlist item
- `Removed item: [name]` — when you delete an item
- `Edited [item]: (name → ..., price → ...)` — when you change item details or status
- `Created room: [name]` — when you create a new room
- `Joined room: [name]` — when you join an existing room
- `Set [room] to [mode] mode` — when you change room visibility (Private/Shared/Public)

### Data Storage Keys

- `wishhub_user` — current signed-in user
- `wishhub_userdata_<email>` — rooms and items for that user
- `wishhub_activity_<email>` — activity log for that user
- `wishhub_room_modes` — per-room privacy settings

### Testing Persistence

1. **Same user**: Sign in with the same email → all previous data appears
2. **Different user**: Sign in with a different email → fresh app state
3. **Browser reload**: F5 → data persists if you use the same email
4. **Clear localStorage**: Open DevTools → Application → Storage → Clear All → start fresh
