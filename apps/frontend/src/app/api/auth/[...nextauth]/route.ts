/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials'
import NextAuth from 'next-auth/next'
import { api } from '@/utils/api'

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          })

          const { user, access_token } = response.data

          if (user && access_token) {
            return {
              id: user.id.toString(), // Garantir que seja string
              email: user.email,
              name: user.name,
              accessToken: access_token,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.accessToken = (user as { accessToken: string }).accessToken
        token.id = user.id // Adicionar ID ao token
      }
      return token
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      session.accessToken = token.accessToken
      session.user.id = token.id // Adicionar ID à sessão
      return session
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
