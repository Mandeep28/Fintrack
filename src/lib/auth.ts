import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // If user doesn't exist, return generic error (do not leak user existence)
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if account is deactivated or soft-deleted
        if (user.status === "DEACTIVATED") {
          throw new Error("Your account has been deactivated. Please contact support.");
        }
        if (user.status === "DELETED") {
          throw new Error("Your account has been deleted. Please contact support within 30 days to recover it.");
        }

        // If user registered with Google / has no password set
        if (!user.password || user.provider === "google") {
          throw new Error("This account is registered with Google. Please use 'Sign in with Google' to continue.");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email address before signing in.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        // Generic error if password does not match
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "USER",
          status: user.status || "ACTIVE",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const email = user.email.toLowerCase().trim();
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          if (existingUser.status === "DEACTIVATED") {
            throw new Error("Your account has been deactivated. Please contact support.");
          }
          if (existingUser.status === "DELETED") {
            throw new Error("Your account has been deleted. Please contact support within 30 days to recover it.");
          }
          user.id = existingUser.id;
          user.role = existingUser.role;
          user.status = existingUser.status;

          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              isVerified: true,
              emailVerified: existingUser.emailVerified || new Date(),
              ...(!existingUser.password ? { provider: "google" } : {}),
            },
          });
        } else {
          const newUser = await prisma.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              provider: "google",
              role: "USER",
              status: "ACTIVE",
              isVerified: true,
              emailVerified: new Date(),
            },
          });
          user.id = newUser.id;
          user.role = newUser.role;
          user.status = newUser.status;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role || "USER";
        token.status = user.status || "ACTIVE";
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture;
        session.user.role = (token.role as string) || "USER";
        session.user.status = (token.status as string) || "ACTIVE";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
