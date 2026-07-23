const VERIFY_EMAIL_KEY = "campusrank:verify-email";
const LOGIN_EMAIL_KEY = "campusrank:login-email";
const VERIFIED_FLAG_KEY = "campusrank:email-verified";

function read(key: string) {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy mode
  }
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function setPendingVerifyEmail(email: string) {
  write(VERIFY_EMAIL_KEY, email.trim().toLowerCase());
}

export function getPendingVerifyEmail() {
  return read(VERIFY_EMAIL_KEY).trim().toLowerCase();
}

export function clearPendingVerifyEmail() {
  remove(VERIFY_EMAIL_KEY);
}

export function setVerifiedLoginEmail(email: string) {
  write(LOGIN_EMAIL_KEY, email.trim().toLowerCase());
  write(VERIFIED_FLAG_KEY, "1");
}

export function consumeVerifiedLoginState() {
  const verified = read(VERIFIED_FLAG_KEY) === "1";
  const email = read(LOGIN_EMAIL_KEY).trim().toLowerCase();
  remove(VERIFIED_FLAG_KEY);
  remove(LOGIN_EMAIL_KEY);
  return { verified, email };
}
