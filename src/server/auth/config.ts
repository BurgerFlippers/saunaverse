import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getHarviaIdToken, refreshHarviaIdToken } from "@/server/api/harvia";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      harviaIdToken?: string;
      harviaAccessToken?: string;
      harviaRefreshToken?: string;
      harviaExpiresIn?: number;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface JWT {
    harviaIdToken?: string;
    harviaAccessToken?: string;
    harviaRefreshToken?: string;
    harviaExpiresIn?: number;
    harviaTokenExpiresAt?: number;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Harvia",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        try {
          const harviaTokens = await getHarviaIdToken(username, password);

          // In a real application, you would link this to your internal user management
          // For this hackathon, we'll create a dummy user or find an existing one
          const user = await db.user.findUnique({
            where: { email: username },
          });

          let currentUser = user;
          if (!currentUser) {
            // Create a new user if not found (for hackathon purposes)
            currentUser = await db.user.create({
              data: {
                email: username,
                name: username, // Use username as name for simplicity
              },
            });
          }

          // Manually create Account record if it doesn't exist (required for CredentialsProvider + Adapter + Worker)
          let harviaAccount = await db.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "harvia",
                providerAccountId: currentUser.id, // Use userId as providerAccountId for unique linking
              },
            },
          });

          if (!harviaAccount) {
            harviaAccount = await db.account.create({
              data: {
                userId: currentUser.id,
                type: "credentials",
                provider: "harvia",
                providerAccountId: currentUser.id,
                // Save tokens directly here for the worker to pick up
                id_token: harviaTokens.idToken,
                access_token: harviaTokens.accessToken,
                refresh_token: harviaTokens.refreshToken,
                expires_at: harviaTokens.expiresIn,
              },
            });
          }

          return {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            image: currentUser.image,
            harviaIdToken: harviaTokens.idToken,
            harviaAccessToken: harviaTokens.accessToken,
            harviaRefreshToken: harviaTokens.refreshToken,
            harviaExpiresIn: harviaTokens.expiresIn,
          };
        } catch (error) {
          console.error("Harvia authentication error:", error);
          return null;
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Initial sign in
      if (account && user) {
        const harviaUser = user as any;
        token.harviaIdToken = harviaUser.harviaIdToken;
        token.harviaAccessToken = harviaUser.harviaAccessToken;
        token.harviaRefreshToken = harviaUser.harviaRefreshToken;
        token.harviaExpiresIn = harviaUser.harviaExpiresIn;
        token.harviaTokenExpiresAt =
          Date.now() + (harviaUser.harviaExpiresIn as number) * 1000;

        // Manually save Harvia tokens to the Account model for worker access

        // Manually save Harvia tokens to the Account model for worker access
        if (account.provider === "harvia") {
          await db.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              id_token: harviaUser.harviaIdToken,
              access_token: harviaUser.harviaAccessToken,
              refresh_token: harviaUser.harviaRefreshToken,
              expires_at: harviaUser.harviaExpiresIn,
            },
          });
        }
      }

      // Return previous token if the Harvia ID token has not expired
      if (
        token.harviaTokenExpiresAt &&
        Date.now() < (token.harviaTokenExpiresAt as number)
      ) {
        return token;
      }

      // Harvia ID token has expired, try to refresh it
      if (token.harviaRefreshToken && token.email) {
        try {
          const newTokens = await refreshHarviaIdToken(
            token.harviaRefreshToken as string,
            token.email as string,
          );

          token.harviaIdToken = newTokens.idToken;
          token.harviaAccessToken = newTokens.accessToken;
          token.harviaExpiresIn = newTokens.expiresIn;
          token.harviaTokenExpiresAt = Date.now() + newTokens.expiresIn * 1000;
          return token;
        } catch (error) {
          console.error("Error refreshing Harvia token:", error);
          // Fallback to old token if refresh fails
          return { ...token, error: "RefreshAccessTokenError" as const };
        }
      }

      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub as string, // Ensure id is always a string
        harviaIdToken: token.harviaIdToken,
        harviaAccessToken: token.harviaAccessToken,
        harviaRefreshToken: token.harviaRefreshToken,
        harviaExpiresIn: token.harviaExpiresIn,
      },
    }),
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
