import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { AuthOptions } from 'next-auth'

import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'
import { PrismaAdapter } from '../../../lib/auth/prisma-adapter'

const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'

export function buildNextAuthOptions(
  req: NextApiRequest,
  res: NextApiResponse,
): AuthOptions {
  return {
    // Configure one or more authentication providers
    adapter: PrismaAdapter(req, res),

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,

        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

        authorization: {
          params: {
            scope: GOOGLE_CALENDAR_SCOPE,
          },
        },
        profile: (profile: GoogleProfile) => {
          return {
            id: profile.sub,
            name: profile.name,
            username: '',
            email: profile.email,
            avatar_url: profile.picture,
          }
        },
      }),

      // ...add more providers here
    ],

    callbacks: {
      async signIn({ account }) {
        if (
          !GOOGLE_CALENDAR_SCOPE.split(' ').every((scope) =>
            account?.scope?.includes(scope),
          )
        ) {
          return '/register/connect-calendar?error=permissions'
        }

        return true
      },
      session: async ({ session, user }) => {
        return {
          ...session,
          user,
        }
      },
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res))
}
