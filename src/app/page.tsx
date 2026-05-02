import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Update these with real image URLs from laurelandlore.com ───────────────
const IMAGES = {
  propertyHero:   'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/c82788f2-21c5-482e-91ae-4c1a4267ff59/20241026_083649%7E2.jpg?format=2500w', // Main deck / property wide shot
  outdoorShower:  'https://a0.muscache.com/im/pictures/hosting/Hosting-1602145313140364507/original/ab43fe51-ba2a-44e8-b214-f86e288e85c2.png?im_w=1200', // Outdoor shower
  deck:           'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/d6a3add4-6041-4731-ad96-76aaf6e87b61/WhatsApp+Image+2025-11-23+at+3.32.46+PM.jpeg?format=1500w', // Deck
  movieNight:     'https://a0.muscache.com/im/pictures/hosting/Hosting-775430494188891274/original/e927b3f7-5a56-4502-860b-48c62c139429.png?im_w=480&im_q=medq', // Movie night setup
  wellness:       'https://a0.muscache.com/im/pictures/hosting/Hosting-1602145313140364507/original/e5e36dce-a806-4a55-af47-4176f609851f.png?im_w=720', // Wellness space
  ogun:           'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/724bab11-6cb1-4ac1-97a7-4a7413bd4052/WhatsApp+Image+2026-01-22+at+7.37.19+AM.jpeg?format=2500w', // Ogun's photo
  evie:           'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/07ed0151-1334-403c-abfe-5b40be6d44b5/20240704_110537.jpg?format=2500w', // Evie's photo
  together:       'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/87953ab6-87f5-479b-b95c-735a41c92e8b/Blue+Bird.png?format=2500w', // Ogun and Evie together
}
// ────────────────────────────────────────────────────────────────────────────

function ImageSlot({ src, alt, className, overlay, objectFit = 'cover' }: { src: string; alt: string; className?: string; overlay?: boolean; objectFit?: 'cover' | 'contain' }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <div className={cn('relative overflow-hidden', className)}>
        <img src={src} alt={alt} className={cn('w-full h-full', objectFit === 'contain' ? 'object-contain' : 'object-cover')} />
        {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />}
      </div>
    )
  }
  return (
    <div className={cn('bg-gradient-to-br from-primary/15 via-secondary to-accent/20 flex items-end p-6', className)}>
      <p className="text-xs text-muted-foreground italic">{alt}</p>
    </div>
  )
}

