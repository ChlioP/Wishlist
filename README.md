# WishList Hub

## Overview

WishList Hub is a collaborative wishlist management platform that allows groups of users to create, organize, and share personal wishlists within private rooms. The application is designed for families, friend groups, holiday gift exchanges, birthdays, weddings, Secret Santa events, and other occasions where users want to share gift ideas while maintaining privacy controls.

The system uses a role-based access model where an administrator manages room membership and controls wishlist visibility settings. Each user can maintain their own wishlist while administrators determine whether wishlists remain private or can be viewed by other members.

The goal of the platform is to simplify gift planning, reduce duplicate purchases, and provide flexible privacy management for group-based wishlist sharing.

---

# Problem Statement

Traditional wishlist sharing methods often rely on spreadsheets, messaging apps, or social media posts. These methods create several challenges:

* Lack of privacy controls
* No centralized wishlist management
* Difficulty organizing group gift exchanges
* Duplicate gift purchases
* Limited ability to manage visibility permissions
* No administrator oversight

WishList Hub addresses these issues by providing a centralized platform where users can securely manage and share wishlists within controlled environments.

---

# Key Features

## User Authentication

### Account Registration

Users can create an account using:

* Name
* Email
* Password

### Login System

Secure authentication allows users to:

* Sign in
* Sign out
* Reset password
* Update profile information

---

# Room Management

## Create Room

Administrators can create private rooms for:

* Family groups
* Friend groups
* Birthday parties
* Holiday events
* Wedding registries
* Secret Santa exchanges

Each room includes:

* Room name
* Room description
* Room code
* Creation date
* Administrator information

---

## Join Room

Users can join rooms using:

* Invitation link
* Invitation code
* Administrator approval

---

## Room Membership Management

Only administrators can:

* Add members
* Remove members
* Approve join requests
* Promote another administrator
* Manage room settings

---

# Wishlist Management

## Personal Wishlist

Each user can create and maintain their own wishlist.

Wishlist items may include:

* Product name
* Description
* Category
* Priority level
* Price estimate
* Product URL
* Product image
* Quantity desired
* Notes

---

## Item Categories

Examples:

* Electronics
* Books
* Clothing
* Gaming
* Home Decor
* Beauty Products
* Sports
* Collectibles
* Travel
* Custom Categories

---

## Item Status Tracking

Items can be marked as:

* Available
* Reserved
* Purchased
* Removed
* Out of Stock

---

# Privacy Control System

One of the core features of WishList Hub is its advanced privacy model.

## Default Privacy

By default:

* Users can only view their own wishlist.
* Other members cannot see each other's wishlist.

---

## Administrator Visibility

Administrators can view:

* All room members
* All wishlists
* Wishlist activity logs
* Visibility permissions

This allows administrators to oversee room activity and manage gift planning.

---

## Permission-Based Sharing

Administrators can configure visibility settings for each room.

### Mode 1: Private Mode

Users can only see:

* Their own wishlist

Administrators can see:

* All wishlists

---

### Mode 2: Shared Mode

Users can view:

* Their own wishlist
* Other approved members' wishlists

Administrators determine which users can view other wishlists.

---

### Mode 3: Public Room Mode

All room members can view:

* Every wishlist in the room

Administrators still maintain full management control.

---

# Permission Matrix

| Action               | User                | Admin |
| -------------------- | ------------------- | ----- |
| Create Wishlist      | Yes                 | Yes   |
| Edit Own Wishlist    | Yes                 | Yes   |
| Delete Own Wishlist  | Yes                 | Yes   |
| View Own Wishlist    | Yes                 | Yes   |
| View Others Wishlist | Permission Required | Yes   |
| Add Room Members     | No                  | Yes   |
| Remove Members       | No                  | Yes   |
| Manage Visibility    | No                  | Yes   |
| View Activity Logs   | No                  | Yes   |

---

# Reservation System

To prevent duplicate gifts, users may reserve wishlist items.

Example:

User A reserves a gift for User B.

The item becomes:

"Reserved"

The recipient does not see who reserved it.

Other users see that the item is unavailable.

This prevents duplicate purchases while maintaining surprise gift exchanges.

---

