import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { LEGENDARY_PRICE } from '@/lib/config'

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
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <span className="text-xl font-serif font-semibold tracking-tight text-foreground">StayStory</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
            Start free
          </Link>
        </div>
      </nav>

      {/* ─── Declaration ──────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
          A system for intentional hosting
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-foreground mb-8">
          The host is the guide.<br />
          The guest is the hero.<br />
          <span className="text-primary">StayStory is how you write<br className="hidden sm:block" /> the story they never forget.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          Most hosts optimise the property. The best hosts design the experience.
          StayStory gives you the system to do it — from the moment a guest books
          to the memory they carry home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-8')}>
            Start free — no card needed
          </Link>
          <a
            href="#origin"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            See where it was built ↓
          </a>
        </div>
      </section>

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

      {/* ─── The System ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
          How it works
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-center text-foreground mb-4 max-w-2xl mx-auto">
          Three phases. One system.<br />One unforgettable stay.
        </h2>
        <p className="text-center text-muted-foreground mb-20 max-w-xl mx-auto text-sm leading-relaxed">
          StayStory is not a set of tools. It is a method — designed around how great hosts already think,
          and tested on a real property before it was ever shared with anyone else.
        </p>

        <div className="flex flex-col gap-2">

          {/* Phase 1 */}
          <div className="bg-secondary rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">01</span>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Phase One</p>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Design</h3>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                Know what your guest will feel before they arrive.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Most of what guests feel at a property was decided before they walked in the door.
                The temperature. The smell. The first thing their eyes go to. The thing that was waiting
                for them that they didn&apos;t expect.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                StayStory starts here — with an audit that surfaces the invisible things that shape
                every guest&apos;s impression, and a system that turns what you know about a specific
                guest into a specific plan of care.
              </p>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-accent rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">02</span>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Phase Two</p>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Map</h3>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                Every moment of their stay, mapped — including the ones you haven&apos;t thought about yet.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From the second a guest books to after they check out, there are fourteen moments
                that define how they will feel about their stay. Most hosts are excellent at two or
                three of them. They are unaware of the rest.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Journey Map shows you all fourteen — across every phase of the stay — and surfaces
                exactly where guests are forming impressions you have not designed for yet.
              </p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-primary/10 rounded-2xl p-8 sm:p-10 grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-3">
              <span className="text-4xl font-serif font-bold text-muted-foreground/20">03</span>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Phase Three</p>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Tell</h3>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-lg font-serif text-foreground leading-snug">
                Turn what you created into a story that outlasts the stay.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hospitality without a story is just service. The Guest Story Builder takes what you did —
                the gesture, the detail, the moment — and turns it into a narrative your brand can carry:
                listing copy, social captions, the words that make a stranger choose you over everyone else.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Guest Journey Playbook ties everything together — your property&apos;s positioning,
                your guest archetypes, your touchpoint priorities, your monthly rhythm. All in one place.
              </p>
            </div>
          </div>

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
            and eventually, to stay there permanently.
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

      {/* ─── Primary CTA ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-5 leading-tight">
          Your next guest deserves<br />to feel something.
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
          Start with a Foundation Audit. It takes five minutes. It will show you the moments
          that matter most to your guests — and exactly which ones you can make unforgettable.
        </p>
        <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-10')}>
          Start free — no card needed
        </Link>
        <p className="text-xs text-muted-foreground mt-5">
          Free plan includes full access to the Foundation Audit and one generation.
          Upgrade to Legendary when you&apos;re ready.
        </p>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 text-center">
            Two ways in
          </p>
          <h2 className="text-3xl font-serif font-semibold text-center mb-4 text-foreground">
            Start free. Run the full system<br />when you&apos;re ready.
          </h2>
          <p className="text-center text-muted-foreground mb-14 text-sm">
            Cancel anytime. No contracts.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Free */}
            <div className="rounded-2xl p-7 flex flex-col gap-5 border border-border bg-background">
              <div>
                <p className="font-serif font-semibold text-foreground text-lg">Free</p>
                <p className="text-3xl font-semibold text-foreground mt-2">$0</p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  The place to start. Run your first audit, try the system, and see exactly
                  where your guest experience can go.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
                {[
                  'Foundation Audit — full access',
                  'Hospitality Generator — 1 use / month',
                  'Preview of every part of the system',
                  'Guest message auto-fill',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Start free
              </Link>
            </div>

            {/* Legendary */}
            <div className="rounded-2xl p-7 flex flex-col gap-5 border border-primary bg-primary/5">
              <div>
                <p className="font-serif font-semibold text-foreground text-lg">Legendary</p>
                <p className="text-3xl font-semibold text-foreground mt-2">{LEGENDARY_PRICE}</p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  The complete system. Every phase, every instrument, no limits — plus your custom
                  Guest Journey Playbook built for your property.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
                {[
                  'Everything in Free — unlimited',
                  'Journey Map — all 14 touchpoints',
                  'Guest Story Builder — unlimited',
                  'Guest Journey Playbook — your full property playbook',
                  'Priority support from Ogun & Evie',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
                Become Legendary →
              </Link>
            </div>
          </div>
        </div>
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
