import { StrictMode, useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  ExternalLink,
  FileText,
  Gamepad2,
  Gavel,
  GraduationCap,
  Leaf,
  LockKeyhole,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';
import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
  ReviewStars,
} from '@/components/ui/animated-cards-stack';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HandWrittenTitle } from '@/components/ui/hand-writing-text';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from '@/components/ui/mapcn-marker-popup';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import './styles.css';

const foodImages = [
  '/assets/campus-food-1.png',
  '/assets/campus-food-2.png',
  '/assets/campus-food-3.png',
  '/assets/campus-food-4.png',
  '/assets/campus-food-5.png',
];

const impactStats = [
  { value: '142.6', unit: 'kg CO2e', label: 'avoided this month', note: 'method disclosed' },
  { value: '318', unit: 'meals', label: 'redirected to students', note: 'demo campus' },
  { value: '04', unit: 'min', label: 'sample pickup window', note: 'live alert' },
  { value: 'OP-8', unit: '', label: 'report-ready export', note: 'STARS aligned' },
];

const platformSteps = [
  {
    icon: Utensils,
    title: 'Post catered surplus',
    copy: 'Event organizers add food type, quantity estimate, location, pickup window, and handling notes in one tight workflow.',
  },
  {
    icon: Bell,
    title: 'Alert nearby students',
    copy: 'Students see a live pickup feed with clear timing, location, and claim status before food disappears into hallway rumor.',
  },
  {
    icon: Download,
    title: 'Export the record',
    copy: 'Each recovery produces a campus-readable impact entry with estimates, method notes, and reporting context attached.',
  },
];

const audienceRows = [
  {
    audience: 'Sustainability',
    lead: 'Reportable impact',
    line: 'Turn catered surplus into Scope 3 data you can actually report.',
  },
  {
    audience: 'IT / admin',
    lead: 'Low risk',
    line: 'SSO-ready workflows without student PII sprawl.',
  },
  {
    audience: 'Students',
    lead: 'Free food, now',
    line: 'Grab campus food before it becomes waste, then earn points for showing up.',
  },
  {
    audience: 'Partners',
    lead: 'The blind spot',
    line: 'Campuses track composting. Catered surplus deserves the same rigor.',
  },
];

const trustItems = [
  { icon: LockKeyhole, title: 'Campus-controlled access', copy: 'Designed around university identity, policy review, and local operating rules.' },
  { icon: ShieldCheck, title: 'Privacy-first posture', copy: 'Keep student participation useful without turning pickup behavior into unnecessary personal data.' },
  { icon: Database, title: 'Measured claims', copy: 'Impact views separate estimated weights, CO2e, assumptions, and source methods.' },
];

