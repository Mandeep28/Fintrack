import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      status?: string | null;
      image?: string | null;
      phoneNumber?: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role?: string | null;
    status?: string | null;
    image?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string | null;
    status?: string | null;
    picture?: string | null;
  }
}
