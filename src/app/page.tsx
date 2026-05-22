import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ReviewsSection } from './reviews-section'
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
    quote: "We had such a lovely time here, I would really recommend! This host had thought of everything to make our stay really comfortable. We especially liked the fire pit and campfire story book!",
    author: 'Jo',
    detail: '5 years on Airbnb · July 2024 · 5★',
  },
  {
    quote: "Everything was great! The whole experience was well worth the price and time. Thank you so much for letting us have our reunion at your place! Highly recommend this place and host!",
    author: 'Cristie',
    detail: 'Hartson, Arkansas · July 2024 · 5★',
  },
  {
    quote: "The RV is modern, fully stocked, and spacious enough for families. Evie even has detailed instructional videos for absolutely everything and we found them very helpful. My wife and I loved the RV and my children can't wait to come back and stay longer.",
    author: 'Roberto',
    detail: 'Vineland, New Jersey · May 2024 · 5★',
  },
  {
    quote: "Perfect quiet getaway in a private natural setting.",
    author: 'Jennifer',
    detail: 'Hilton Head Island, SC · March 2026 · 5★',
  },
  {
    quote: "First time staying in an RV but it worked great with our two dogs.",
    author: 'Thea',
    detail: '11 years on Airbnb · February 2026 · 5★',
  },
  {
    quote: "Cute place, have everything you need to be comfortable during your stay. Host was super nice and very attentive.",
    author: 'Christian & Oriana',
    detail: 'Braselton, Georgia · November 2025 · 5★',
  },
  {
    quote: "Loved the experience of staying in an RV. The surroundings were beautiful and peaceful. We were able to travel Savannah and enjoy the sites and come back and just relax. It was like being at home. Very comfortable and cozy.",
    author: 'Kimberly',
    detail: 'Warner Robins, Georgia · July 2025 · 5★',
  },
  {
    quote: "We had a great stay! The place was very clean, well-organized, and exactly as described in the listing. The area is private and peaceful — perfect for a relaxing getaway. I would definitely recommend this place to others and would love to come back again!",
    author: 'Anvesh',
    detail: 'Tampa, Florida · July 2025 · 5★',
  },
  {
    quote: "Super cute RV. The little details made it super homey. The fresh ground coffee maker was a hit in the AMs!! The cold Topo Chico in the fridge after the drive was so good. Might seem like something small but the dish soap and complementary body wash was a lovely touch.",
    author: 'Carolina',
    detail: 'Hollywood, Florida · June 2025 · 5★',
  },
  {
    quote: "My family had such an incredible stay! It was our first time staying in an RV and we enjoyed it a lot more than we anticipated. The place was very clean and had such thoughtful touches throughout the space. Our toddler loved the books, games, and campfire! We can't say enough good things about this place.",
    author: 'Victoria',
    detail: '10 years on Airbnb · April 2025 · 5★',
  },
  {
    quote: "Fantastic place! The details put into the place including the welcome sign with my name, whole bean coffee with Keurig grinder, and sparkling water with chilled glasses upon arrival were amazing! We are already planning on coming back. Convenient to Savannah but with safety and privacy. Love the outdoor seating and the fireplace inside.",
    author: 'Heather',
    detail: 'Douglasville, Georgia · April 2025 · 5★',
  },
  {
    quote: "What a great find! The perfect spot for travelers with furry friends. It was cozy, clean and so many special touches. We even watched a movie theater style with the extremely comfortable furniture while having the fireplace on. We stayed with our kids and 2 dogs and it was perfect — the host was extremely responsive to any inquiries we had.",
    author: 'James',
    detail: 'Ft. Myers, FL · January 2025 · 5★',
  },
  {
    quote: "This was perfect for our weekend getaway. Situated outside of the ruckus of the city, we were able to enjoy quiet, peaceful evenings and mornings with the birds chirping and sound of wind in the trees. Evie and her husband were beyond responsive and friendly. This is an amazing place to stay if you are looking for a little slice of heaven.",
    author: 'Alison',
    detail: 'Quebec, Canada · October 2024 · 5★',
  },
  {
    quote: "This worked out great for my family. The host accommodated a last minute booking with no problem. Extremely clean, comfortable beds and clean bathroom — the surrounding area was very peaceful and quiet. The YouTube videos made it extremely easy to find and gave plenty of information. Extremely pleased.",
    author: 'Keith',
    detail: 'Martin, Tennessee · July 2024 · 5★',
  },
  {
    quote: "The perfect stop near Savannah and I-95. Evie was a great host and the space was perfect. Everything was as described and it was super clean. Would definitely stay again!",
    author: 'Robert',
    detail: 'Port St. Lucie, Florida · July 2024 · 5★',
  },
  {
    quote: "The camper is well maintained and lots of nice touches from the host — guides laid out to area attractions, nice coffee maker and sparkling water left in the fridge on arrival. It's a great value and exactly like the pictures.",
    author: 'Verified Guest',
    detail: 'June 2024 · Stayed with kids · 5★',
  },
  {
    quote: "The RV was perfect for our 2 night stay. It looked just like the photos, was very clean and comfortable. It was great for our dog with a lot of grassy area to walk in. The host was very nice and took the time to answer some of our questions. It was a very private and quiet setting.",
    author: 'Rhonda',
    detail: 'Overland Park, Kansas · June 2024 · 5★',
  },
  {
    quote: "Evie is amazing! This place was very well kept and an enjoyable time. She was very kind to our family and hospitable. Her children welcomed my children, sharing their toys and playing with them the entire time. My children adored them and had a fantastic time!",
    author: 'Gina',
    detail: 'York, Pennsylvania · May 2024 · 5★',
  },
  {
    quote: "We really enjoyed our stay. It was cozy and comfortable. The location was peaceful as well. Perfect spot to relax and easy to get to the city if necessary.",
    author: 'Sonya',
    detail: '8 years on Airbnb · April 2025 · 5★',
  },
  {
    quote: "Lovely trailer. Very clean and comfortable. Great internet and streaming services. Good location — close to our family we were visiting and convenient to Savannah. Very peaceful. Friendly family. Would definitely stay again.",
    author: 'Julie',
    detail: 'Falls City, Nebraska · March 2025 · 5★',
  },
  {
    quote: "Evie and her husband made it such an easy and comfortable experience for us. Their place truly felt like home — everything we needed and then some. It felt like we were in the middle of secluded wilderness and yet only 30 minutes from downtown Savannah. Perfect in every way and we will be back again.",
    author: 'Sonia',
    detail: 'Miami, Florida · March 2025 · 5★',
  },
  {
    quote: "The Airbnb was exactly as listed. I definitely felt comfortable and safe. It's a real cozy intimate mobile home. It was amazing. I definitely want to use this Airbnb again since I have family in the vicinity.",
    author: 'Christine',
    detail: 'Fort Mill, South Carolina · November 2024 · 5★',
  },
  {
    quote: "The absolute best place to stay. It is so cozy! The hosts are super nice and very helpful. When we make our way back to Georgia, we will definitely book with them again.",
    author: 'Taylor',
    detail: 'Hutchinson, Kansas · August 2024 · 5★',
  },
  {
    quote: "We were there when Hurricane Helene was passing by. The hosts were extremely proactive being sure we were okay and cared for. Throughout our stay they were so attentive that it made us feel very nurtured and safe. Besides all that, the place was completely comfortable and everything any traveler might ever need was right there at hand. They had thought of every thing!",
    author: 'Katie',
    detail: 'Asheville, North Carolina · October 2024 · 5★',
  },
  {
    quote: "Perfect accommodation — they do everything perfectly. Extremely clean. We will definitely return. Thank you.",
    author: 'Allison',
    detail: 'Fort Lauderdale, Florida · December 2025 · 5★',
  },
  {
    quote: "The RV was perfect for us. Very clean and plenty of amenities. It was very quiet and peaceful. Will definitely consider booking again if we ever are in the area again.",
    author: 'Synthia',
    detail: '2 years on Airbnb · April 2025 · 5★',
  },
  {
    quote: "Place was the perfect night stay! Much better than a hotel! Especially having the separate room for our kids! And the host was very accommodating! Definitely recommend!",
    author: 'Nicole',
    detail: 'Arcadia, Florida · April 2025 · 5★',
  },
  {
    quote: "Evie's place was fantastic. We thoroughly enjoyed our stay and the hosts have really thought of pretty much everything you could need. We loved our RV vacay.",
    author: 'Kelley & Dan',
    detail: 'Charlotte, North Carolina · January 2025 · 5★',
  },
  {
    quote: "Value, clean, comfortable, quiet — great choice for a getaway. She was VERY informative with excellent instructional videos and directions. Very satisfied guest here.",
    author: 'Jamie',
    detail: '6 years on Airbnb · December 2024 · 5★',
  },
  {
    quote: "It was a great cozy place to stay with my kids while we were visiting family. The space was just right and it was very quiet and peaceful.",
    author: 'Sandra',
    detail: 'Kansas City, Missouri · July 2024 · 5★',
  },
]

