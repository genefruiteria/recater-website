import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  Handshake,
  Leaf,
  Send,
  ShoppingBag,
  Trophy,
  Zap,
} from 'lucide-react';
import './styles.css';

const heroImages = [
  '/assets/campus-food-1.png',
  '/assets/campus-food-2.png',
  '/assets/campus-food-3.png',
  '/assets/campus-food-4.png',
  '/assets/campus-food-5.png',
];

const features = [
  { label: 'Fully Legal', icon: ClipboardCheck },
  { label: 'Incentives', icon: Trophy },
  { label: 'Sustainable', icon: Leaf },
  { label: 'Transparent Data', icon: BarChart3 },
  { label: 'Collaborative', icon: Handshake },
  { label: 'Fresh Food', icon: ShoppingBag },
  { label: 'Quick Setup', icon: Zap },
  { label: 'Impact Reports', icon: ClipboardCheck },
];

function getInitialPage() {
  return window.location.pathname === '/contact' || window.location.pathname === '/thanks' ? 'contact' : 'home';
}

function App() {
  const [activeImage, setActiveImage] = useState(0);
  const [page, setPage] = useState<'home' | 'contact'>(getInitialPage);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handlePopState() {
      setPage(getInitialPage());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function stepCarousel(direction: -1 | 1) {
    setActiveImage((current) => {
      const next = current + direction;
      if (next < 0) return heroImages.length - 1;
      return next % heroImages.length;
    });
  }

  function navigate(nextPage: 'home' | 'contact') {
    const path = nextPage === 'contact' ? '/contact' : '/';
    window.history.pushState({}, '', path);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="Site header">
        <a className="brand" href="/" aria-label="ReCater home" onClick={(event) => {
          event.preventDefault();
          navigate('home');
        }}>
          Recater<span aria-hidden="true">®</span>
        </a>
        <a className="contact-link" href="/contact" onClick={(event) => {
          event.preventDefault();
          navigate('contact');
        }}>
          <span>Contact</span>
          <ArrowUpRight size={18} strokeWidth={2.2} />
        </a>
      </header>

      {page === 'contact' ? (
        <ContactPage />
      ) : (
        <HomePage
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          stepCarousel={stepCarousel}
        />
      )}
    </main>
  );
}

function HomePage({
  activeImage,
  setActiveImage,
  stepCarousel,
}: {
  activeImage: number;
  setActiveImage: (index: number) => void;
  stepCarousel: (direction: -1 | 1) => void;
}) {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">
          <span className="hero-main">
            <span>Surplus Food,</span>
            <span>Solved.</span>
          </span>
          <strong>
            <span>Hunger relief and</span>
            <span>sustainability, together.</span>
          </strong>
        </h1>

        <div className="carousel" aria-label="Campus food sharing photos">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${activeImage * 100}%)` }}
          >
            {heroImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={index === activeImage ? 'Students sharing catered food on campus' : ''}
                aria-hidden={index === activeImage ? undefined : true}
              />
            ))}
          </div>
          <button className="carousel-btn previous" type="button" onClick={() => stepCarousel(-1)} aria-label="Previous photo">
            ‹
          </button>
          <button className="carousel-btn next" type="button" onClick={() => stepCarousel(1)} aria-label="Next photo">
            ›
          </button>
          <div className="carousel-dots" aria-label="Photo selector">
            {heroImages.map((image, index) => (
              <button
                key={image}
                className={index === activeImage ? 'active' : ''}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Show photo ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="intro-band" aria-labelledby="intro-title">
        <div className="intro-copy">
          <h2 id="intro-title">
            Recater helps colleges <span>share surplus food legally and efficiently.</span>
          </h2>
          <p>Track impact, incentivize action, and cut emissions, all in one platform.</p>
        </div>
        <img className="brand-mark" src="/assets/recater-mark.png" alt="" aria-hidden="true" />
      </section>

      <section className="story-grid" aria-label="What ReCater handles">
        <article className="story-row">
          <div className="story-copy">
            <h2>Legal compliance baked in.</h2>
            <p>Seamlessly navigate food surplus laws and ensure every transfer is documented and compliant with campus and local policies.</p>
          </div>
          <div className="asset-cluster legal-assets" aria-hidden="true">
            <img className="doctor-asset" src="/assets/doctor.png" alt="" />
            <img className="law-asset" src="/assets/originals/law-firm.svg" alt="" />
          </div>
        </article>

        <article className="story-row reversed">
          <div className="asset-cluster post-assets" aria-hidden="true">
            <img className="new-post-asset" src="/assets/originals/new-post.svg" alt="" />
          </div>
          <div className="story-copy narrow">
            <h2>Earn incentives, make impact.</h2>
            <p>Participants get rewards for sharing food and boosting campus engagement, tackling both hunger and waste.</p>
          </div>
        </article>

        <article className="story-row">
          <div className="story-copy">
            <h2>Measure & report results.</h2>
            <p>Automatic emissions tracking and in-depth impact reports empower administration to see real change.</p>
          </div>
          <div className="asset-cluster earth-assets" aria-hidden="true">
            <img className="plant-asset" src="/assets/originals/grow-plant.svg" alt="" />
            <img className="globe-asset" src="/assets/originals/earth-globe.svg" alt="" />
          </div>
        </article>
      </section>

      <section className="feature-grid" aria-label="ReCater features">
        {features.map(({ label, icon: Icon }) => (
          <div className="feature" key={label}>
            <Icon size={38} strokeWidth={1.7} />
            <h3>{label}</h3>
          </div>
        ))}
      </section>

      <footer className="footer">
        <img src="/assets/recater-mark.png" alt="ReCater" />
      </footer>
    </>
  );
}

function ContactPage() {
  const origin = window.location.origin;
  const isThankYou = window.location.pathname === '/thanks';

  return (
    <section className="contact-page" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="eyebrow">Contact ReCater</p>
        {isThankYou ? (
          <>
            <h1 id="contact-title">Thanks for reaching out.</h1>
            <p>Your message has been sent to Genesis Richards.</p>
          </>
        ) : (
          <>
            <h1 id="contact-title">Bring surplus food recovery to your campus.</h1>
            <p>
              Send a note to the ReCater team and it will be addressed to Genesis Richards.
            </p>
          </>
        )}
      </div>

      {isThankYou ? (
        <div className="contact-confirmation">
          <img src="/assets/recater-mark.png" alt="" aria-hidden="true" />
          <a href="/">Back to home</a>
        </div>
      ) : (
        <form
          className="contact-form"
          action="https://formsubmit.co/genesis.richards@getrecater.com"
          method="post"
        >
          <input type="hidden" name="_subject" value="New ReCater website inquiry" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_next" value={`${origin}/thanks`} />
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
