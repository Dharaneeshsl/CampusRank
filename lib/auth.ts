import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { isAdminEmail } from "@/lib/admin";
import { consumeLoginTicket, consumeOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  ticket: z.string().min(32).max(128),
  otp: z.string().regex(/^\d{6}$/)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        ticket: {},
        otp: {}
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password || !user.emailVerified) return null;

        const validTicket = await consumeLoginTicket(email, parsed.data.ticket);
        if (!validTicket) return null;

        const validOtp = await consumeOtp(email, parsed.data.otp, "login");
        if (!validOtp) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.isAdmin = isAdminEmail(user.email);
      } else if (typeof token.email === "string") {
        token.isAdmin = isAdminEmail(token.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    }
  }
});
