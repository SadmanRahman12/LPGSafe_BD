import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          // Dynamic import to avoid crashing on import when DB is unavailable
          const { prisma } = await import("@/lib/prisma");

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              dealerProfile: true,
              inspectorProfile: true,
            },
          });

          if (!user || !user.passwordHash) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            dealerId: user.dealerProfile?.id,
            inspectorId: user.inspectorProfile?.id,
          };
        } catch (err: any) {
          // Re-throw auth errors (wrong password etc.)
          if (err.message === "Invalid email or password" || err.message === "Missing email or password") {
            throw err;
          }
          // DB connection errors — fail gracefully
          console.error("[NextAuth] Database error during authorize:", err.message);
          throw new Error("Service temporarily unavailable. Please try again later.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.dealerId = (user as any).dealerId;
        token.inspectorId = (user as any).inspectorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).dealerId = token.dealerId;
        (session.user as any).inspectorId = token.inspectorId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-lpgsafe-dev-secret-key-32chars",
};
