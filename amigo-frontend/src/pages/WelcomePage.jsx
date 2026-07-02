<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/WelcomePage.css';
import Footer from '../components/Footer.jsx';
import { FaVideo, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const WelcomePage = () => {
  const [displayedText, setDisplayedText] = useState({ line1: '', line2: '' });
  
  const text1 = "Premium Video Meetings";
  const text2 = "Built for Business.";

  useEffect(() => {
    let animationInterval;
    let resetTimeout;
    let phase = 'typing1'; // phases: typing1 -> typing2 -> waiting -> reset
    let index = 0;

    const tick = () => {
      if (phase === 'typing1') {
        // Type Line 1
        if (index <= text1.length) {
          setDisplayedText(prev => ({ ...prev, line1: text1.substring(0, index) }));
          index++;
        } else {
          // Switch to Line 2
          phase = 'typing2';
          index = 0; 
        }
      } else if (phase === 'typing2') {
        // Type Line 2
        if (index <= text2.length) {
          setDisplayedText(prev => ({ ...prev, line2: text2.substring(0, index) }));
          index++;
        } else {
          // Done typing, start wait timer
          phase = 'waiting';
          clearInterval(animationInterval);
          resetTimeout = setTimeout(() => {
            // Reset and restart
            setDisplayedText({ line1: '', line2: '' });
            phase = 'typing1';
            index = 0;
            animationInterval = setInterval(tick, 50);
          }, 4000); // Wait 4 seconds
        }
      }
    };

    // Start the loop
    animationInterval = setInterval(tick, 50);

    // Cleanup
    return () => {
      clearInterval(animationInterval);
      clearTimeout(resetTimeout);
    };
  }, []);

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-emoji">🤝</span> Amigo
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/auth" className="btn-login">Log In</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          {/* <div className="badge">New v2.0 is live</div> */}
          
          {/* Fixed height container to prevent jumping */}
          <div className="title-container">
            <h1 className="hero-title">
              {displayedText.line1}<br />
              <span className="highlight-text">
                {displayedText.line2}
              </span>
              <span className="cursor">|</span>
            </h1>
          </div>

          <p className="hero-subtitle">
            Amigo provides crystal-clear video conferencing with zero lag. 
            Secure, reliable, and designed for teams that need to get work done.
          </p>
          
          <div className="cta-group">
            <Link to="/auth">
              <button className="btn-primary">Get Started Free</button>
            </Link>
            <button className="btn-outline">View Demo</button>
=======
/**
 * WelcomePage — fully rebuilt in Tailwind CSS (Calm & Collaborative theme)
 * Removes dependency on WelcomePage.css dark overrides.
 *
 * FIX: bg was #0f172a (dark navy) from WelcomePage.css — now bg-hero (warm beige/sage)
 * FIX: layout sizing — hero uses responsive padding, not hardcoded 8rem
 * FIX: mobile overflow — hero-section was not responsive
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate }          from 'react-router-dom';
import { FaVideo, FaShieldAlt, FaGlobe, FaUsers, FaCalendar, FaDesktop } from 'react-icons/fa';
import amigoLogo from '../assets/Amigo.png';

const FEATURES = [
  { icon: <FaVideo />,    label: 'HD Video' },
  { icon: <FaUsers />,    label: 'Team Spaces' },
  { icon: <FaDesktop />,  label: 'Screen Share' },
  { icon: <FaCalendar />, label: 'Scheduling' },
];

const useTypewriter = (lines, speed = 50, pause = 4000) => {
  const [texts, setTexts]   = useState(lines.map(() => ''));
  const [phase, setPhase]   = useState({ line: 0, char: 0, waiting: false });

  useEffect(() => {
    if (phase.waiting) {
      const t = setTimeout(() => {
        setTexts(lines.map(() => ''));
        setPhase({ line: 0, char: 0, waiting: false });
      }, pause);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      const { line, char } = phase;
      const target = lines[line];
      if (char <= target.length) {
        setTexts(prev => {
          const next = [...prev];
          next[line] = target.substring(0, char);
          return next;
        });
        if (char === target.length && line === lines.length - 1) {
          setPhase(p => ({ ...p, waiting: true }));
        } else if (char === target.length) {
          setPhase({ line: line + 1, char: 0, waiting: false });
        } else {
          setPhase(p => ({ ...p, char: p.char + 1 }));
        }
      } else {
        setPhase(p => ({ ...p, char: p.char + 1 }));
      }
    }, speed);
    return () => clearTimeout(t);
  }, [phase, lines, speed, pause]);

  return texts;
};

const WelcomePage = () => {
  const navigate = useNavigate();
  const [t1, t2] = useTypewriter(['Your team\'s meeting space,', 'reimagined.']);

  return (
    <div className="min-h-screen bg-hero flex flex-col">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-beige-50/90 backdrop-blur border-b border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-display font-bold text-xl text-charcoal-900"
          >
            <img src={amigoLogo} alt="Amigo" className="h-8 w-auto object-contain" />
            <span>Amigo</span>
          </button>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-charcoal-600 hover:text-sage-600 transition-colors">
              Features
            </a>
            <a href="#pricing"  className="text-sm font-medium text-charcoal-600 hover:text-sage-600 transition-colors">
              Pricing
            </a>
            <Link to="/auth" className="btn-secondary text-sm px-4 py-2">
              Sign In
            </Link>
            <Link to="/auth" className="btn-primary text-sm px-4 py-2">
              Get Started Free
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link to="/auth" className="btn-primary text-sm px-4 py-2 md:hidden">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8
                       flex flex-col lg:flex-row items-center gap-12 py-16 lg:py-24">

        {/* Left — copy */}
        <div className="flex-1 flex flex-col items-start gap-6">
          {/* Tag */}
          <span className="badge-sage text-xs font-semibold tracking-wider uppercase px-3 py-1.5">
            🌿 Calm. Collaborative. Connected.
          </span>

          {/* Typewriter headline */}
          <div className="min-h-[7rem] flex flex-col justify-start">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-display font-extrabold text-charcoal-900 leading-tight">
              {t1 || '\u00a0'}
              <br />
              <span className="text-gradient-sage">{t2 || '\u00a0'}</span>
              <span className="inline-block w-0.5 h-10 bg-sage-400 ml-1 align-middle animate-pulse" />
            </h1>
>>>>>>> origin/dev
          </div>

          <p className="text-base text-charcoal-500 leading-relaxed max-w-lg">
            A distraction-free environment designed to reduce meeting fatigue and
            help your team do their best work.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(f => (
              <span key={f.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5
                           bg-beige-100 border border-beige-300 rounded-full
                           text-xs font-medium text-charcoal-600">
                <span className="text-sage-500">{f.icon}</span>{f.label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-2">
            <Link to="/auth" className="btn-primary px-6 py-3 text-sm">
              <FaVideo /> Get Started Free
            </Link>
            <button className="btn-secondary px-6 py-3 text-sm">
              View Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 text-xs text-charcoal-400 font-medium pt-2">
            <span className="flex items-center gap-1.5"><FaVideo className="text-sage-400" /> HD Quality</span>
            <span className="flex items-center gap-1.5"><FaShieldAlt className="text-sage-400" /> End-to-End Encrypted</span>
            <span className="flex items-center gap-1.5"><FaGlobe className="text-sage-400" /> Low Latency</span>
          </div>
        </div>

<<<<<<< HEAD
        <div className="hero-visual">
          <div className="visual-card">
            <div className="card-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
=======
        {/* Right — visual mockup */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md bg-beige-100 border border-beige-300 rounded-3xl
                          shadow-card-hover overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-beige-200 border-b border-beige-300">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-sage-400" />
              <span className="ml-4 text-xs text-charcoal-400 font-mono">amigo — team meeting</span>
>>>>>>> origin/dev
            </div>
            {/* Video grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {['sage-200', 'mint-200', 'beige-300', 'sage-300'].map((c, i) => (
                <div key={i}
                  className={`h-28 rounded-2xl bg-${c} animate-pulse flex items-center justify-center`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/60" />
                </div>
              ))}
            </div>
            {/* Control bar */}
            <div className="flex items-center justify-center gap-3 pb-4 px-4">
              {['bg-red-400', 'bg-sage-400', 'bg-mint-400', 'bg-beige-400'].map((c, i) => (
                <div key={i} className={`w-9 h-9 rounded-full ${c} opacity-80`} />
              ))}
            </div>
          </div>
        </div>
      </main>

<<<<<<< HEAD
      {/* Add Footer Here at the bottom */}
      <Footer />
=======
      {/* ── Features section ── */}
      <section id="features" className="bg-beige-100 border-t border-beige-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-charcoal-900">Everything your team needs</h2>
            <p className="text-charcoal-500 mt-2">Built for focus, designed for collaboration</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FaVideo />,    title: 'Crystal-Clear Video',  desc: 'HD quality with adaptive bitrate for any connection speed.' },
              { icon: <FaShieldAlt />,title: 'End-to-End Encrypted', desc: 'Every meeting is secured with enterprise-grade encryption.' },
              { icon: <FaUsers />,    title: 'Team Spaces',          desc: 'Persistent rooms for your team — always-on collaboration.' },
              { icon: <FaDesktop />,  title: 'Screen Sharing',       desc: 'Share your full screen or a single window in one click.' },
              { icon: <FaCalendar />, title: 'Smart Scheduling',     desc: 'Schedule meetings and send calendar invites automatically.' },
              { icon: <FaGlobe />,    title: 'Global Low Latency',   desc: 'Edge servers worldwide ensure < 100ms latency for all.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card-hover p-6">
                <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-600
                                flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-sm font-semibold text-charcoal-800 mb-1">{title}</h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-beige-50 border-t border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
                        flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-charcoal-400">
            &copy; 2026 Amigo. All rights reserved.
          </span>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="text-sm text-charcoal-400 hover:text-sage-600 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
>>>>>>> origin/dev
    </div>
  );
};

export default WelcomePage;
