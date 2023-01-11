import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_CALENDAR_SCOPE,
        },
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
  },
}

export default NextAuth(authOptions)
