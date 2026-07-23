const FALLBACK_ADMIN_EMAIL = "24z218@psgtech.ac.in";

export function getAdminEmails() {
  const configured = [process.env.ADMIN_EMAILS, FALLBACK_ADMIN_EMAIL]
    .flatMap((value) => (value ?? "").split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(configured));
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
