import Script from 'next/script'
import { CLARITY_PROJECT_ID, shouldLoadClarity } from '@/lib/analytics'

/**
 * Loads Microsoft Clarity, once, for the whole site.
 *
 * Rendered in the root layout, which is the only place it appears — so every
 * route gets it (marketing, auth, the focused journey, the dashboard and its
 * tools) without a single page carrying its own copy. A second instance would
 * double-count every session, so there is one component and one constant.
 *
 * `afterInteractive` runs it after hydration: it cannot delay First
 * Contentful Paint, sit in front of the auth gate, or hold up a form or the
 * Audit. The inline loader is Microsoft's own — no npm dependency for what is
 * a dozen lines of queue-and-inject — and it creates the `window.clarity`
 * command queue, so if route handling turns out to be needed later it can be
 * called without re-plumbing anything.
 *
 * Returns null outside production. See shouldLoadClarity for why that is read
 * from VERCEL_ENV and not NODE_ENV.
 */
export function Clarity() {
  if (!shouldLoadClarity(process.env.VERCEL_ENV)) return null

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
    </Script>
  )
}
