import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalList } from '@/components/marketing/legal-page'
import { CONTACT_EMAIL, ENTITY, PROCESSORS, SITE } from '@/lib/legal'

const DESCRIPTION =
  'What StayStory collects, why, who else sees it, and how to get it back or have it deleted.'

export const metadata: Metadata = {
  title: { absolute: 'Privacy — StayStory' },
  description: DESCRIPTION,
  alternates: { canonical: '/privacy' },
}

/**
 * Written from what the application actually does, not from a template:
 * the real tables, the real processors, and the two things a generic policy
 * would miss — that host content is sent to an AI model, and that hosts can
 * type details about their own guests into it.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro="Plainly: what we collect, why we have it, who else sees it, and how to get it back or have it deleted."
    >
      <LegalSection title="The short version">
        <p>
          We collect what StayStory needs to work and nothing we have no use for. We do not sell
          your information, and we do not share it for advertising. The AI that drafts your
          recommendations is run by Anthropic, so what you write is sent there to produce a
          result. You can ask for a copy of your data, or for it to be deleted, by writing to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>
          <strong>Your account.</strong> Your email address, your name if you give one, and a
          password that is hashed before it is stored — we never see it. If you subscribe, the
          customer reference Stripe gives us.
        </p>
        <p>
          <strong>What you create in StayStory.</strong> Your properties, your Experience Audit
          answers, your Experience Compass, recommendations, Blueprints, Guest Journey Playbooks,
          stories and anything else you write or generate. This is the substance of the product
          and it is kept so you can come back to it.
        </p>
        <p>
          <strong>What you tell us about your guests.</strong> Some tools let you describe a
          particular guest or occasion so StayStory can suggest something specific. Whatever you
          type there is stored with your account and sent to the AI like the rest. See{' '}
          <a href="#guests">your guests&rsquo; information</a> below — this one carries a
          responsibility that is yours rather than ours.
        </p>
        <p>
          <strong>If you answer the research questions on our homepage.</strong> Your name if you
          give one, your email address, and your answers. You do not need an account for this, and
          those answers are kept apart from the product.
        </p>
        <p>
          <strong>Technical records.</strong> Our host keeps short-lived request logs. We record
          the IP address a sign-up came from, to stop one source creating accounts in bulk.
        </p>
        <p>
          We do not use advertising trackers, and we do not build a profile of you for anyone
          else&rsquo;s purposes.
        </p>
      </LegalSection>

      <LegalSection title="Why we have it">
        <LegalList>
          <li>To give you an account and keep you signed in.</li>
          <li>To produce the recommendations, Playbooks and other work you ask StayStory for.</li>
          <li>To keep your work so it is there when you return.</li>
          <li>To take payment and manage a subscription, if you have one.</li>
          <li>To send the emails the service depends on — confirming your address, resetting a password, receipts.</li>
          <li>To understand what hosts need, so the product gets better.</li>
          <li>To keep the service secure and working.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="The AI, specifically">
        <p>
          StayStory uses a model operated by <strong>Anthropic</strong>. When you ask it to
          generate something, the relevant parts of what you have written — your Audit answers,
          your Compass, your notes — are sent to Anthropic so it can produce a result and return
          it to you.
        </p>
        <p>
          We tell you this plainly because a privacy policy that says &ldquo;we use AI&rdquo;
          without saying your words leave the building is not telling you the thing that matters.
          If you would rather something never reached a model, do not type it into a tool whose
          purpose is to generate from it.
        </p>
      </LegalSection>

      <LegalSection title="Who else sees it">
        <p>
          Only the companies that make the service run, and only for that purpose. Each is bound
          by its own agreement with us.
        </p>
        <LegalList>
          {PROCESSORS.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong> — {p.purpose}. {p.detail}
            </li>
          ))}
        </LegalList>
        <p>
          We may also disclose information if the law requires it, or to protect someone&rsquo;s
          safety or our rights. If {ENTITY.shortForm} is ever sold or merged, your information
          could transfer with the business — you would be told before anything changed.
        </p>
        <p>
          These companies are based in the United States and your information is processed there.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Your account and your work stay for as long as you have an account. Ask us to delete
          them and we will, other than anything we are required to keep — payment records, for
          instance, which tax rules oblige us to hold for a period.
        </p>
        <p>
          Research answers are kept while they are still useful for understanding what hosts need.
          Sign-up IP records are kept only as long as they serve their anti-abuse purpose.
        </p>
      </LegalSection>

      <LegalSection title="What you can ask for">
        <p>
          Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will:
        </p>
        <LegalList>
          <li>tell you what we hold about you;</li>
          <li>give you a copy;</li>
          <li>correct anything wrong;</li>
          <li>delete your account and your work;</li>
          <li>stop contacting you about research.</li>
        </LegalList>
        <p>
          Depending on where you live you may have further rights — under the GDPR in the UK and
          EU, or the CCPA in California, among others. We will honour those requests regardless of
          where you are, because a right worth having should not depend on an address.
        </p>
        <p>
          We do not sell personal information, and we have not in the past twelve months.
        </p>
      </LegalSection>

      <LegalSection title="Your guests' information">
        <p id="guests">
          If you write a guest&rsquo;s name or details into StayStory, you are putting another
          person&rsquo;s information into our hands. We treat it exactly as we treat yours.
        </p>
        <p>
          But the responsibility for sharing it is yours, not ours. Only enter what you genuinely
          need for the hospitality you are designing, and keep it to what your guest would expect
          you to be doing with it. A first name and the fact that it is an anniversary is a
          different thing from a medical note.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use cookies to keep you signed in and to remember which property you are working on.
          Blocking the sign-in cookie will stop you being able to log in.
        </p>
        <p>
          We also use Microsoft Clarity to understand how the site is used, and it sets two cookies
          of its own to tell one visit apart from the next. There are no advertising cookies, and we
          do not sell or share anything with advertisers.
        </p>
      </LegalSection>

      <LegalSection title="Session recordings">
        <p>
          Microsoft Clarity plays visits back as recordings, so we can see where a page confuses
          people rather than guessing. We use it to find dead ends, not to watch individuals.
        </p>
        <p>
          <strong>Everything you type is hidden from those recordings.</strong> Every page you see
          once signed in is masked — your Audit and Compass answers, your stories and Playbooks,
          your property names, your email — along with every sign-in, sign-up and password screen,
          and the Help Shape StayStory form. The words are replaced before they leave your browser,
          so they never reach Microsoft. Passwords are never captured.
        </p>
        <p>
          We do not send your name, email address, account identifier, property names or any billing
          detail to Microsoft. What we get back is behaviour — which pages are visited, where people
          click and scroll, and where they give up.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          StayStory is for people running a hospitality business and is not intended for anyone
          under 18. We do not knowingly collect information from children. If you believe a child
          has given us information, write to us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection title="Security, honestly stated">
        <p>
          Passwords are hashed. Card details never reach us. Access to the database is restricted,
          and the tables holding your work are protected so one account cannot read another&rsquo;s.
        </p>
        <p>
          No service can promise to be unbreakable, and we will not pretend otherwise. If a breach
          ever affected your information, we would tell you.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes in a way that matters, we will update the date at the top and, for
          anything significant, email account holders. Continuing to use {SITE.name} after a change
          means you accept it.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
