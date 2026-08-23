import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/marketing/hero'
import { HomePricing } from './home-pricing'

const AIRBNB_URL = 'https://www.airbnb.com.mt/rooms/775430494188891274'

async function getAirbnbStats() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['airbnb_rating', 'airbnb_review_count'])
    const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
    return {
      rating: map['airbnb_rating'] ?? '4.99',
      reviews: map['airbnb_review_count'] ?? '136',
    }
  } catch {
    return { rating: '4.99', reviews: '136' }
  }
}

const IMAGES = {
  propertyHero: 'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/c82788f2-21c5-482e-91ae-4c1a4267ff59/20241026_083649%7E2.jpg?format=2500w',
  outdoorShower: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1602145313140364507/original/ab43fe51-ba2a-44e8-b214-f86e288e85c2.png?im_w=1200',
  deck: 'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/d6a3add4-6041-4731-ad96-76aaf6e87b61/WhatsApp+Image+2025-11-23+at+3.32.46+PM.jpeg?format=1500w',
  movieNight: 'https://a0.muscache.com/im/pictures/hosting/Hosting-775430494188891274/original/e927b3f7-5a56-4502-860b-48c62c139429.png?im_w=480&im_q=medq',
  wellness: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1602145313140364507/original/e5e36dce-a806-4a55-af47-4176f609851f.png?im_w=720',
  ogun: '/images/ogun.jpg',
  evie: 'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/07ed0151-1334-403c-abfe-5b40be6d44b5/20240704_110537.jpg?format=2500w',
  together: 'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/87953ab6-87f5-479b-b95c-735a41c92e8b/Blue+Bird.png?format=2500w',
}

function Img({ src, alt, className, objectFit = 'cover' }: {
  src: string
  alt: string
  className?: string
  objectFit?: 'cover' | 'contain'
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full', objectFit === 'contain' ? 'object-contain' : 'object-cover')}
      />
    </div>
  )
}

const CURATED_REVIEWS = [
  {
    quote: 'Fantastic place! The details put into the place including the welcome sign with my name, whole bean coffee with Keurig grinder, and sparkling water with chilled glasses upon arrival were amazing! We are already planning on coming back.',
    author: 'Heather',
    detail: 'Douglasville, Georgia · April 2025 · 5★',
  },
  {
    quote: 'The little details made it super homey. The fresh ground coffee maker was a hit in the AMs!! The cold Topo Chico in the fridge after the drive was so good. Might seem like something small — but the dish soap and complementary body wash was a lovely touch.',
    author: 'Carolina',
    detail: 'Hollywood, Florida · June 2025 · 5★',
  },
  {
    quote: 'We had such a lovely time here, I would really recommend! This host had thought of everything to make our stay really comfortable. We especially liked the fire pit and campfire story book!',
    author: 'Jo',
    detail: '5 years on Airbnb · July 2024 · 5★',
  },
  {
    quote: 'We were there when Hurricane Helene was passing by. The hosts were extremely proactive being sure we were okay and cared for. Throughout our stay they were so attentive that it made us feel very nurtured and safe. They had thought of every thing!',
    author: 'Katie',
    detail: 'Asheville, North Carolina · October 2024 · 5★',
  },
  {
    quote: 'Their place truly felt like home — everything we needed and then some. It felt like we were in the middle of secluded wilderness and yet only 30 minutes from downtown Savannah. Perfect in every way and we will be back again.',
    author: 'Sonia',
    detail: 'Miami, Florida · March 2025 · 5★',
  },
  {
    quote: "My family had such an incredible stay! The place was very clean and had such thoughtful touches throughout the space. Our toddler loved the books, games, and campfire! We can't say enough good things about this place.",
    author: 'Victoria',
    detail: '10 years on Airbnb · April 2025 · 5★',
  },
]

