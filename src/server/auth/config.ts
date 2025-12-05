import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getHarviaIdToken, refreshHarviaIdToken } from "@/server/api/harvia";
import { db } from "@/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      harviaIdToken?: string;
      harviaAccessToken?: string;
      harviaRefreshToken?: string;
      harviaExpiresIn?: number;
    } & DefaultSession["user"];
    userId?: string;
  }

  interface JWT {
    harviaIdToken?: string;
    harviaAccessToken?: string;
    harviaRefreshToken?: string;
    harviaExpiresIn?: number;
    harviaTokenExpiresAt?: number;
    userId?: string;
  }
}

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "name",
      name: "Name",
      credentials: {
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name) {
          return null;
        }
        const name = credentials.name as string;
        const user = await db.user.create({
          data: {
            name,
          },
        });

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "name") {
        return true;
      }
      return false;
    },
    jwt: async ({ token, user, account }) => {
      if (account && user) {
        token.userId = user.id;
        if (account.provider === "harvia") {
          const harviaUser = user as any;
          token.harviaIdToken = harviaUser.idToken;
          token.harviaAccessToken = harviaUser.accessToken;
          token.harviaRefreshToken = harviaUser.refreshToken;
          token.harviaExpiresIn = harviaUser.expiresIn;
          token.harviaTokenExpiresAt =
            Date.now() + (harviaUser.expiresIn as number) * 1000;
        }
      }

      if (
        token.harviaTokenExpiresAt &&
        Date.now() < (token.harviaTokenExpiresAt as number)
      ) {
        return token;
      }

      if (token.harviaRefreshToken && token.email) {
        try {
          const newTokens = await refreshHarviaIdToken(
            token.harviaRefreshToken as string,
            token.email,
          );

          token.harviaIdToken = newTokens.idToken;
          token.harviaAccessToken = newTokens.accessToken;
          token.harviaExpiresIn = newTokens.expiresIn;
          token.harviaTokenExpiresAt = Date.now() + newTokens.expiresIn * 1000;
          return token;
        } catch (error) {
          console.error("Error refreshing Harvia token:", error);
          return { ...token, error: "RefreshAccessTokenError" as const };
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      session.userId = token.userId as string;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          harviaIdToken: token.harviaIdToken,
          harviaAccessToken: token.harviaAccessToken,
          harviaRefreshToken: token.harviaRefreshToken,
          harviaExpiresIn: token.harviaExpiresIn,
        },
      };
    },
  },
} satisfies NextAuthConfig;
