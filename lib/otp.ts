import { createHash, randomBytes, randomInt } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export type OtpPurpose = "signup" | "login";

const OTP_TTL_MS = 10 * 60 * 1000;
const TICKET_TTL_MS = 10 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

export function otpIdentifier(email: string, purpose: OtpPurpose) {
  return purpose === "signup" ? email.toLowerCase() : `login:${email.toLowerCase()}`;
}

export function loginTicketIdentifier(email: string) {
  return `ticket:${email.toLowerCase()}`;
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

export function generateTicket() {
  return randomBytes(32).toString("hex");
}

export function rateLimit(key: string, limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS) {
  const now = Date.now();
  const entry = rateBuckets.get(key);
  if (!entry || entry.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }
  if (entry.count >= limit) {
    return { ok: false as const, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true as const };
}

/** Resend requires a verified sender. Use onboarding@resend.dev until your domain is verified. */
export function getEmailFrom() {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) return configured;
  return "CampusRank <onboarding@resend.dev>";
}

export function emailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function formatResendError(error: unknown) {
  if (!error || typeof error !== "object") return "Email delivery failed.";
  const record = error as { message?: string; name?: string };
  const message = record.message?.trim();
  if (!message) return "Email delivery failed.";
  if (message.toLowerCase().includes("domain is not verified")) {
    return "Sender domain is not verified in Resend. Set EMAIL_FROM to CampusRank <onboarding@resend.dev> for testing, or verify your domain at resend.com/domains.";
  }
  if (message.toLowerCase().includes("only send testing emails")) {
    return "Resend test mode only delivers to your Resend account email. Register with that address, or verify a custom domain.";
  }
  return message;
}

export async function createAndSendOtp(email: string, purpose: OtpPurpose) {
  if (!emailDeliveryConfigured()) {
    throw new EmailDeliveryError("Email delivery is not configured. Add RESEND_API_KEY to your environment.");
  }

  const normalized = email.toLowerCase();
  const otp = generateOtp();
  const token = hashValue(otp);
  const identifier = otpIdentifier(normalized, purpose);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + OTP_TTL_MS)
    }
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject =
    purpose === "signup" ? "Your CampusRank verification code" : "Your CampusRank sign-in code";

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: normalized,
    subject,
    html: `
      <p>Your CampusRank ${purpose === "signup" ? "verification" : "sign-in"} code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
    `
  });

  if (error) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    if (process.env.NODE_ENV === "development") {
      console.error("[CampusRank] Resend error:", error);
    }
    throw new EmailDeliveryError(formatResendError(error));
  }
}

export async function consumeOtp(email: string, otp: string, purpose: OtpPurpose) {
  if (!/^\d{6}$/.test(otp)) return false;

  const identifier = otpIdentifier(email, purpose);
  const token = hashValue(otp);
  const verification = await prisma.verificationToken.findFirst({
    where: { identifier, token }
  });

  if (!verification) return false;

  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: verification.token } });
    return false;
  }

  await prisma.verificationToken.delete({ where: { token: verification.token } });
  return true;
}

export async function createLoginTicket(email: string) {
  const normalized = email.toLowerCase();
  const ticket = generateTicket();
  const identifier = loginTicketIdentifier(normalized);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashValue(ticket),
      expires: new Date(Date.now() + TICKET_TTL_MS)
    }
  });

  return ticket;
}

export async function consumeLoginTicket(email: string, ticket: string) {
  if (!ticket || ticket.length < 32) return false;

  const identifier = loginTicketIdentifier(email);
  const token = hashValue(ticket);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token }
  });

  if (!record) return false;

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: record.token } });
    return false;
  }

  await prisma.verificationToken.delete({ where: { token: record.token } });
  return true;
}
