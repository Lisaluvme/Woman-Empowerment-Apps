import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  MapPin,
  AlertCircle,
  Users,
  Clock,
  Star,
  Check,
  ArrowRight,
  Play,
  Download,
  Lock,
  Eye,
  Heart,
  Zap,
  Smartphone,
  Navigation,
  Bell,
  CheckCircle
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="brand-icon" />
            <span className="brand-text">HER SAFE</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <button onClick={handleGetStarted} className="nav-cta">
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star className="badge-icon" />
              <span>Trusted by 1,000+ women</span>
            </div>
            <h1 className="hero-title">
              Stay Safe.<br />
              <span className="gradient-text">Travel Smart.</span>
            </h1>
            <p className="hero-subtitle">
              Real-time tracking, instant SOS, and ride monitoring designed for women.
              Your personal safety companion for every journey.
            </p>
            <div className="hero-ctas">
              <button onClick={handleGetStarted} className="cta-primary">
                <Download size={20} />
                Download App
              </button>
              <button className="cta-secondary">
                <Play size={20} />
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">50K+</div>
                <div className="stat-label">Safe Journeys</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <div className="stat-value">4.9★</div>
                <div className="stat-label">App Rating</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Monitoring</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-header">
                  <Shield className="app-logo" />
                  <span>HER SAFE</span>
                </div>
                <div className="app-status">
                  <div className="status-indicator active"></div>
                  <span>Journey Active</span>
                </div>
                <div className="app-map">
                  <div className="map-marker"></div>
                  <div className="map-route"></div>
                </div>
                <div className="app-sos">
                  <button className="sos-button">SOS</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="social-proof">
        <div className="proof-container">
          <div className="proof-text">
            <Users className="proof-icon" />
            <span>Join 1,000+ women who travel safer every day</span>
          </div>
          <div className="proof-avatars">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="avatar" style={{left: `${(i - 1) * 24}px`}}>
                <div className="avatar-placeholder">{i}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">
              Safety Features That<br />
              <span className="gradient-text">Actually Work</span>
            </h2>
            <p className="section-subtitle">
              Built by women, for women. Every feature designed with real safety scenarios in mind.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: MapPin,
                title: "Live Ride Tracking",
                description: "Your family knows you're safe — always. Share your location in real-time during every ride.",
                color: "purple",
                benefit: "Peace of mind for you and your loved ones"
              },
              {
                icon: AlertCircle,
                title: "One-Tap SOS Alert",
                description: "Instant emergency alerts sent to your contacts with your exact location — no fumbling needed.",
                color: "rose",
                benefit: "Help is just one tap away, always"
              },
              {
                icon: Users,
                title: "Trusted Contacts Circle",
                description: "Only people you trust can see your journey. Add up to 5 emergency contacts instantly.",
                color: "blue",
                benefit: "Your safety network, your rules"
              },
              {
                icon: Bell,
                title: "Smart Safety Check-ins",
                description: "We automatically check in if something feels wrong. No ride? Strange route? We've got you.",
                color: "amber",
                benefit: "Proactive protection, not just tracking"
              },
              {
                icon: Lock,
                title: "End-to-End Encrypted",
                description: "Your location data is encrypted and never shared publicly. Period.",
                color: "emerald",
                benefit: "Your privacy is non-negotiable"
              },
              {
                icon: Zap,
                title: "AI Route Monitoring",
                description: "Our AI detects unusual routes or prolonged stops and alerts your contacts automatically.",
                color: "violet",
                benefit: "Smart safety that thinks ahead"
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className={`feature-icon feature-${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-benefit">
                  <CheckCircle size={16} />
                  <span>{feature.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="hiw-container">
          <div className="section-header">
            <h2 className="section-title">
              How It Works
            </h2>
            <p className="section-subtitle">
              Three simple steps to travel with confidence
            </p>
          </div>

          <div className="steps">
            {[
              {
                step: "01",
                icon: Smartphone,
                title: "Start Your Trip",
                description: "Open the app and tap 'Start Journey' before you begin your ride or walk."
              },
              {
                step: "02",
                icon: Users,
                title: "Share with Contacts",
                description: "Select your trusted contacts. They'll receive your live location and ETA."
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Arrive Safely",
                description: "We monitor your journey. You tap 'I'm Safe' when you arrive, or we alert your contacts."
              }
            ].map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">
                  <step.icon size={32} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < 2 && <ArrowRight className="step-arrow" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HER SAFE */}
      <section className="why-her-safe">
        <div className="whs-container">
          <div className="whs-content">
            <h2 className="whs-title">
              Why Women Choose<br />
              <span className="gradient-text">HER SAFE</span>
            </h2>
            <div className="whs-points">
              {[
                {
                  icon: Heart,
                  title: "Built for Women",
                  description: "Every feature designed by women who understand real safety concerns."
                },
                {
                  icon: Shield,
                  title: "Proactive Safety",
                  description: "We don't just track — we actively monitor and alert when something's wrong."
                },
                {
                  icon: Zap,
                  title: "Fast & Reliable",
                  description: "One tap is all it takes. No complicated setup, no confusion in emergencies."
                }
              ].map((point, index) => (
                <div key={index} className="whs-point">
                  <div className="whs-point-icon">
                    <point.icon size={24} />
                  </div>
                  <div>
                    <h4 className="whs-point-title">{point.title}</h4>
                    <p className="whs-point-description">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="whs-visual">
            <div className="safety-badges">
              <div className="badge">
                <Lock size={32} />
                <span>256-bit Encryption</span>
              </div>
              <div className="badge">
                <Eye size={32} />
                <span>No Public Tracking</span>
              </div>
              <div className="badge">
                <Shield size={32} />
                <span>SOS Under 1 Second</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="pricing-container">
          <div className="section-header">
            <h2 className="section-title">
              Simple, Transparent<br />
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="section-subtitle">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="pricing-cards">
            <div className="pricing-card pricing-free">
              <div className="pricing-header">
                <h3>Free</h3>
                <div className="pricing-price">
                  <span className="price">RM0</span>
                  <span className="period">/month</span>
                </div>
                <p className="pricing-description">Perfect for getting started</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} /> Basic live tracking</li>
                <li><Check size={18} /> 1 emergency contact</li>
                <li><Check size={18} /> Manual SOS alerts</li>
                <li><Check size={18} /> Journey history (7 days)</li>
              </ul>
              <button onClick={handleGetStarted} className="pricing-cta">
                Get Started Free
              </button>
            </div>

            <div className="pricing-card pricing-premium">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Premium</h3>
                <div className="pricing-price">
                  <span className="price">RM9</span>
                  <span className="period">/month</span>
                </div>
                <p className="pricing-description">Complete peace of mind</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={18} /> Everything in Free</li>
                <li><Check size={18} /> Unlimited emergency contacts</li>
                <li><Check size={18} /> AI-powered route monitoring</li>
                <li><Check size={18} /> Automatic safety check-ins</li>
                <li><Check size={18} /> Priority SOS (faster response)</li>
                <li><Check size={18} /> Ride integration (Grab/Uber)</li>
                <li><Check size={18} /> Unlimited journey history</li>
                <li><Check size={18} /> 24/7 priority support</li>
              </ul>
              <button onClick={handleGetStarted} className="pricing-cta pricing-cta-primary">
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">
              What Women Say
            </h2>
            <p className="section-subtitle">
              Real stories from real users
            </p>
          </div>

          <div className="testimonials-grid">
            {[
              {
                name: "Sarah L.",
                role: "Marketing Executive",
                text: "I travel late from work often. HER SAFE gives my mom peace of mind — she can see when I reach home safely. The one-tap SOS is genius!",
                rating: 5
              },
              {
                name: "Aisha M.",
                role: "University Student",
                text: "As a student taking Grab late at night, this app is a lifesaver. My best friend gets notified if my ride takes an unexpected route.",
                rating: 5
              },
              {
                name: "Jenny T.",
                role: "Sales Representative",
                text: "I meet clients all over Klang Valley. The AI route monitoring once alerted my husband when I was stuck in traffic for 30 minutes. Brilliant!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust">
        <div className="trust-container">
          <div className="trust-content">
            <h2 className="trust-title">
              Your Privacy is<br />
              <span className="gradient-text">Non-Negotiable</span>
            </h2>
            <p className="trust-description">
              We take your security seriously. Your location data is encrypted,
              never shared publicly, and only visible to your chosen trusted contacts.
            </p>
          </div>
          <div className="trust-badges">
            <div className="trust-badge">
              <Lock size={24} />
              <span>AES-256 Encryption</span>
            </div>
            <div className="trust-badge">
              <Eye size={24} />
              <span>No Data Selling</span>
            </div>
            <div className="trust-badge">
              <Shield size={24} />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-container">
          <div className="cta-content">
            <Heart className="cta-icon" />
            <h2 className="cta-title">
              Your Safety Should<br />
              Never Be a Question.
            </h2>
            <p className="cta-description">
              Join thousands of women who travel with confidence every day.
            </p>
            <button onClick={handleGetStarted} className="cta-button">
              <Download size={20} />
              Download Now — It's Free
            </button>
            <p className="cta-note">Available on iOS and Android</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Shield className="footer-logo" />
            <span className="footer-name">HER SAFE</span>
            <p className="footer-tagline">Stay safe. Be connected.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#how-it-works">How It Works</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
              <a href="#">Facebook</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 HER SAFE. All rights reserved.</p>
            <p>Made with ❤️ for women's safety</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