# Notification System

Users receive notifications when:

* Added to a room
* Visibility permissions change
* Wishlist item reserved
* Wishlist item purchased
* New member joins

Administrators receive notifications when:

* Join requests are submitted
* Members leave
* Wishlist reports are generated

---

# Dashboard

## User Dashboard

Displays:

* Personal wishlist
* Item statistics
* Recent activity
* Room memberships

---

## Admin Dashboard

Displays:

* Total rooms
* Total members
* Wishlist statistics
* Most requested items
* Room activity logs
* Permission settings

---

# Search and Filtering

Users can search wishlists using:

* Item name
* Category
* Price range
* Priority level
* User name
* Room name

---

# Technology Stack

## Frontend

* React.js
* TypeScript
* Tailwind CSS
* Material UI

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL

or

* MongoDB

## Authentication

* JWT Authentication
* bcrypt Password Hashing

## Cloud Services

* AWS S3 for image storage
* AWS EC2 for deployment

---

# Future Enhancements

* AI gift recommendation engine
* Amazon product integration
* Mobile application
* Group gifting support
* Budget tracking
* Birthday reminders
* Email notifications
* QR-code room invitations
* Multi-room management
* Analytics dashboard

---

# Learning Objectives

This project demonstrates:

* Full-stack web development
* Authentication and authorization
* Role-based access control (RBAC)
* Database design
* REST API development
* State management
* Secure user management
* Cloud deployment
* Real-world privacy and permission systems

---

# Example Use Case

1. Alice creates a Birthday Room.
2. Alice becomes the room administrator.
3. Alice invites Bob, Carol, and David.
4. Each member creates their personal wishlist.
5. By default, wishlists remain private.
6. Alice enables visibility between Bob and Carol.
7. David cannot view their wishlists.
8. Bob reserves an item from Carol's wishlist.
9. Other users see the item as reserved.
10. Duplicate gift purchases are prevented.
11. Administrators maintain full control over room settings and visibility permissions.

## Design Goal

WishList Hub is designed to be a free, beginner-friendly wishlist sharing platform with a soft, girly, and modern aesthetic. The goal is to make gift planning feel fun, cute, organized, and easy to use without requiring users to pay for premium features.

The visual theme should feel light, feminine, clean, and playful while still looking professional enough for a portfolio project.

### Theme Style

The app should use a soft girly design system with:

* Pastel pink, cream, blush, lavender, and white color tones
* Rounded cards and buttons
* Soft shadows
* Cute icons
* Heart, bow, sparkle, and gift elements
* Clean typography
* Minimal clutter
* Mobile-friendly layouts

### Suggested Color Palette

| Purpose          | Color   |
| ---------------- | ------- |
| Primary Pink     | #F8AFC8 |
| Soft Blush       | #FCE7EF |
| Cream Background | #FFF8F0 |
| Lavender Accent  | #D8C7FF |
| Text Color       | #3A2E39 |
| White Cards      | #FFFFFF |

### Suggested App Name Ideas

* LuvList
* GiftBloom
* BowList
* WishBabe
* PinkParcel
* DreamCart
* GiftNest
* Wishlist Café
* RibbonRoom
* HeartCart

### Free Platform Goal

The platform should be free for users. Users can create rooms, invite friends, add wishlist items, and manage privacy settings without payment.

The project can still include future monetization ideas, but the first version should stay completely free to use.

---

## Included mockups

This repository contains simple static mockups and UI sketches you can open in a browser to preview the visual design and flows described above:

- [wishlist_hub_mockup.html](wishlist_hub_mockup.html) — Dashboard and rooms overview mockup
- [wishlist_hub_my_wishlist.html](wishlist_hub_my_wishlist.html) — My Wishlist page mockup (item cards, filters, progress)
- [wishlist_hub_add_item_drawer.html](wishlist_hub_add_item_drawer.html) — Add-item drawer / form mockup
- [wishlist_hub_admin_room_settings.html](wishlist_hub_admin_room_settings.html) — Admin room settings mockup

To view any mockup, open the HTML file in your browser (double-click or use `open <filename>` on macOS). These files are static design prototypes and demonstrate UI ideas referenced in the README.

