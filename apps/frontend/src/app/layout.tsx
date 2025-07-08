import './globals.css'

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ReactQueryProvider from '@/providers/react-query'
import { AuthProvider } from '@/providers/auth-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A simple todo application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
