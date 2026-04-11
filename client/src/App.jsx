import { useCallback, useEffect, useRef, useState } from "react";

const API = "/api/contact";

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const nameInputRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState({ type: "idle", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const closeNav = useCallback(() => {
    setNavOpen(false);
    document.body.style.overflow = "";
  }, []);

  const openNav = useCallback(() => {
    setNavOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    const onScroll = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    const nav = navRef.current;
    const links = nav?.querySelectorAll('a[href^="#"]') || [];
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    const onScroll = () => {
      const scrollPos = window.scrollY + (header?.offsetHeight || 80) + 40;
      let current = "";
      for (const section of sections) {
        if (scrollPos >= section.offsetTop) current = section.id;
      }
      links.forEach((a) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        a.classList.toggle("is-active", href === `#${current}`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll("[data-reveal]");
    if (reduce) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#contact") return;
    const t = window.setTimeout(() => {
      scrollToId("contact");
      nameInputRef.current?.focus();
    }, 300);
    return () => window.clearTimeout(t);
  }, []);

  const goContact = (e) => {
    e.preventDefault();
    closeNav();
    scrollToId("contact");
    window.setTimeout(() => nameInputRef.current?.focus(), 450);
  };

  const onNavLink = (e, id) => {
    e.preventDefault();
    closeNav();
    scrollToId(id);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: "idle", text: "" });
    setSubmitting(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormStatus({ type: "error", text: data.error || "Something went wrong. Try again later." });
        return;
      }
      setFormStatus({
        type: "success",
        text: "Message sent — check your inbox (and spam). I will reply soon.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch {
      setFormStatus({
        type: "error",
        text: "Network error. Is the server running? From project root run: npm run dev",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      <header ref={headerRef} className={`site-header${navOpen ? " nav-open" : ""}`}>
        <a href="#top" className="logo" onClick={(e) => onNavLink(e, "top")}>
          AM
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          onClick={() => (navOpen ? closeNav() : openNav())}
        >
          <span />
          <span />
          <span />
        </button>
        <nav ref={navRef} className={`site-nav${navOpen ? " is-open" : ""}`} aria-label="Primary">
          <a href="#about" onClick={(e) => onNavLink(e, "about")}>
            About
          </a>
          <a href="#skills" onClick={(e) => onNavLink(e, "skills")}>
            Skills
          </a>
          <a href="#experience" onClick={(e) => onNavLink(e, "experience")}>
            Experience
          </a>
          <a href="#projects" onClick={(e) => onNavLink(e, "projects")}>
            Projects
          </a>
          <a href="#education" onClick={(e) => onNavLink(e, "education")}>
            Education
          </a>
          <a href="#contact" className="nav-cta" onClick={(e) => onNavLink(e, "contact")}>
            Contact
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <p className="hero-eyebrow reveal" data-reveal>
            Full Stack Developer
          </p>
          <h1 className="hero-title reveal" data-reveal>
            <span className="name">Ansuman</span>
            <span className="name-accent">Mohapatra</span>
          </h1>
          <p className="hero-tagline reveal" data-reveal>
            MERN stack · Scalable web apps · AI-driven features
          </p>
          <div className="hero-actions reveal" data-reveal>
            <a href="#projects" className="btn btn-primary" onClick={(e) => onNavLink(e, "projects")}>
              View work <span className="btn-icon" aria-hidden="true">→</span>
            </a>
            <a href="#contact" className="btn btn-ghost" onClick={goContact}>
              Send a message <span className="btn-icon" aria-hidden="true">✉</span>
            </a>
          </div>
          <div className="hero-meta reveal" data-reveal>
            <span>Bhubaneswar</span>
            <span className="dot">·</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span className="dot">·</span>
            <a href="#projects" onClick={(e) => onNavLink(e, "projects")}>
              Selected work
            </a>
          </div>
          <a href="#about" className="scroll-hint" aria-label="Scroll to about" onClick={(e) => onNavLink(e, "about")}>
            <span className="scroll-line" />
          </a>
        </section>

        <section id="about" className="section about">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">01</span>
              <h2>Professional summary</h2>
            </header>
            <div className="about-grid">
              <p className="lead reveal" data-reveal>
                Full Stack Developer (<strong>MERN</strong>) with hands-on experience building scalable web applications
                and integrating AI-driven features. Strong in React.js, Node.js, and MongoDB — from responsive UI to
                REST APIs and real-time systems.
              </p>
              <ul className="highlights reveal" data-reveal>
                <li>Responsive interfaces & performance</li>
                <li>RESTful API design & integration</li>
                <li>Authentication & session management</li>
                <li>Agile collaboration</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="skills" className="section skills">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">02</span>
              <h2>Technical skills</h2>
            </header>
            <div className="skill-groups">
              <article className="skill-card reveal" data-reveal>
                <h3>Frontend</h3>
                <div className="tags">
                  <span>React.js</span>
                  <span>HTML5</span>
                  <span>CSS3</span>
                  <span>JavaScript</span>
                </div>
              </article>
              <article className="skill-card reveal" data-reveal>
                <h3>Backend</h3>
                <div className="tags">
                  <span>Node.js</span>
                  <span>Express.js</span>
                </div>
              </article>
              <article className="skill-card reveal" data-reveal>
                <h3>Data</h3>
                <div className="tags">
                  <span>MongoDB</span>
                  <span>MySQL</span>
                </div>
              </article>
              <article className="skill-card reveal" data-reveal>
                <h3>Tools & more</h3>
                <div className="tags">
                  <span>Git</span>
                  <span>Postman</span>
                  <span>REST APIs</span>
                  <span>Responsive design</span>
                  <span>AI integration</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="experience" className="section experience">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">03</span>
              <h2>Work experience</h2>
            </header>
            <ol className="timeline">
              <li className="timeline-item reveal" data-reveal>
                <div className="timeline-marker" />
                <div className="timeline-body">
                  <div className="timeline-top">
                    <h3>Full Stack Developer Intern</h3>
                    <time dateTime="2026-01">Jan 2026 – Mar 2026</time>
                  </div>
                  <p className="company">
                    Elevance Skills <span className="badge">Virtual</span>
                  </p>
                  <ul>
                    <li>Developed and maintained full-stack web applications using the MERN stack</li>
                    <li>Designed RESTful APIs for seamless frontend–backend communication</li>
                    <li>Improved UI responsiveness and performance across devices</li>
                  </ul>
                </div>
              </li>
              <li className="timeline-item reveal" data-reveal>
                <div className="timeline-marker" />
                <div className="timeline-body">
                  <div className="timeline-top">
                    <h3>MERN Stack Developer Intern</h3>
                    <time dateTime="2025-07">Jul 2025 – Aug 2025</time>
                  </div>
                  <p className="company">
                    Codebeat <span className="badge">Virtual</span>
                  </p>
                  <ul>
                    <li>Built dynamic web applications using React.js and Node.js</li>
                    <li>Implemented authentication and user session management</li>
                    <li>Collaborated in an agile team environment</li>
                  </ul>
                </div>
              </li>
              <li className="timeline-item reveal" data-reveal>
                <div className="timeline-marker" />
                <div className="timeline-body">
                  <div className="timeline-top">
                    <h3>MERN Stack Developer Intern</h3>
                    <time dateTime="2024-07">Jul 2024 – Aug 2024</time>
                  </div>
                  <p className="company">
                    Codebeat <span className="badge">Virtual</span>
                  </p>
                  <ul>
                    <li>Same role continuity — MERN development and team delivery</li>
                  </ul>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section id="projects" className="section projects">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">04</span>
              <h2>Selected projects</h2>
            </header>
            <div className="project-grid">
              <article className="project-card reveal" data-reveal>
                <div className="project-card-inner">
                  <span className="project-icon" aria-hidden="true">
                    ◆
                  </span>
                  <h3>AI Resume Analyzer</h3>
                  <p className="stack">MERN + AI</p>
                  <p>Full-stack AI-powered resume analysis — parsing, skill extraction, and candidate scoring with a responsive UI.</p>
                </div>
              </article>
              <article className="project-card reveal" data-reveal>
                <div className="project-card-inner">
                  <span className="project-icon" aria-hidden="true">
                    ◆
                  </span>
                  <h3>DocNow</h3>
                  <p className="stack">Healthcare web app</p>
                  <p>Medical assistance platform: symptom analysis, doctor booking, dashboards, and backend services.</p>
                </div>
              </article>
              <article className="project-card reveal" data-reveal>
                <div className="project-card-inner">
                  <span className="project-icon" aria-hidden="true">
                    ◆
                  </span>
                  <h3>KFC Clone</h3>
                  <p className="stack">MERN</p>
                  <p>Responsive multi-page experience with cart flow and user authentication.</p>
                </div>
              </article>
              <article className="project-card reveal" data-reveal>
                <div className="project-card-inner">
                  <span className="project-icon" aria-hidden="true">
                    ◆
                  </span>
                  <h3>GlideOn</h3>
                  <p className="stack">Prototype</p>
                  <p>Eco-friendly commute platform prototype built with HTML, CSS, and JavaScript.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="education" className="section education">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">05</span>
              <h2>Education & certifications</h2>
            </header>
            <div className="edu-grid">
              <article className="edu-card reveal" data-reveal>
                <h3>B.Tech, Computer Science & Engineering</h3>
                <p>Silicon Institute of Technology, Bhubaneswar</p>
                <time dateTime="2023/2027">2023 – 2027</time>
              </article>
              <article className="edu-card reveal" data-reveal>
                <h3>Class XII (Science)</h3>
                <p>
                  CHSE Odisha — <strong>84.13%</strong>
                </p>
                <time dateTime="2023">2023</time>
              </article>
              <article className="edu-card reveal" data-reveal>
                <h3>Class X</h3>
                <p>
                  BSE Odisha — <strong>91.50%</strong>
                </p>
                <time dateTime="2021">2021</time>
              </article>
              <article className="edu-card cert reveal" data-reveal>
                <h3>Certification</h3>
                <p>MERN Stack Development — Beat Code (2024)</p>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="section-inner contact-inner">
            <header className="section-head">
              <span className="section-label">06</span>
              <h2>Let’s build something</h2>
            </header>
            <p className="contact-lead reveal" data-reveal>
              Open to internships and full-stack roles. Send a message below — it goes straight to my inbox. You can also use
              email or phone.
            </p>

            <div className="contact-form-wrap reveal" data-reveal>
              <form className="contact-form" onSubmit={onSubmit} noValidate>
                <h3>Send a query</h3>
                {formStatus.type === "success" && <p className="form-status success">{formStatus.text}</p>}
                {formStatus.type === "error" && <p className="form-status error">{formStatus.text}</p>}
                <div className="form-row">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    ref={nameInputRef}
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="contact-message">Your query</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={8000}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell me about your project, role, or question…"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Send message"} {!submitting && <span className="btn-icon">→</span>}
                </button>
              </form>
            </div>

            <div className="contact-actions reveal" data-reveal>
              <a className="contact-link" href="mailto:mohapatraansuman34@gmail.com">
                <span className="contact-link-label">Email</span>
                <span className="contact-link-value">mohapatraansuman34@gmail.com</span>
              </a>
              <a className="contact-link" href="tel:+917894559501">
                <span className="contact-link-label">Phone</span>
                <span className="contact-link-value">+91 78945 59501</span>
              </a>
              <a className="contact-link" href="https://github.com" target="_blank" rel="noopener noreferrer">
                <span className="contact-link-label">GitHub</span>
                <span className="contact-link-value">Open profile →</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Ansuman Mohapatra. Crafted with care.</p>
      </footer>
    </>
  );
}
