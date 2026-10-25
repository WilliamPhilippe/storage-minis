// Step 3B replaces this explicit gate only after the physical schema review.
// The mere presence of files is not evidence of owner approval.
export function requireApprovedSchema(): never {
  throw new Error(
    "Schema/migrations pending approval (Step 3B). No database or migration files were changed.",
  );
}
