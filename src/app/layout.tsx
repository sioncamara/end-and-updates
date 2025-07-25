import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import avatar from '@/images/avatar.ico'
import portrait from '@/images/portrait.jpg'

import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: {
    template: '%s - Sion Wilks',
    default: 'Sion Wilks - Philosophical Software Engineer',
  },
  description:
    "I'm a front-end software engineer who spends much of my time reading and thinking about philosophy and psychology.",
  icons: {
    icon: avatar.src,
  },
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: 'Sion Wilks - Philosophical Software Engineer',
    description: "I'm a front-end software engineer who spends much of my time reading and thinking about philosophy and psychology.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Sion Wilks',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}${portrait.src}`,
        width: portrait.width,
        height: portrait.height,
        alt: 'Sion Wilks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sion Wilks - Philosophical Software Engineer',
    description: "I'm a front-end software engineer who spends much of my time reading and thinking about philosophy and psychology.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}${portrait.src}`],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
