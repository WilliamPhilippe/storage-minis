// Format messages rather than dumping error objects, which can include connection
// configuration. Keep nested driver errors: Drizzle wraps the useful PG message.
export function formatDatabaseError(
  error: unknown,
  password = process.env.PGPASSWORD,
): string {
  const messages: string[] = [];
  const seen = new Set<unknown>();
  let current = error;
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    if (current instanceof Error) {
      const code = "code" in current ? String(current.code) : "";
      messages.push(`${current.message}${code ? ` (${code})` : ""}`);
      current = current.cause;
    } else {
      messages.push(
        typeof current === "string" ? current : "Unknown database error.",
      );
      break;
    }
  }
  return redactDatabaseMessage(messages.join("\nCaused by: "), password);
}

export function redactDatabaseMessage(
  message: string,
  password = process.env.PGPASSWORD,
): string {
  // Also cover encoded passwords and connection URLs in upstream diagnostics.
  let result = message.replace(
    /(postgres(?:ql)?:\/\/)[^\s@]+@/gi,
    "$1[REDACTED]@",
  );
  if (password) {
    for (const value of new Set([password, encodeURIComponent(password)])) {
      result = result.replaceAll(value, "[REDACTED]");
    }
  }
  return result;
}
