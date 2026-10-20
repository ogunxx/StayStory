import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection, LegalList } from '@/components/marketing/legal-page'
import { CONTACT_EMAIL, REFUND_WINDOW_DAYS, SITE } from '@/lib/legal'

const DESCRIPTION = `A full refund within ${REFUND_WINDOW_DAYS} days of your first payment, no questions asked. After that, cancel any time and keep access to the end of the period you have paid for.`

export const metadata: Metadata = {
  title: { absolute: 'Refunds — StayStory' },
  description: DESCRIPTION,
  alternates: { canonical: '/refunds' },
}

/**
 * The shortest of the three on purpose. Someone reads a refund policy when
 * they are deciding whether to risk a payment, or when they already want
 * their money back — neither is a moment for paragraphs. The answer is in
 * the first line and the rest is detail.
 */
export default function RefundsPage() {
  return (
    <LegalPage
      title="Refunds"
      intro={`A full refund within ${REFUND_WINDOW_DAYS} days of your first payment, no questions asked.`}
    >
      <LegalSection title={`The first ${REFUND_WINDOW_DAYS} days`}>
        <p>
          If you subscribe and decide within <strong>{REFUND_WINDOW_DAYS} days</strong> that it is
          not for you, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will
          refund the payment in full.
        </p>
        <p>
          You do not have to give a reason. We may ask what did not work, because that is how the
          product improves, but you are under no obligation to answer and it makes no difference
          to the refund.
        </p>
      </LegalSection>

      <LegalSection title="After that">
        <p>
          Cancel any time from your account. You keep full access until the end of the period you
          have already paid for, and nothing is charged again.
        </p>
        <p>
          We do not refund part of a month or part of a year once that period has begun. Cancel
          the day after a renewal and you keep the service for the rest of that period rather
          than getting the money back.
        </p>
      </LegalSection>

      <LegalSection title="Yearly plans">
        <p>
          The {REFUND_WINDOW_DAYS}-day window works the same way on a yearly plan: a full refund
          if you ask within {REFUND_WINDOW_DAYS} days of the payment.
        </p>
        <p>
          After that the year runs to its end. If something significant goes wrong partway
          through — we withdraw a feature you subscribed for, or the service is unusable for a
          sustained period — write to us. We will deal with it properly rather than pointing at
          this page.
        </p>
      </LegalSection>

      <LegalSection title="How to ask">
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on your
          account and say you would like a refund. That is the whole process.
        </p>
        <LegalList>
          <li>We reply within two working days.</li>
          <li>The refund goes back to the card you paid with, through Stripe.</li>
          <li>Your bank usually takes five to ten days to show it.</li>
          <li>Your access ends when the refund is issued.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="What a refund does to your work">
        <p>
          Nothing is deleted when you cancel or take a refund. Your Audit, Compass, recommendations
          and Playbooks stay in your account, and you keep whatever you have already exported or
          written down.
        </p>
        <p>
          Features that need a paid plan stop working, and you can subscribe again later and pick
          up where you were. If you would rather everything were deleted, ask — see the{' '}
          <Link href="/privacy">Privacy page</Link>.
        </p>
      </LegalSection>

      <LegalSection title="The honest limits">
        <p>
          This is a genuine no-questions policy, and we would rather refund someone than keep
          money they regret spending. It is not a way to use {SITE.name} repeatedly for free. If
          an account subscribes and refunds over and over, we may decline a further refund or
          stop offering the service to that account.
        </p>
        <p>
          If you disagree with a decision here, write to us before raising a chargeback with your
          bank. A reply is faster than a dispute, and we would far rather hear from you directly.
        </p>
      </LegalSection>

      <LegalSection title="Where this sits">
        <p>
          This page is part of our <Link href="/terms">Terms</Link>. Where the law where you live
          gives you stronger rights than this policy, those rights apply and nothing here reduces
          them.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
