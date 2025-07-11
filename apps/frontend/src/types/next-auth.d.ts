import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    accessToken?: string
  }

  interface Session {
    accessToken?: string
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
} 