const demandSignals = [
  {
    icon: Gavel,
    domain: 'Compliance',
    sourceDomain: 'calrecycle.ca.gov',
    source: 'CalRecycle / SB 1383',
    signal: 'Food donors must recover the maximum edible food that would otherwise be disposed.',
    quote: 'maximum amount of edible food',
    takeaway: 'ReCater gives sustainability and dining teams a cleaner way to route surplus, document activity, and avoid treating recovery as an ad hoc favor.',
    href: 'https://calrecycle.ca.gov/organics/slcp/foodrecovery/',
  },
  {
    icon: ClipboardCheck,
    domain: 'Records',
    sourceDomain: 'calrecycle.ca.gov',
    source: 'CalRecycle recordkeeping',
    signal: 'Food recovery participants need records that support reporting and inspection readiness.',
    quote: 'records that demonstrate compliance',
    takeaway: 'The platform value is not only pickup alerts; it is the trail of food type, timing, location, estimated quantity, and recovery method.',
    href: 'https://calrecycle.ca.gov/organics/slcp/recordkeeping/',
  },
  {
    icon: FileText,
    domain: 'California horizon',
    sourceDomain: 'cdfa.ca.gov',
    source: 'CDFA / AB 660',
    signal: 'California is standardizing food date labels and banning consumer-facing sell-by dates starting July 1, 2026.',
    quote: 'best if used by',
    takeaway: 'The policy direction is clearer food decisions. ReCater can reinforce that same plain-language trust around what is safe, fresh, and recoverable.',
    href: 'https://www.cdfa.ca.gov/is/foodrecovery/fooddatelabeling/',
  },
  {
    icon: Leaf,
    domain: 'Climate reporting',
    sourceDomain: 'arb.ca.gov',
    source: 'CARB / SB 253 and SB 261',
    signal: 'California climate transparency rules are pushing organizations toward more disciplined emissions data.',
    quote: 'climate transparency',
    takeaway: 'For large systems and partners, food recovery records become part of the broader move from sustainability stories to auditable data.',
    href: 'https://ww2.arb.ca.gov/news/carb-approves-climate-transparency-regulation-entities-doing-business-california',
  },
  {
    icon: GraduationCap,
    domain: 'Students',
    sourceDomain: 'gao.gov',
    source: 'U.S. GAO',
    signal: 'GAO estimated that 23 percent of college students experienced food insecurity in 2020.',
    quote: '3.8 million college students',
    takeaway: 'Students already hunt for campus food informally. ReCater makes the signal official, timely, and less stigmatized.',
    href: 'https://www.gao.gov/products/gao-24-107074',
  },
  {
    icon: Gamepad2,
    domain: 'Engagement',
    sourceDomain: 'springer.com',
    source: 'Gamification research',
    signal: 'Research on gamification in education links game elements with motivation, autonomy, and relatedness.',
    quote: 'intrinsic motivation',
    takeaway: 'Points and streaks should not be decoration; they should help students return, share pickups responsibly, and feel their actions matter.',
    href: 'https://link.springer.com/article/10.1007/s11423-023-10337-7',
  },
  {
    icon: ShieldCheck,
    domain: 'IT guardrails',
    sourceDomain: 'educause.edu',
    source: 'EDUCAUSE',
    signal: 'Higher ed teams are under pressure to assess third-party products, data privacy, and vendor risk.',
    quote: 'third-party risk management',
    takeaway: 'ReCater has to show privacy, SSO readiness, and vendor review posture early so IT is not surprised late in procurement.',
    href: 'https://er.educause.edu/articles/2024/8/educause-quickpoll-results-third-party-risk-management-practices-in-higher-education',
  },
];

