import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getHarviaIdToken, refreshHarviaIdToken } from "@/server/api/harvia";
import { refreshPolarToken } from "@/server/api/polar";
import { db } from "@/server/db";
import { env } from "@/env";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      harviaIdToken?: string;
      harviaAccessToken?: string;
      harviaRefreshToken?: string;
      harviaExpiresIn?: number;
      polarAccessToken?: string;
      polarRefreshToken?: string;
      polarExpiresIn?: number;
      polarUserId?: number;
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
    polarAccessToken?: string;
    polarRefreshToken?: string;
    polarExpiresIn?: number;
    polarTokenExpiresAt?: number;
    polarUserId?: number;
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
    {
      id: "polar",
      name: "Polar",
      type: "oauth",
      checks: ["state"],
      authorization: {
        url: "https://flow.polar.com/oauth2/authorization",
        params: {
          scope: "accesslink.read_all",
          response_type: "code",
        },
      },
      token: {
        url: "https://polarremote.com/v2/oauth2/token",
      },
      client: {
        token_endpoint_auth_method: "client_secret_basic",
      },
      issuer: "polar",
      userinfo: {
        request: (x: { tokens: any }, p: any) => {
          console.log(x, p);
          return {
            "polar-user-id": (x.tokens as any).x_user_id,
          };
        },
      },
      clientId: env.POLAR_CLIENT_ID,
      clientSecret: env.POLAR_CLIENT_SECRET,
      profile(profile, t) {
        console.log(t);
        console.log(profile);
        return {
          id: String(profile["polar-user-id"]),
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "polar") {
        try {
          const { cookies } = await import("next/headers");
          const linkUserId = (await cookies()).get("link_user_id")?.value;

          if (linkUserId) {
            const existingAccount = await db.account.findFirst({
              where: {
                provider: "polar",
                providerAccountId: account.providerAccountId,
              },
            });

            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: linkUserId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });

              const { registerUser } = await import("@/server/api/polar");
              await registerUser(account.access_token!, linkUserId);
            }
            return true;
          }
        } catch (e) {
          console.error("Manual linking check failed", e);
        }

        // Only allow Polar sign-in if it's linked to an existing user (who has a real name)
        // If it's a new user creation attempt, the name comes from the profile callback ("Polar User")
        return user.name !== "Polar User";
      }
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
        if (account.provider === "polar") {
          token.polarAccessToken = account.access_token;
          token.polarRefreshToken = account.refresh_token;
          token.polarExpiresIn = account.expires_in;
          token.polarTokenExpiresAt =
            Date.now() + (account.expires_in as number) * 1000;
          token.polarUserId = (account as any).x_user_id;
        }
      }

      // Harvia Token Refresh Logic
      if (
        token.harviaTokenExpiresAt &&
        Date.now() > (token.harviaTokenExpiresAt as number) &&
        token.harviaRefreshToken &&
        token.email
      ) {
        try {
          const newTokens = await refreshHarviaIdToken(
            token.harviaRefreshToken as string,
            token.email,
          );

          token.harviaIdToken = newTokens.idToken;
          token.harviaAccessToken = newTokens.accessToken;
          token.harviaExpiresIn = newTokens.expiresIn;
          token.harviaTokenExpiresAt = Date.now() + newTokens.expiresIn * 1000;
        } catch (error) {
          console.error("Error refreshing Harvia token:", error);
        }
      }

      // Polar Token Refresh Logic
      if (
        token.polarTokenExpiresAt &&
        Date.now() > (token.polarTokenExpiresAt as number) &&
        token.polarRefreshToken
      ) {
        try {
          const newTokens = await refreshPolarToken(
            token.polarRefreshToken as string,
          );

          token.polarAccessToken = newTokens.access_token;
          token.polarExpiresIn = newTokens.expires_in;
          token.polarTokenExpiresAt = Date.now() + newTokens.expires_in * 1000;
        } catch (error) {
          console.error("Error refreshing Polar token:", error);
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
          polarAccessToken: token.polarAccessToken,
          polarRefreshToken: token.polarRefreshToken,
          polarExpiresIn: token.polarExpiresIn,
          polarUserId: token.polarUserId,
        },
      };
    },
  },
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === "polar" && account.access_token) {
        const { registerUser } = await import("@/server/api/polar");
        try {
          await registerUser(account.access_token, user.id!);
          console.log("Registered user with Polar API");
        } catch (e) {
          console.error("Failed to register Polar user", e);
        }
      }
    },
  },
  debug: true,
} satisfies NextAuthConfig;