export default async function LandingPage() {
  const { rating, reviews } = await getAirbnbStats()
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
          href={AIRBNB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-accent px-3 py-1.5 rounded-full mb-8 hover:bg-accent/80 transition-colors"
        >
          {rating}★ · {reviews} reviews · See the property that built this ↗
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
              alt="Ogun — co-founder"
              className="rounded-2xl h-80 sm:h-96 order-2 sm:order-1"
            />
            <div className="order-1 sm:order-2 flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Co-founder</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">Ogun</h3>
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
                <h3 className="text-2xl font-serif font-semibold text-foreground">Evie</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Before sustainability was a hashtag, Evie was already exploring what it meant to live and work more consciously. In the early 2000s — when few businesses were making green cleaning their focus — she began shaping her work around those ideas, serving clients who understood that how you care for a space reflects how you value it.
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
              alt="Evie — co-founder"
              className="rounded-2xl h-80 sm:h-[500px] bg-muted"
              objectFit="contain"
            />
          </div>

          {/* Together */}
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <ImageSlot
              src={IMAGES.together}
              alt="Ogun and Evie at Laurel &amp; Lore"
              className="rounded-2xl h-80 sm:h-96 order-2 sm:order-1"
            />
            <div className="order-1 sm:order-2 flex flex-col gap-5">
              <h3 className="text-2xl font-serif font-semibold text-foreground">Together, they built something rare.</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ogun and Evie are a married couple who brought their worlds together — his hospitality craft, her legacy of intentional care — and applied it to their Airbnb property. The result: <a href={AIRBNB_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:underline">{rating}★ across {reviews} reviews.</a>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Guests use one word more than any other when they describe their stay: <strong className="text-foreground italic">love.</strong> We don't think that's a coincidence. We think it's a system. And we built StayStory so every host can run it.
              </p>
              <a
                href={AIRBNB_URL}
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

      <ReviewsSection reviews={REVIEWS} rating={rating} reviewCount={reviews} airbnbUrl={AIRBNB_URL} />

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
              bg: 'bg-accent', teacher: 'Experience Design',
            },
            {
              n: '3', title: 'Map every touchpoint', sub: 'The Stay Experience',
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
                desc: 'Paste any guest message and it automatically extracts their name, occasion, emotional state, interests, and notes — and fills the form for you.',
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

      {/* ─── Legendary CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-3">Legendary — {LEGENDARY_PRICE}</p>
                <h2 className="text-3xl font-serif font-semibold leading-tight mb-4">
                  Stop guessing what your guests feel. Start knowing.
                </h2>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Every tool, unlimited. A custom playbook built for your property. Direct access to Ogun and Evie. Built by hosts who've run the system themselves.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  'All five tools — no limits, no resets',
                  'Custom Guest Journey Playbook for your property',
                  'Guest Story Builder — unlimited',
                  'Journey Map — all 14 touchpoints',
                  'Priority support from Ogun & Evie',
                ].map(f => (
                  <p key={f} className="flex items-center gap-2 text-primary-foreground/90">
                    <span>✓</span> {f}
                  </p>
                ))}
              </div>
              <Link href="/signup" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'w-fit')}>
                Become Legendary →
              </Link>
            </div>
            <ImageSlot
              src={IMAGES.together}
              alt="Ogun and Evie at Laurel & Lore"
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
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-center mb-4 text-foreground">Simple pricing.</h2>
          <p className="text-center text-muted-foreground mb-14">Start free. Upgrade to Legendary when you're ready. Cancel anytime.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                name: 'Free', price: '$0',
                features: ['Foundation Audit', '1 generator use/month', 'Guest message auto-fill', '1 free preview of each tool'],
                highlight: false,
              },
              {
                name: 'Legendary', price: LEGENDARY_PRICE,
                features: ['All five tools — unlimited', 'Custom Guest Journey Playbook', 'Guest Story Builder', 'Journey Map', 'Priority support'],
                highlight: true,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 flex flex-col gap-4 border ${tier.highlight ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
              >
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
                  {tier.highlight ? 'Become Legendary →' : 'Start free'}
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
        © {new Date().getFullYear()} StayStory · Built by Ogun & Evie ·{' '}
        <a href="https://laurelandlore.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
          laurelandlore.com
        </a>
      </footer>

    </div>
  )
}
