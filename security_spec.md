# Security Specification: Pregnancy Symptom Logs

## 1. Data Invariants
1. Each symptom log belongs to a specific authenticated user defined by `userId`.
2. A user can only create, read, update, and delete their own symptom logs (`request.auth.uid == userId`).
3. Cross-user reading or writing of symptom logs is strictly forbidden.
4. Unauthenticated users cannot read or write any logs.
5. `userId` in the document data must match `request.auth.uid` and path `{userId}`.
6. The `userId` field is immutable on updates (`incoming().userId == existing().userId`).
7. `morningSickness` must be one of: 'none', 'mild', 'moderate', 'severe'.
8. `energyLevel` must be an integer between 1 and 5.
9. `cravings` string cannot exceed 500 characters.
10. `notes` string cannot exceed 1000 characters.
11. `symptoms` array cannot exceed 20 items.
12. Document ID `{logId}` must be valid alphanumeric or hyphen/underscore, max 128 characters.

## 2. The Dirty Dozen Payloads (Forbidden Actions)
1. **Unauthenticated Read**: Attempting to read `/users/user1/symptomLogs/2026-10-09` without auth token -> DENIED.
2. **Cross-User Snooping**: Authenticated as `user2`, trying to get or list `/users/user1/symptomLogs` -> DENIED.
3. **Cross-User Creation**: Authenticated as `user2`, trying to create a log in `/users/user1/symptomLogs/2026-10-09` -> DENIED.
4. **Identity Spoofing**: Authenticated as `user1`, payload contains `userId: "user2"` -> DENIED.
5. **Ownership Hijack on Update**: Authenticated as `user1`, trying to update `userId` to `attacker_id` -> DENIED.
6. **Invalid Morning Sickness Value**: Payload has `morningSickness: "extreme_super_sick"` -> DENIED.
7. **Out of Range Energy Level**: Payload has `energyLevel: 10` or `energyLevel: -1` -> DENIED.
8. **Oversized Cravings String (Denial of Wallet)**: Payload has 50KB string in `cravings` -> DENIED.
9. **Oversized Notes String**: Payload has 100KB string in `notes` -> DENIED.
10. **Unbounded Symptoms Array**: Payload has 500 items in `symptoms` array -> DENIED.
11. **ID Poisoning Attack**: Attempting to create log with 2KB junk string document ID -> DENIED.
12. **Blanket Query Scraping**: Attempting to query logs across all users -> DENIED.
