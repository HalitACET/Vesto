# Vesto Web Migrations

## Migration v1: User Profile Setup & Stylist Mode

**Date:** 2026-05-12
**Description:** Adds `profileSetupCompleted` and `isStylistModeActive` fields to all existing users in Firestore.

### Fields Added:
- `profileSetupCompleted`: Set to `true` for existing users (to prevent them from being forced into the new profile setup flow). New users default to `false`.
- `isStylistModeActive`: Set to `false` for everyone.

### How to Run:
This script is written using Firebase Web SDK. To run it:
1. Ensure your environment has access to the Firebase project.
2. Run the `migrateUsers()` function from `migrate-users-v1.ts`.
3. Verify changes in the Firebase Console.

**Warning:** Always take a backup of the `users` collection before running migrations.
