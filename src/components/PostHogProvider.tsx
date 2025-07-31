'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check for user consent
    if (typeof window !== 'undefined') {
      const storedConsent = localStorage.getItem('cookie_consent')
      // Initialize PostHog if consent is 'yes' or not set (for backward compatibility)
      const consent = storedConsent === 'no' ? false : true
      setHasConsent(consent)

      // Initialize PostHog with the appropriate persistence mode
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'always',
        capture_pageview: false,
        persistence: consent ? 'localStorage+cookie' : 'memory',
        autocapture: consent,
      })

      // Listen for changes in consent
      const handleConsentChange = () => {
        const newConsent = localStorage.getItem('cookie_consent')
        const newConsentValue = newConsent === 'no' ? false : true
        setHasConsent(newConsentValue)

        // Update PostHog configuration when consent changes
        posthog.set_config({
          persistence: newConsentValue ? 'localStorage+cookie' : 'memory',
          autocapture: newConsentValue,
        })
      }

      window.addEventListener('storage', handleConsentChange)
      return () => window.removeEventListener('storage', handleConsentChange)
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView hasConsent={hasConsent} />
      {children}
    </PHProvider>
  )
}

function PostHogPageView({ hasConsent }: { hasConsent: boolean | null }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // Track pageviews only if user has given consent
  useEffect(() => {
    if (pathname && posthog && hasConsent) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + '?' + searchParams.toString()
      }

      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthog, hasConsent])

  return null
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView({
  hasConsent,
}: {
  hasConsent: boolean | null
}) {
  return (
    <Suspense fallback={null}>
      <PostHogPageView hasConsent={hasConsent} />
    </Suspense>
  )
}