function getSourceInitials(source: string) {
  const primarySource = source
    .replace(/\/.*/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\./g, '')
    .trim();

  if (/^[A-Z]{2,}$/.test(primarySource)) {
    return primarySource.slice(0, 3);
  }

  return primarySource
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function getSourceLogoUrl(sourceDomain: string) {
  return `https://www.google.com/s2/favicons?domain=${sourceDomain}&sz=64`;
}

const sourceCardRotations = [-4, 3, -2, 4, -3];

const campusPickups = [
  {
    id: 'student-center',
    label: 'Student Center',
    food: 'Sandwich trays + fruit',
    location: 'Student Center Atrium',
    window: '2:30-2:45 PM',
    servings: '34 servings',
    status: 'Live pickup',
    lng: -122.259,
    lat: 37.8721,
    image: '/assets/campus-food-5.png',
  },
  {
    id: 'north-quad',
    label: 'North Quad',
    food: 'Boxed lunches',
    location: 'North Quad Lawn',
    window: '3:05-3:25 PM',
    servings: '18 servings',
    status: 'Claiming fast',
    lng: -122.2557,
    lat: 37.8754,
    image: '/assets/campus-food-1.png',
  },
  {
    id: 'library',
    label: 'Library',
    food: 'Breakfast pastries',
    location: 'Library Terrace',
    window: '10:10-10:30 AM',
    servings: '22 servings',
    status: 'Scheduled',
    lng: -122.2609,
    lat: 37.871,
    image: '/assets/campus-food-2.png',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    food: 'Catered salad bowls',
    location: 'Engineering Hall',
    window: '4:15-4:35 PM',
    servings: '27 servings',
    status: 'Admin posted',
    lng: -122.2538,
    lat: 37.8704,
    image: '/assets/campus-food-3.png',
  },
];

function getInitialPage() {
  return window.location.pathname === '/contact' || window.location.pathname === '/thanks' ? 'contact' : 'home';
}

function App() {
  const [page, setPage] = useState<'home' | 'contact'>(getInitialPage);

  useEffect(() => {
    function handlePopState() {
      setPage(getInitialPage());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPage: 'home' | 'contact') {
    const path = nextPage === 'contact' ? '/contact' : '/';
    window.history.pushState({}, '', path);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="Site header">
        <a className="brand-lockup" href="/" aria-label="ReCater home" onClick={(event) => {
          event.preventDefault();
          navigate('home');
        }}>
          <img src="/assets/recater-logo.svg" alt="ReCater" />
        </a>

        <nav className="topnav" aria-label="Main navigation">
          <a href="/#platform">Platform</a>
          <a href="/#impact">Impact</a>
          <a href="/#demand">Demand</a>
          <a href="/#security">Security</a>
          <a href="/#students">Students</a>
        </nav>

        <a className="header-cta" href="/contact" onClick={(event) => {
          event.preventDefault();
          navigate('contact');
        }}>
          <span>Book a demo</span>
          <ArrowUpRight size={17} strokeWidth={2.2} />
        </a>
      </header>

      {page === 'contact' ? <ContactPage /> : <HomePage navigate={navigate} />}
    </main>
  );
}

function HomePage({ navigate }: { navigate: (nextPage: 'home' | 'contact') => void }) {
  useLayoutEffect(() => {
    const targetId = window.location.hash.replace('#', '');
    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, target.offsetTop);
    root.style.scrollBehavior = previousScrollBehavior;
  }, []);

  return (
    <>
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/assets/campus-food-5.png"
        bgImageSrc="/assets/campus-food-1.png"
        logoSrc="/assets/recater-mark.png"
        title="Catered surplus reimagined"
        date="ReCater"
        scrollToExpand="Scroll to lift the cloche"
        className="recater-scroll-hero"
      >
        <div className="hero-expanded-grid">
          <div className="hero-copy">
            <p className="eyebrow">Campus food recovery / student pickup alerts / reportable impact</p>
            <h1 id="hero-title">
              Catered surplus, <span className="display-accent">reimagined</span> for campus impact.
            </h1>
            <p className="hero-lede">
              ReCater helps universities recover catered surplus, notify students in real time, and turn every pickup into a clean record sustainability teams can defend.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/contact" onClick={(event) => {
                event.preventDefault();
                navigate('contact');
              }}>
                Bring ReCater to campus
                <ArrowUpRight size={19} strokeWidth={2.2} />
              </a>
              <a className="button button-secondary" href="#platform">See the workflow</a>
            </div>
            <div className="proof-row" aria-label="Brand promises">
              <span><CheckCircle2 size={16} /> No vague green claims</span>
              <span><CheckCircle2 size={16} /> Built for campus review</span>
            </div>
          </div>

          <div className="hero-briefing" aria-label="Catered surplus recovery preview">
            <div className="pickup-panel shadcn-card" aria-label="Sample student pickup card">
              <div className="panel-top">
                <span className="status-dot" aria-hidden="true" />
                <strong>North Quad · 4 min left</strong>
              </div>
              <p>Sandwich trays, fruit, boxed lunches</p>
              <div className="panel-meta">
                <span><MapPin size={15} /> Student Center</span>
                <span><CalendarClock size={15} /> 2:30 PM</span>
              </div>
            </div>
            <div className="impact-panel shadcn-card" aria-label="Sample impact record">
              <span className="label">Impact logged</span>
              <strong>142.6 kg CO2e</strong>
              <p>Estimate, method, and uncertainty stay attached.</p>
            </div>
          </div>
        </div>
      </ScrollExpandMedia>

      <section className="metric-band" id="impact" aria-labelledby="impact-title">
        <div className="section-heading">
          <p className="eyebrow">Measured, not marketed</p>
          <h2 id="impact-title">Every pickup becomes a record, not just a good story.</h2>
        </div>
        <div className="metric-grid">
          {impactStats.map((stat) => (
            <article className="metric shadcn-card" key={`${stat.value}-${stat.label}`}>
              <p className="label">{stat.note}</p>
              <strong>{stat.value}{stat.unit && <span> {stat.unit}</span>}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-section" id="platform" aria-labelledby="platform-title">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Platform</p>
            <h2 id="platform-title">Fast enough for students. Serious enough for administrators.</h2>
          </div>
          <p>
            The product flexes between warm student-facing moments and rigorous admin-facing records, without asking either audience to decode the other.
          </p>
        </div>
        <div className="platform-grid">
          {platformSteps.map(({ icon: Icon, title, copy }) => (
            <article className="platform-card shadcn-card" key={title}>
              <span className="icon-box"><Icon size={25} strokeWidth={1.9} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="campus-map-section" aria-labelledby="campus-map-title">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Campus pickup map</p>
            <h2 id="campus-map-title">Students see what is live before the food disappears.</h2>
          </div>
          <p>
            The map view turns scattered leftovers into visible pickup posts: food type, window, servings, location, and status in one place.
          </p>
        </div>
        <div className="campus-map-shell shadcn-card">
          <Map center={[-122.2578, 37.8727]} zoom={14.2} pitch={38} bearing={-18} theme="light">
            <MapControls showZoom showFullscreen={false} position="bottom-right" />
            {campusPickups.map((pickup) => (
              <MapMarker key={pickup.id} longitude={pickup.lng} latitude={pickup.lat}>
                <MarkerContent>
                  <div className="recater-map-marker">
                    <span />
                  </div>
                  <MarkerLabel position="bottom" className="recater-map-label">
                    {pickup.label}
                  </MarkerLabel>
                </MarkerContent>
                <MarkerPopup className="recater-map-popup p-0" closeButton>
                  <div className="map-popup-image">
                    <img src={pickup.image} alt={pickup.food} />
                  </div>
                  <div className="map-popup-body">
                    <p className="label">{pickup.status}</p>
                    <h3>{pickup.food}</h3>
                    <div className="map-popup-meta">
                      <span><MapPin size={14} /> {pickup.location}</span>
                      <span><CalendarClock size={14} /> {pickup.window}</span>
                      <span><Utensils size={14} /> {pickup.servings}</span>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}
          </Map>
        </div>
      </section>

      <section className="audience-section" aria-labelledby="audience-title">
        <div className="section-heading compact">
          <p className="eyebrow">Messaging system</p>
          <h2 id="audience-title">Same ReCater. Different first sentence.</h2>
        </div>
        <div className="audience-table shadcn-card" role="table" aria-label="Audience messaging matrix">
          <div className="audience-head" role="row">
            <span role="columnheader">Audience</span>
            <span role="columnheader">Lead with</span>
            <span role="columnheader">Opening line</span>
          </div>
          {audienceRows.map((row) => (
            <div className="audience-row" role="row" key={row.audience}>
              <strong role="cell">{row.audience}</strong>
              <span role="cell">{row.lead}</span>
              <p role="cell">"{row.line}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="demand-section" id="demand" aria-labelledby="demand-title">
        <div className="demand-intro">
          <div className="section-heading compact">
            <p className="eyebrow">Source-backed demand</p>
            <h2 id="demand-title">
              Why ReCater is becoming <span className="display-accent">infrastructure</span>.
            </h2>
          </div>
          <p>
            These are not customer testimonials. They are public signals that explain why different campus stakeholders have a reason to care: compliance, reporting, student need, incentives, and IT guardrails.
          </p>
        </div>

        <ContainerScroll className="source-stack-scroll">
          <div className="source-stack-sticky">
            <CardsContainer className="source-stack">
              {demandSignals.slice(0, 5).map(({ domain, sourceDomain, source, signal, quote, takeaway, href }, index) => (
                <CardTransformed
                  arrayLength={5}
                  index={index + 1}
                  incrementY={2}
                  incrementZ={10}
                  incrementRotation={sourceCardRotations[index]}
                  variant="light"
                  className="source-card source-card-stacked"
                  key={`${source}-${domain}`}
                  role="article"
                >
                  <div className="source-testimonial-body">
                    <ReviewStars className="source-rating" rating={5} />
                    <blockquote cite={href}>"{quote}"</blockquote>
                    <p className="source-signal">{signal}</p>
                  </div>
                  <div className="source-testimonial-footer">
                    <Avatar className="source-avatar">
                      <AvatarImage src={getSourceLogoUrl(sourceDomain)} alt={`${source} logo`} />
                      <AvatarFallback>{getSourceInitials(source)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="source-journal">{source}</span>
                      <span className="source-profession">{domain} signal</span>
                    </div>
                  </div>
                  <p className="source-takeaway">{takeaway}</p>
                  <a className="source-link" href={href} target="_blank" rel="noreferrer">
                    View original source
                    <ExternalLink size={15} strokeWidth={2} />
                  </a>
                </CardTransformed>
              ))}
            </CardsContainer>
          </div>
        </ContainerScroll>

        <div className="source-wall source-wall-fallback" aria-label="Additional public source signals">
          {demandSignals.slice(5).map(({ domain, sourceDomain, source, signal, quote, takeaway, href }) => (
            <article className="source-card source-card-static shadcn-card" key={`${source}-${domain}`}>
              <div className="source-testimonial-body">
                <ReviewStars className="source-rating" rating={5} />
                <blockquote cite={href}>"{quote}"</blockquote>
                <p className="source-signal">{signal}</p>
              </div>
              <div className="source-testimonial-footer">
                <Avatar className="source-avatar">
                  <AvatarImage src={getSourceLogoUrl(sourceDomain)} alt={`${source} logo`} />
                  <AvatarFallback>{getSourceInitials(source)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="source-journal">{source}</span>
                  <span className="source-profession">{domain} signal</span>
                </div>
              </div>
              <p className="source-takeaway">{takeaway}</p>
              <a className="source-link" href={href} target="_blank" rel="noreferrer">
                View original source
                <ExternalLink size={15} strokeWidth={2} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="security-section" id="security" aria-labelledby="security-title">
        <div className="security-copy">
          <p className="eyebrow">Security / trust</p>
          <h2 id="security-title">Institutional by design, not by decoration.</h2>
          <p>
            ReCater should read like campus infrastructure: specific, method-aware, plain about risk, and honest about what is estimated.
          </p>
        </div>
        <div className="trust-list">
          {trustItems.map(({ icon: Icon, title, copy }) => (
            <article className="trust-item shadcn-card" key={title}>
              <Icon size={24} strokeWidth={1.9} />
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="student-section" id="students" aria-labelledby="students-title">
        <div className="student-images" aria-hidden="true">
          {foodImages.slice(0, 4).map((image) => (
            <img src={image} alt="" key={image} />
          ))}
        </div>
        <div className="student-copy">
          <p className="eyebrow">For students</p>
          <h2 id="students-title">
            Free food should feel <span className="display-accent">immediate</span>.
          </h2>
          <p>
            The student layer stays direct: what food, where it is, how much time is left, and what point reward makes participation feel worth repeating.
          </p>
          <div className="pickup-card shadcn-card">
            <Sparkles size={22} strokeWidth={1.9} />
            <div>
              <strong>Free food on campus, right now.</strong>
              <p>Grab it, earn points, keep good food moving.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section" aria-labelledby="brand-title">
        <div className="brand-mark-card">
          <img src="/assets/recater-logo.svg" alt="ReCater turtle cloche logo" />
        </div>
        <div className="brand-copy">
          <p className="eyebrow">Brand motif</p>
          <h2 id="brand-title">The turtle-cloche mark gets a real job.</h2>
          <p>
            The cloche shape becomes the site’s recurring visual container: hero image, status badges, impact cards, and gentle page transitions. Stylish appears in short warm accents; Outfit carries the work.
          </p>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-cta-title">
        <img src="/assets/recater-logo.svg" alt="" aria-hidden="true" />
        <p className="eyebrow">ReCater</p>
        <div className="handwritten-cta" aria-hidden="true">
          <HandWrittenTitle title="Get connected" subtitle="" />
        </div>
        <h2 id="final-cta-title">
          Rescue the food. <span className="display-accent">Report</span> the impact.
        </h2>
        <a className="button button-primary" href="/contact" onClick={(event) => {
          event.preventDefault();
          navigate('contact');
        }}>
          Bring ReCater to your campus
          <ArrowUpRight size={19} strokeWidth={2.2} />
        </a>
      </section>

      <footer className="footer">
        <img src="/assets/recater-logo.svg" alt="ReCater" />
        <p>Surplus food recovery for campuses that need student energy and reportable data.</p>
      </footer>
    </>
  );
}

function ContactPage() {
  const isThankYou = window.location.pathname === '/thanks';

  return (
    <section className="contact-page" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="eyebrow">Contact ReCater</p>
        {isThankYou ? (
          <>
            <h1 id="contact-title">Thanks for reaching out.</h1>
            <p>Your message has been sent to the ReCater team.</p>
          </>
        ) : (
          <>
            <h1 id="contact-title">
              Bring surplus food recovery to your <span className="display-accent">campus</span>.
            </h1>
            <p>Send a note to the ReCater team and we will follow up soon.</p>
          </>
        )}
      </div>

      {isThankYou ? (
        <div className="contact-confirmation shadcn-card">
          <img src="/assets/recater-logo.svg" alt="" aria-hidden="true" />
          <a href="/">Back to home</a>
        </div>
      ) : (
        <form className="contact-form shadcn-card" action="/api/contact" method="post">
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="honeypot" />
          <label>
            Name
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Campus or organization
            <input name="organization" type="text" autoComplete="organization" />
          </label>
          <label>
            Message
            <textarea name="message" rows={6} required />
          </label>
          <button type="submit">
            <Send size={18} strokeWidth={2.2} />
            Submit
          </button>
        </form>
      )}
    </section>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
