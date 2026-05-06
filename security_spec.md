# Security Specification for SmartSpend

## Data Invariants
- Every expense must be linked to a valid category ID (checked via static validation or get() if critical).
- Users can only read and write their own data under `users/{userId}`.
- Timestamps and IDs must be validated.
- Budget amounts must be positive.

## The Dirty Dozen Payloads (Rejection Tests)
1. Write to another user's collection: `setDoc(doc(db, "users/attacker/expenses/123"), ...)` -> DENIED
2. Expense with negative amount: `{ amount: -50, ... }` -> DENIED
3. Category with huge name (Denial of Wallet): `{ name: "A".repeat(10000), ... }` -> DENIED
4. Injected field in Category: `{ name: "Food", budget: 100, color: "red", isAdmin: true }` -> DENIED (Strict schema)
5. Expense with invalid Date format: `{ date: "yesterday", ... }` -> DENIED
6. Recurring expense with invalid period: `{ period: "yearly", ... }` -> DENIED
7. Removing essential flag from system entries? (Not applicable yet)
8. Spoofing `userId` in payload to match another user: (Handled by path check)
9. Creating an expense for a non-existent category? (Maybe too strict for MVP but good for reliability)
10. Rapid writes exhaustion? (Rate limiting is backend, but rules can restrict size)
11. Malicious ID injection: `users/uid/expenses/../..` -> DENIED by `isValidId`
12. Unauthenticated write -> DENIED

## Initial Rules Draft
I will focus on basic path security and strict schema validation for the three main entities.