const REVIEWS = [
  {
    quote: "We absolutely loved the outdoor shower — we ended up using it every single morning. It made the whole stay feel like a retreat, not a rental. We've already booked our return trip.",
    author: 'Jessica & Mark',
    detail: 'Couples stay · 5★',
  },
  {
    quote: "I loved that everything was already thought of before we arrived. The little touches made us feel genuinely seen — not like guests, like people they actually cared about.",
    author: 'Renata S.',
    detail: 'Solo traveler · 5★',
  },
  {
    quote: "The movie nights on the deck were something we still talk about months later. We loved every second of this place. It's rare to leave somewhere and immediately want to come back.",
    author: 'David & Claire',
    detail: 'Anniversary stay · 5★',
  },
  {
    quote: "We love this place so much — this was our third visit. The wellness space, the morning light, the way it smells when you walk in. It's home, but better. Every single time.",
    author: 'Thomas F.',
    detail: 'Repeat guest · 5★',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ─── Nav ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <span className="text-xl font-serif font-semibold tracking-tight text-foreground">StayStory</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>Get started free</Link>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20 max-w-3xl mx-auto">
        <a
          href="https://www.airbnb.com.mt/rooms/775430494188891274"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-accent px-3 py-1.5 rounded-full mb-8 hover:bg-accent/80 transition-colors"
        >
          4.99★ · 134 reviews · See the property that built this ↗
        </a>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-foreground mb-6">
          Your guests don't just want a place to stay.<br />
          <span className="text-primary">They want to feel something.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          StayStory was built by two people who've spent their lives in hospitality — and who believe that every stay should leave a mark. Not on a wall. On a heart.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-8')}>Start free — no card needed</Link>
          <Link href="#our-story" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>Meet the founders</Link>
        </div>
      </section>

      {/* ─── Property hero image ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-6 pb-16">
        <ImageSlot
          src={IMAGES.propertyHero}
          alt="Laurel & Lore — the property where it all started"
          className="rounded-3xl h-80 sm:h-[500px] w-full bg-muted"
          objectFit="contain"
        />
      </section>

      {/* ─── Founders' story ─────────────────────────────────────────── */}
      <section id="our-story" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 text-center">The people behind the method</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground text-center mb-16 max-w-2xl mx-auto">
            Our success is not a coincidence. It never was.
          </h2>

          {/* Ogun */}
          <div className="grid sm:grid-cols-2 gap-10 items-center mb-20">
            <ImageSlot
              src={IMAGES.ogun}
              alt="Ogun Cananoglu — founder"
              className="rounded-2xl h-80 sm:h-96 order-2 sm:order-1"
            />
            <div className="order-1 sm:order-2 flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Co-founder</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">Ogun Cananoglu</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Hospitality wasn't a career choice for Ogun. It was a calling. His entire education and professional life has been spent in hospitality and catering — learning the craft from the inside out, from banquet kitchens to executive roles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                He's spent decades observing what separates a forgettable stay from one a guest recounts for years. The answer is never the thread count. It's always the intention — the thing nobody asked for, but everyone feels.
              </p>
              <p className="text-foreground font-medium italic text-sm border-l-2 border-primary pl-4">
                "I've worked in rooms where the highest compliment a guest ever gave us wasn't about the food or the decor. It was 'you made me feel like the only person here.' That's what we're chasing."
              </p>
            </div>
          </div>

          {/* Evie */}
          <div className="grid sm:grid-cols-2 gap-10 items-center mb-20">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Co-founder</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">Ivelisse "Evie" Cananoglu</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Before sustainability was a hashtag, Evie was already living it. In the early 2000s — when nobody was talking about green cleaning practices — she was building a business around them, serving clients who understood that how you clean a space says something about how you value it.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Evie has always been ahead of the conversation. She doesn't follow trends in hospitality. She creates the experience, then watches the trends catch up. Her eye for detail, her sense of environment, and her belief that every space should feel intentionally cared for — that DNA is in every feature StayStory builds.
              </p>
              <p className="text-foreground font-medium italic text-sm border-l-2 border-primary pl-4">
                "The way a space feels when you walk in — the smell, the light, the temperature — that's not an accident. That's a decision. We just help hosts make better ones."
              </p>
            </div>
            <ImageSlot
              src={IMAGES.evie}
              alt="Ivelisse 'Evie' Cananoglu — co-founder"
              className="rounded-2xl h-80 sm:h-96"
            />
          </div>

          {/* Together */}
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <ImageSlot
              src={IMAGES.together}
              alt="Ogun and Evie Cananoglu — together at the property"
              className="rounded-2xl h-80 sm:h-96 order-2 sm:order-1"
            />
            <div className="order-1 sm:order-2 flex flex-col gap-5">
              <h3 className="text-2xl font-serif font-semibold text-foreground">Together, they built something rare.</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ogun and Evie are a married couple who brought their worlds together — his hospitality craft, her legacy of intentional care — and applied it to their Airbnb property. The result: <strong className="text-foreground">4.99★ across 134 reviews.</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Guests use one word more than any other when they describe their stay: <strong className="text-foreground italic">love.</strong> We don't think that's a coincidence. We think it's a system. And we built StayStory so every host can run it.
              </p>
              <a
                href="https://www.airbnb.com.mt/rooms/775430494188891274"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline w-fit"
              >
                See the property on Airbnb ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Property photos ─────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Laurel & Lore</p>
          <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">Where the system was born.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Every principle in StayStory was tested here first — every arrival ritual, every sensory detail, every gesture. This is the property. This is the proof.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ImageSlot src={IMAGES.deck} alt="The deck at golden hour" className="rounded-2xl h-56 sm:h-72 col-span-2 sm:col-span-2" />
          <ImageSlot src={IMAGES.outdoorShower} alt="The outdoor shower" className="rounded-2xl h-56 sm:h-72" />
          <ImageSlot src={IMAGES.wellness} alt="The wellness space" className="rounded-2xl h-48 sm:h-64" />
          <ImageSlot src={IMAGES.movieNight} alt="Movie night on the deck" className="rounded-2xl h-48 sm:h-64 col-span-1 sm:col-span-2" />
        </div>

        <div className="text-center mt-8">
          <a
            href="https://laurelandlore.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            Visit laurelandlore.com to see the full property ↗
          </a>
        </div>
      </section>

      {/* ─── Reviews ─────────────────────────────────────────────────── */}
      <section className="bg-card border-y border-border py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">What guests say</p>
              <h2 className="text-3xl font-serif font-semibold text-foreground">The word they use most is <em>love.</em></h2>
            </div>
            <a
              href="https://www.airbnb.com.mt/rooms/775430494188891274"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline shrink-0 pb-1"
            >
              4.99★ · 134 reviews on Airbnb ↗
            </a>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {REVIEWS.map((r) => (
              <div key={r.author} className="bg-background rounded-2xl p-6 flex flex-col gap-4 border border-border">
                <p className="text-sm text-foreground leading-relaxed italic flex-1">"{r.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Share your actual Airbnb review text with us to replace these examples.
          </p>
        </div>
      </section>

      {/* ─── Transformation ──────────────────────────────────────────── */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground uppercase tracking-widest mb-10">The journey every host can take</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { step: '01', label: 'Basic Stay', desc: 'Clean, functional, forgettable' },
              { step: '02', label: 'Thoughtful Stay', desc: 'Intentional details guests notice' },
              { step: '03', label: 'Experiential Stay', desc: 'Curated moments that delight' },
              { step: '04', label: 'Unforgettable Stay', desc: 'Stories guests tell forever' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-2 p-4">
                <span className="text-xs text-muted-foreground font-mono">{item.step}</span>
                <span className="font-serif font-semibold text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tools system ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-widest mb-4">Four tools, one system</p>
        <h2 className="text-3xl font-serif font-semibold text-center mb-4 text-foreground">A philosophy turned into a system.</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto text-sm leading-relaxed">
          Built on the teachings of the world's most respected hospitality leaders, experience designers, and brand storytelling experts — the minds that shaped how Ogun and Evie think about hosting.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              n: '1', title: 'Start with the basics', sub: 'Foundation Audit',
              desc: 'Fix what guests actually feel — arrival, lighting, temperature, sound, smell. The invisible things that make or break a stay before anything else.',
              bg: 'bg-secondary', teacher: 'Experience Design',
            },
            {
              n: '2', title: 'Create the moment', sub: 'Hospitality Generator',
              desc: 'Paste a guest\'s message and it auto-fills the form. Then get tiered gesture ideas, setup plan, shopping list, and three message templates — specific to that person.',
              bg: 'bg-accent', teacher: 'Unreasonable Hospitality',
            },
            {
              n: '3', title: 'Map every touchpoint', sub: 'Guest Journey Map',
              desc: 'From the booking confirmation to what they find in their car weeks later — map all 14 moments of a stay and get Low-Hanging, Achievable, and Audacious ideas for each one.',
              bg: 'bg-primary/10', teacher: 'Guest Journey Design',
            },
            {
              n: '4', title: 'Tell the story', sub: 'Guest Story Builder',
              desc: 'Turn what you did into a narrative — for your brand, your listing, and the memory the guest carries home. Hospitality without a story is just service.',
              bg: 'bg-secondary', teacher: 'Brand Storytelling',
            },
          ].map((item) => (
            <div key={item.n} className={`${item.bg} rounded-2xl p-8 flex flex-col gap-4`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{item.sub}</p>
                  <h3 className="font-serif font-semibold text-lg text-foreground">{item.title}</h3>
                </div>
                <span className="text-3xl font-serif font-bold text-muted-foreground/20 shrink-0">{item.n}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              <p className="text-xs text-muted-foreground">Method: <span className="font-medium text-foreground">{item.teacher}</span></p>
            </div>
          ))}
        </div>

        {/* Bonus features */}
        <div className="mt-8 bg-card border border-border rounded-2xl p-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Included with every account — free or paid</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Airbnb & VRBO Calendar Sync',
                desc: 'Connect your iCal feed and see all upcoming bookings in one place. One click from any booking to the Hospitality Generator.',
              },
              {
                title: 'Guest Message Auto-fill',
                desc: 'Paste any guest message and Claude extracts their name, occasion, emotional state, interests, and notes — and fills the form automatically.',
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary">✦</span>{f.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Legend special offer ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-3">Legend tier · Exclusive offer</p>
                <h2 className="text-3xl font-serif font-semibold leading-tight mb-4">
                  The first 10 Signature subscribers stay with us — free.
                </h2>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Two days at our property. Breakfast on the deck. An outdoor shower at sunrise. A movie night under the stars. And dinner with Ogun and Evie.
                </p>
              </div>
              <p className="text-primary-foreground/80 leading-relaxed">
                This isn't a marketing gimmick. It's an invitation to experience the entire hospitality system from the inside — in the place where it was built. Ask us anything. See everything. Leave with a blueprint for your own property.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <p className="flex items-center gap-2 text-primary-foreground/90">
                  <span>✓</span> 2 nights at Laurel & Lore — complimentary
                </p>
                <p className="flex items-center gap-2 text-primary-foreground/90">
                  <span>✓</span> Private dinner with Ogun & Evie
                </p>
                <p className="flex items-center gap-2 text-primary-foreground/90">
                  <span>✓</span> Hands-on walkthrough of the full system
                </p>
                <p className="flex items-center gap-2 text-primary-foreground/90">
                  <span>✓</span> Valid anytime within 1 year of purchase
                </p>
                <p className="flex items-center gap-2 text-primary-foreground/60 text-xs mt-1">
                  Limited to the first 10 Signature subscribers. First come, first served.
                </p>
              </div>
              <Link href="/signup" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'w-fit')}>
                Claim your Legend spot →
              </Link>
            </div>
            <ImageSlot
              src={IMAGES.together}
              alt="Ogun and Evie Cananoglu at Laurel & Lore"
              className="rounded-2xl h-96 hidden sm:block"
            />
          </div>
        </div>
      </section>

      {/* ─── Philosophy ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-10">Built on three principles</p>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { role: 'The Foundation', idea: 'Stay in your own rental. Design for feeling, not function. Fix the invisible things first — they\'re the ones guests never mention but always remember.' },
              { role: 'The Wow', idea: 'Service does the job. Hospitality makes people feel something. Be unreasonable in your care. Spend a little foolishly on the moments that matter most.' },
              { role: 'The Story', idea: 'Every guest experience is a story. The host is the guide. The guest is the hero who carries it home — and tells it to everyone they know.' },
            ].map((p) => (
              <div key={p.role} className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{p.idea}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-center mb-4 text-foreground">Simple pricing.</h2>
          <p className="text-center text-muted-foreground mb-14">Start free. Upgrade when you're ready. Cancel anytime.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Free', price: '$0',
                features: ['Foundation Audit', '3 generator uses/mo', 'Calendar sync', 'Message auto-fill', '1 preview of each tool'],
                highlight: false,
              },
              {
                name: 'Host', price: '$12/mo',
                features: ['Unlimited generator', 'Journey Map', 'Calendar sync', 'Message auto-fill', 'Shopping lists & templates'],
                highlight: false,
              },
              {
                name: 'Signature', price: '$29/mo',
                features: ['Everything in Host', 'Guest Story Builder', 'Listing copy & captions', 'Calendar sync', 'Message auto-fill'],
                highlight: true,
              },
              {
                name: 'Legend', price: '$79/mo',
                features: ['Everything in Signature', 'Guest Journey Playbook', 'Property audit call', 'Done-with-you design', '★ 2-night stay offer (first 10)'],
                highlight: false,
                badge: 'First 10 get a free stay',
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 flex flex-col gap-4 border relative ${tier.highlight ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
              >
                {'badge' in tier && tier.badge && (
                  <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                    {tier.badge}
                  </div>
                )}
                <div>
                  <p className="font-serif font-semibold text-foreground">{tier.name}</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{tier.price}</p>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={cn(buttonVariants({ variant: tier.highlight ? 'default' : 'outline', size: 'sm' }))}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">
          Your guests want to feel seen.
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
          This is not a tool. It's a way to think. Ogun and Evie built it because they believe every host — not just the ones with industry experience — deserves a system that makes them extraordinary.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-8')}>Start free today</Link>
          <a
            href="https://laurelandlore.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            See the property ↗
          </a>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} StayStory · Built by Ogun & Evie Cananoglu ·{' '}
        <a href="https://laurelandlore.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
          laurelandlore.com
        </a>
      </footer>

    </div>
  )
}
