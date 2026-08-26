import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { profiles, accounts, verificationTokens } from '@/lib/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: profiles,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // DB에서 최신 role 조회
        const profile = await db.query.profiles.findFirst({
          where: (p, { eq }) => eq(p.id, user.id!),
          columns: { role: true, nickname: true, phone: true },
        })
        token.role = profile?.role ?? 'user'
        token.onboardingComplete = !!(profile?.nickname && profile?.phone)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.onboardingComplete = token.onboardingComplete as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
