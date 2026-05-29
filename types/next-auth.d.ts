import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      plan: "FREE" | "BASIC" | "PRO";
      subscriptionStatus: "FREE" | "ACTIVE" | "CANCELED" | "PAST_DUE";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: "FREE" | "BASIC" | "PRO";
    subscriptionStatus?: "FREE" | "ACTIVE" | "CANCELED" | "PAST_DUE";
  }
}