export default async function LandingPage() {
  const { rating, reviews } = await getAirbnbStats()

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ─── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden>
              <path d="M10 1.5l1.9 5.1 5.1 1.9-5.1 1.9L10 15.5l-1.9-5.1L3 8.5l5.1-1.9z" />
            </svg>
          </span>
          <span className="text-xl font-serif font-semibold tracking-tight text-foreground">StayStory</span>
        </Link>
        <div className="hidden sm:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#origin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors sm:hidden">
            Login
          </Link>
          <Link href="/signup" className={cn(buttonVariants(), 'h-9 rounded-lg px-4')}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ─── Property hero image ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-6 pb-24">
        <Img
          src={IMAGES.propertyHero}
          alt="Laurel & Lore — the property where the system was built"
          className="rounded-3xl h-80 sm:h-[520px] w-full bg-muted"
          objectFit="contain"
        />
      </section>

      {/* ─── The Reframe ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 text-center">The shift</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground text-center mb-16 max-w-2xl mx-auto">
            Most hosts ask the wrong question.
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-12 items-start">
            {/* Wrong question */}
            <div className="bg-background rounded-2xl p-8 border border-border flex flex-col gap-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">The question most hosts ask</p>
              <p className="text-2xl font-serif font-semibold text-foreground leading-snug">
                What does my property have?
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hosts who ask this spend money on furniture, smart locks, coffee makers, and thread counts.
                They get decent reviews. They stay at 4.3. They wonder why.
              </p>
            </div>

            {/* Right question */}
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col gap-5">
              <p className="text-xs uppercase tracking-widest text-primary">The question that changes everything</p>
              <p className="text-2xl font-serif font-semibold text-foreground leading-snug">
                What will my guest feel?
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hosts who ask this design for the person, not the place. They map every moment of the stay —
                before, during, and after. They know which ten seconds will define the entire experience.
                They consistently hit 5 stars.
              </p>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-12 max-w-2xl mx-auto leading-relaxed">
            StayStory is the system that moves you from the first question to the second —
            and keeps you there.
          </p>
        </div>
      </section>

      {/* ─── Why Experiences Matter ───────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
          The bigger picture
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-center text-foreground mb-6 max-w-2xl mx-auto">
          Why experiences matter<br />more than ever.
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
          The whole economy has been moving in one direction for decades. People stopped
          buying things and started buying how those things make them feel. Hospitality is
          living through that shift right now — and the hosts who see it early are the ones
          guests never stop talking about.
        </p>

        {/* Statistics */}
        <div className="grid sm:grid-cols-3 gap-5 mb-20">
          <div className="bg-secondary rounded-2xl p-7 flex flex-col gap-3">
            <p className="text-4xl font-serif font-semibold text-foreground">86%</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              of customers will pay more for a better experience — not a better product.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-auto">
              PwC, &ldquo;Experience Is Everything&rdquo;
            </p>
          </div>
          <div className="bg-secondary rounded-2xl p-7 flex flex-col gap-3">
            <p className="text-4xl font-serif font-semibold text-foreground">73%</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              say experience is a deciding factor in what they buy and who they stay loyal to.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-auto">
              PwC consumer research
            </p>
          </div>
          <div className="bg-secondary rounded-2xl p-7 flex flex-col gap-3">
            <p className="text-4xl font-serif font-semibold text-foreground">4th</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experiences are the fourth stage of economic value — beyond commodities, goods,
              and services.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-auto">
              Pine &amp; Gilmore, Harvard Business Review
            </p>
          </div>
        </div>

        {/* Voices */}
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-10">
          The people who saw it first
        </p>
        <div className="grid sm:grid-cols-2 gap-5 mb-20">
          {[
            {
              quote: 'Goods and services are no longer enough.',
              name: 'Pine & Gilmore',
              detail: 'Authors of The Experience Economy',
              body: 'They argued that the next competitive battleground wouldn’t be price or features — it would be experiences staged so memorably that people pay simply to feel them. A stay is exactly that kind of experience, waiting to be designed.',
            },
            {
              quote: 'Service is black and white. Hospitality is color.',
              name: 'Will Guidara',
              detail: 'Unreasonable Hospitality',
              body: 'He took a restaurant to number one in the world not by perfecting the food, but by obsessing over how guests felt. The lesson for hosts: the things that make people feel seen are rarely expensive — they’re intentional.',
            },
            {
              quote: 'Resonance beats reach.',
              name: 'Jay Acunzo',
              detail: 'On standing out',
              body: 'In a world of endless options, being a little better is invisible. What people remember is the host who made them feel something specific — the one moment that landed deeply enough to be retold.',
            },
            {
              quote: 'Build a place people travel for, not just stay in.',
              name: 'Isaac French',
              detail: 'Creator of Live Oak Lake',
              body: 'He turned a small piece of land into a micro-resort guests crossed states to experience — proof that a thoughtfully designed stay outperforms square footage, location, and amenities every time.',
            },
          ].map((v) => (
            <div key={v.name} className="bg-background rounded-2xl p-7 border border-border flex flex-col gap-4">
              <p className="text-xl font-serif text-foreground leading-snug">
                &ldquo;{v.quote}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{v.body}</p>
              <div className="border-l-2 border-primary pl-3">
                <p className="text-sm font-semibold text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Emotional storytelling */}
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <p className="text-lg sm:text-xl font-serif text-foreground leading-relaxed">
            Think about the trip you still talk about.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You probably don&apos;t remember the thread count of the sheets, or whether the Wi-Fi was fast.
            You remember the cold drink waiting after a long drive. The note with your name on it.
            The way the light came through the window in the morning. The feeling that someone you&apos;d
            never met had thought about you before you arrived.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            That feeling is the whole product. Guests will forgive a lot, and forget almost everything —
            except how a place made them feel. The booking gets you the guest. The experience gets you
            the review, the return, and the friend they send next.
          </p>
          <p className="text-foreground font-medium leading-relaxed">
            Accommodation is what they pay for. An experience is what they remember.
            That gap is where your next five-star review lives — and StayStory is the system built
            to help you close it, on purpose, every single stay.
          </p>
        </div>
      </section>

      {/* ─── The System ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
          How it works
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-center text-foreground mb-4 max-w-2xl mx-auto">
          Four parts. One system.<br />One stay they&apos;ll never forget.
        </h2>
        <p className="text-center text-muted-foreground mb-20 max-w-xl mx-auto text-sm leading-relaxed">
          StayStory walks with you through the whole journey — from understanding what your guests
          feel, to designing the moments that move them, to telling the story those moments become.
        </p>

        <div className="flex flex-col gap-2">

          {/* 1 — Experience Audit */}
          <div className="bg-secondary rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">01</span>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Experience Audit</h3>
              <p className="text-xs uppercase tracking-widest text-primary">Makes the invisible visible</p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                See your stay through your guest&apos;s eyes.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Before you can create a better experience, you have to find the moments quietly working
                against you — and the ones full of untapped meaning. The Experience Audit surfaces the
                emotional peaks, the missed opportunities, and the small gaps your guests feel but never
                mention.
              </p>
            </div>
          </div>

          {/* 2 — Experience Blueprint */}
          <div className="bg-accent rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">02</span>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Experience Blueprint</h3>
              <p className="text-xs uppercase tracking-widest text-primary">Turns a place into a journey</p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                Map the journey, from first message to final goodbye.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every stay is a sequence of moments. The Experience Blueprint helps you design and map
                the whole guest journey — beginning to end — so nothing meaningful is left to chance,
                and every moment has intention behind it.
              </p>
            </div>
          </div>

          {/* 3 — Experience Generator */}
          <div className="bg-primary/10 rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">03</span>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Experience Generator</h3>
              <p className="text-xs uppercase tracking-widest text-primary">Makes care specific</p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                Turn intention into moments guests remember.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The ideas are the hard part. The Experience Generator helps you create the meaningful
                moments, small rituals, and unexpected gestures that turn an ordinary stay into one
                guests feel — shaped around your place and the people staying in it.
              </p>
            </div>
          </div>

          {/* 4 — Story Builder */}
          <div className="bg-secondary rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">04</span>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Story Builder</h3>
              <p className="text-xs uppercase tracking-widest text-primary">Turns experience into memory</p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                Give the experience words guests can carry home.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A moment nobody can describe ends at checkout. The Story Builder helps you put the
                experience into language — so guests understand what you&apos;ve made for them,
                anticipate it before they arrive, feel it more deeply while they&apos;re there, and
                remember it long after they leave. It isn&apos;t about writing copy. It&apos;s about
                making meaning that lasts.
              </p>
            </div>
          </div>

        </div>

        <p className="text-center text-muted-foreground mt-12 max-w-xl mx-auto text-sm leading-relaxed">
          Run the whole system and it comes together in your{' '}
          <strong className="text-foreground">Guest Journey Playbook</strong> — your property&apos;s
          entire experience, in one place. <span className="text-primary">(Legendary)</span>
        </p>
      </section>

      {/* ─── About the system ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Why it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-center text-foreground mb-6 max-w-2xl mx-auto">
            Each part does one thing.<br />Together, they change everything.
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto text-sm leading-relaxed">
            StayStory isn&apos;t four features that happen to sit side by side. It&apos;s one path,
            walked in order — each step making the next one possible.
          </p>

          <div className="flex flex-col divide-y divide-border border-y border-border">
            {[
              {
                name: 'Experience Audit',
                gives: 'Awareness',
                purpose: 'You can’t design what you can’t feel. The Audit returns you to your guest’s first-time eyes — so the invisible becomes obvious.',
              },
              {
                name: 'Experience Blueprint',
                gives: 'Structure',
                purpose: 'A stay isn’t a building. It’s a sequence of moments in time. The Blueprint gives that sequence a beginning, a middle, and an ending worth remembering.',
              },
              {
                name: 'Experience Generator',
                gives: 'Specificity',
                purpose: 'Generic care is just service. The Generator makes care specific — this gesture, for this guest, at this moment.',
              },
              {
                name: 'Story Builder',
                gives: 'Meaning',
                purpose: 'An experience that can’t be told ends at checkout. The Story Builder gives it a second life — anticipated, felt, and retold in the guest’s own words.',
              },
              {
                name: 'Guest Journey Playbook',
                gives: 'Identity',
                purpose: 'Run the system once and you’ve created a moment. Run it until it’s who you are, and the Playbook is what you become — a host who guides on purpose.',
              },
            ].map((row) => (
              <div key={row.name} className="grid sm:grid-cols-[1fr_1.6fr] gap-2 sm:gap-8 py-6 items-start">
                <div className="flex flex-col gap-1">
                  <p className="font-serif font-semibold text-foreground">{row.name}</p>
                  <p className="text-xs uppercase tracking-widest text-primary">Gives you {row.gives.toLowerCase()}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{row.purpose}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-foreground font-serif text-lg sm:text-xl leading-snug mt-16 max-w-2xl mx-auto">
            Together, they move you from running a rental to guiding a hero
            through a story worth remembering.
          </p>
        </div>
      </section>

      {/* ─── Proof ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                What guests say when the system is running
              </p>
              <h2 className="text-3xl font-serif font-semibold text-foreground max-w-md">
                These aren&apos;t reviews.<br />They&apos;re evidence.
              </h2>
            </div>
            <a
              href={AIRBNB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline shrink-0 pb-1"
            >
              {rating}★ · {reviews} reviews on Airbnb ↗
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {CURATED_REVIEWS.map((r) => (
              <div
                key={r.author + r.detail}
                className="bg-background rounded-2xl p-6 border border-border flex flex-col gap-4"
              >
                <p className="text-sm text-foreground leading-relaxed italic flex-1">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Origin ───────────────────────────────────────────────────────── */}
      <section id="origin" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 text-center">
          Built by hosts, for hosts
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground text-center mb-16 max-w-2xl mx-auto">
          This system wasn&apos;t invented.<br />It was lived.
        </h2>

        {/* Ogun */}
        <div className="grid sm:grid-cols-2 gap-10 items-center mb-20">
          <Img
            src={IMAGES.ogun}
            alt="Ogun — co-founder"
            className="rounded-2xl h-80 sm:h-96 order-2 sm:order-1"
          />
          <div className="order-1 sm:order-2 flex flex-col gap-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Co-founder</p>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Ogun</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Ogun has spent his entire career in hospitality — from professional kitchens to executive
              roles. He has spent decades studying what separates a stay guests forget from one they
              recount for years. The answer is never the thread count. It is always the intention.
            </p>
            <p className="text-foreground font-medium italic text-sm border-l-2 border-primary pl-4">
              &ldquo;The highest compliment a guest ever gave us wasn&apos;t about the food or the décor.
              It was: &lsquo;you made me feel like the only person here.&rsquo; That&apos;s what we&apos;re chasing.&rdquo;
            </p>
          </div>
        </div>

        {/* Evie */}
        <div className="grid sm:grid-cols-2 gap-10 items-center mb-20">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Co-founder</p>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Evie</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Long before sustainable care was fashionable, Evie was building her work around it.
              She does not follow trends in hospitality. She creates the experience, then watches
              the trends catch up. Her instinct for environment — the smell, the light, the temperature,
              the thing nobody asked for — is in every part of how StayStory thinks.
            </p>
            <p className="text-foreground font-medium italic text-sm border-l-2 border-primary pl-4">
              &ldquo;The way a space feels when you walk in — that&apos;s not an accident. That&apos;s a decision.
              We just help hosts make better ones.&rdquo;
            </p>
          </div>
          <Img
            src={IMAGES.evie}
            alt="Evie — co-founder"
            className="rounded-2xl h-80 sm:h-[500px] bg-muted"
            objectFit="contain"
          />
        </div>

        {/* Together */}
        <div className="grid sm:grid-cols-2 gap-10 items-center">
          <Img
            src={IMAGES.together}
            alt="Ogun and Evie at Laurel & Lore"
            className="rounded-2xl h-80 sm:h-96 order-2 sm:order-1"
          />
          <div className="order-1 sm:order-2 flex flex-col gap-5">
            <h3 className="text-2xl font-serif font-semibold text-foreground">
              Together, they built something rare.
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Ogun and Evie are a married couple who brought their worlds together —
              his hospitality craft, her legacy of intentional care — and applied it to their
              Airbnb property, <strong className="text-foreground">Laurel &amp; Lore</strong>,
              near Savannah, Georgia.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm">
              The result:{' '}
              <a
                href={AIRBNB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline"
              >
                {rating}★ across {reviews} reviews.
              </a>{' '}
              The word guests use more than any other to describe their stay:{' '}
              <strong className="text-foreground italic">love.</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm">
              StayStory is the system they built and ran first. Everything in it was tested on
              a real property, with real guests, before it was ever offered to anyone else.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={AIRBNB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                See the property on Airbnb ↗
              </a>
              <a
                href="https://laurelandlore.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Visit laurelandlore.com ↗
              </a>
            </div>
          </div>
        </div>

        {/* Property photo grid */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Img src={IMAGES.deck} alt="The deck at golden hour" className="rounded-2xl h-56 sm:h-72 col-span-2 sm:col-span-2" />
          <Img src={IMAGES.outdoorShower} alt="The outdoor shower" className="rounded-2xl h-56 sm:h-72" />
          <Img src={IMAGES.wellness} alt="The wellness space" className="rounded-2xl h-48 sm:h-64" />
          <Img src={IMAGES.movieNight} alt="Movie night on the deck" className="rounded-2xl h-48 sm:h-64 col-span-1 sm:col-span-2" />
        </div>
      </section>

      {/* ─── Transformation ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Where are you right now?
          </p>
          <h2 className="text-3xl font-serif font-semibold text-foreground text-center mb-4 max-w-xl mx-auto">
            Every host has a next level.<br />This is what it looks like.
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-16 max-w-lg mx-auto leading-relaxed">
            StayStory was built to move hosts from wherever they are to the next stage —
            until they become the host their guests never forget.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                name: 'The Basic Stay',
                desc: 'Clean. Functional. Forgettable. The guest had everything they needed. They left a 4-star review without quite knowing why.',
              },
              {
                step: '02',
                name: 'The Thoughtful Stay',
                desc: "Guests notice the details. There's coffee waiting. The lighting feels right. The instructions are clear. They mention the host in their review.",
              },
              {
                step: '03',
                name: 'The Experiential Stay',
                desc: "Guests feel something they didn't expect. There's one specific moment that catches them off guard. That's the moment they photograph. That's the moment they tell people about.",
              },
              {
                step: '04',
                name: 'The Unforgettable Stay',
                desc: "Guests carry the story home. They don't just leave 5 stars — they write the review like a letter. They come back. They send their friends.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3 p-5 bg-background rounded-2xl border border-border">
                <span className="text-xs font-mono text-muted-foreground">{item.step}</span>
                <p className="font-serif font-semibold text-foreground text-sm leading-snug">{item.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Manifesto ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-foreground text-background">
        <div className="max-w-3xl mx-auto flex flex-col gap-8 text-center">
          <p className="text-xs uppercase tracking-widest text-background/50">
            What we believe
          </p>
          <div className="flex flex-col gap-7 font-serif text-2xl sm:text-3xl leading-snug">
            <p>
              The room was never the point. A guest forgets the thread count.
              They remember how your place made them feel.
            </p>
            <p>
              Service does what&apos;s expected. Hospitality makes someone feel seen.
            </p>
            <p>
              That feeling isn&apos;t luck. It&apos;s a craft — and a craft can be
              designed, and repeated.
            </p>
            <p className="text-primary">
              The host is the guide. The guest is the hero.
            </p>
          </div>
          <p className="text-background/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto pt-2">
            We&apos;re not here to help you manage a property. We&apos;re here to help
            you author an experience — and put it into words guests carry home.
          </p>
          <p className="font-serif text-xl sm:text-2xl text-background pt-2">
            StayStory is how you write the story they never forget.
          </p>
        </div>
      </section>

      {/* ─── Primary CTA ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-5 leading-tight">
          Your next guest deserves<br />to feel something.
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
          Start with an Experience Audit. It takes five minutes. It will show you the moments
          that matter most to your guests — and exactly which ones you can make unforgettable.
        </p>
        <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-10')}>
          Start free — no card needed
        </Link>
        <p className="text-xs text-muted-foreground mt-5">
          Free plan includes full access to the Experience Audit and your first designed moment.
          Upgrade to Legendary when you&apos;re ready.
        </p>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card border-t border-border">
        <HomePricing />
      </section>

      {/* ─── Philosophy footer ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 text-center mb-16">
            {[
              {
                role: 'The Foundation',
                idea: 'Stay in your own rental. Fix the invisible things — the ones guests never mention but always remember.',
              },
              {
                role: 'The Wow',
                idea: 'Service does the job. Hospitality makes people feel something. Spend a little foolishly on the moments that matter most.',
              },
              {
                role: 'The Story',
                idea: 'The host is the guide. The guest is the hero. Every great stay is a story waiting to be told.',
              },
            ].map((p) => (
              <div key={p.role} className="flex flex-col gap-2 items-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed italic max-w-xs">&ldquo;{p.idea}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} StayStory · Built by Ogun &amp; Evie ·{' '}
        <a
          href="https://laurelandlore.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          laurelandlore.com
        </a>
      </footer>

    </div>
  )
}
