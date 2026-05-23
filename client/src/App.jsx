import { useCallback, useEffect, useRef, useState } from "react";
import SEOHelmet from './components/SEOHelmet';
import emailjs from "@emailjs/browser";
import { WeaveSpinner } from "@/components/ui/weave-spinner";

const THEMES = ["gold-noir", "ocean-glow", "sunset-ember", "forest-mint", "violet-neon"];

function getThemeLabel(theme) {
  switch (theme) {
    case "gold-noir":
      return "Gold Noir";
    case "ocean-glow":
      return "Ocean Glow";
    case "sunset-ember":
      return "Sunset Ember";
    case "forest-mint":
      return "Forest Mint";
    case "violet-neon":
      return "Violet Neon";
    default:
      return theme;
  }
}
const DOODLE_COUNT = 5;

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_0reoan9";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_qguj85h";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
/** Inbox that receives form submissions — must match EmailJS template “To” if it uses {{to_email}} */
const CONTACT_INBOX = (import.meta.env.VITE_CONTACT_EMAIL || "").trim();

function getInitialTheme() {
  if (typeof window === "undefined") return THEMES[0];
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

if (typeof window !== "undefined") {
  document.documentElement.setAttribute("data-theme", getInitialTheme());
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const nameInputRef = useRef(null);
  const dollsRef = useRef(null);
  const pageLoadTimeoutRef = useRef(null);
  const pageTransitionTimeoutRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState({ type: "idle", text: "" });
  const [submitting, setSubmitting] = useState(false);
  // theme doodles removed — themes are controlled via navbar
  const [doodleThemes] = useState(() =>
    Array.from({ length: DOODLE_COUNT }, (_, index) => index % THEMES.length)
  );

  const [themesOpen, setThemesOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);


  useEffect(() => {
    let finished = false;
    const startedAt = Date.now();
    const minimumLoaderMs = 900;

    const completeLoading = () => {
      if (finished) return;
      finished = true;
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minimumLoaderMs - elapsed);
      pageLoadTimeoutRef.current = window.setTimeout(() => {
        setIsPageLoading(false);
      }, remaining);
    };

    if (document.readyState === "complete") {
      completeLoading();
    } else {
      window.addEventListener("load", completeLoading, { once: true });
    }

    const fallbackTimeout = window.setTimeout(completeLoading, 2600);

    return () => {
      window.removeEventListener("load", completeLoading);
      window.clearTimeout(fallbackTimeout);
      if (pageLoadTimeoutRef.current) {
        window.clearTimeout(pageLoadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPageLoading) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPageLoading]);

  useEffect(() => {
    return () => {
      if (pageTransitionTimeoutRef.current) {
        window.clearTimeout(pageTransitionTimeoutRef.current);
      }
      document.body.classList.remove("is-page-vanishing");
    };
  }, []);

  const projects = [
    {
      title: "YourTube - Video Streaming Platform",
      stack: "Next.js · React · TypeScript · Express.js · MongoDB",
      summary:
        "YouTube-like full-stack video streaming with authentication, uploads, subscriptions, likes, comments, watch history, and downloadable videos.",
      details:
        "Built a YouTube-inspired platform using Next.js, React, TypeScript, Tailwind CSS, Express.js, and MongoDB. Implemented user authentication, video uploads (Multer + MP4 streaming), subscriptions, likes/comments, watch history, and premium/free download logic. Created REST APIs with JWT auth and MongoDB schema design.",
      github: "#",
    },
    {
      title: "AI Resume Analyzer",
      stack: "MERN Stack · AI Integration",
      summary:
        "AI-powered resume screening with resume upload, parsing, skill extraction, and candidate scoring.",
      details:
        "Developed an AI-driven resume screening application using the MERN stack. Features include resume upload, parsing, skill extraction, and candidate scoring. Designed a responsive UI and optimized backend performance, integrating AI-based resume analysis workflows.",
      github: "#",
    },
    {
      title: "KFC Clone",
      stack: "React.js · Node.js · Express.js · MongoDB",
      summary:
        "KFC-inspired full-stack experience with authentication, cart functionality, and core ordering flows.",
      details:
        "Built a full-stack KFC-inspired web application using the MERN stack. Implemented user authentication, cart functionality, responsive UI, and core pages like home, menu, deals, sign-in, and checkout. Integrated frontend-backend workflows with MongoDB for dynamic data handling.",
      github: "#",
    },
  ];

  const closeNav = useCallback(() => {
    setNavOpen(false);
    setThemesOpen(false);
    document.body.style.overflow = "";
  }, []);



  const openProject = (project) => {
    setActiveProject(project);
    document.body.style.overflow = "hidden";
  };

  const closeProject = () => {
    setActiveProject(null);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    if (!activeProject) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProject]);

  const openNav = useCallback(() => {
    setNavOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const navThemesRef = useRef(null);


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

  useEffect(() => {
    const setLook = (x, y) => {
      const target = dollsRef.current;
      if (!target) return;
      const lookX = Math.max(-1, Math.min(1, x));
      const lookY = Math.max(-1, Math.min(1, y));
      target.style.setProperty("--look-x", lookX.toFixed(3));
      target.style.setProperty("--look-y", lookY.toFixed(3));
    };

    const onPointerMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setLook(x, y);
    };

    const onPointerLeave = () => setLook(0, 0);

    setLook(0, 0);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  const goContact = (e) => {
    e.preventDefault();
    closeNav();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      scrollToId("contact");
      window.setTimeout(() => nameInputRef.current?.focus(), 450);
      return;
    }
    document.body.classList.add("is-page-vanishing");
    if (pageTransitionTimeoutRef.current) {
      window.clearTimeout(pageTransitionTimeoutRef.current);
    }
    window.setTimeout(() => {
      scrollToId("contact");
      window.setTimeout(() => nameInputRef.current?.focus(), 450);
    }, 120);
    pageTransitionTimeoutRef.current = window.setTimeout(() => {
      document.body.classList.remove("is-page-vanishing");
    }, 340);
  };

  const onNavLink = (e, id) => {
    e.preventDefault();
    closeNav();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      scrollToId(id);
      return;
    }
    document.body.classList.add("is-page-vanishing");
    if (pageTransitionTimeoutRef.current) {
      window.clearTimeout(pageTransitionTimeoutRef.current);
    }
    window.setTimeout(() => {
      scrollToId(id);
    }, 120);
    pageTransitionTimeoutRef.current = window.setTimeout(() => {
      document.body.classList.remove("is-page-vanishing");
    }, 340);
  };

  useEffect(() => {
    const onDocPointerDown = (e) => {
      if (!themesOpen) return;
      const panel = navThemesRef.current;
      if (!panel) return;
      if (panel.contains(e.target)) return;
      setThemesOpen(false);
    };

    const onDocKeyDown = (e) => {
      if (e.key === "Escape") setThemesOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [themesOpen]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: "idle", text: "" });

    if (!EMAILJS_PUBLIC_KEY.trim()) {


      setFormStatus({
        type: "error",
        text: "Add VITE_EMAILJS_PUBLIC_KEY to client/.env (see client/.env.example), then restart Vite.",
      });
      return;
    }
    if (!CONTACT_INBOX) {
      setFormStatus({
        type: "error",
        text: "Add VITE_CONTACT_EMAIL (your Gmail) to client/.env so EmailJS knows where to deliver.",
      });
      return;
    }
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (name.length < 2) {
      setFormStatus({ type: "error", text: "Please enter your name." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (message.length < 10) {
      setFormStatus({ type: "error", text: "Please enter a message (at least 10 characters)." });
      return;
    }
    setSubmitting(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: CONTACT_INBOX,
          from_name: name,
          from_email: email,
          reply_to: email,
          message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY.trim() }
      );
      setFormStatus({
        type: "success",
        text: "Message sent. I will get back to you soon.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      const msg =
        err?.text || err?.message || "Could not send. Check EmailJS template fields and allowed origins.";
      setFormStatus({
        type: "error",
        text: typeof msg === "string" ? msg : "Something went wrong. Try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <>
      {isPageLoading && (
        <div
          className="page-loader"
          data-theme={currentTheme}
          role="status"
          aria-live="polite"
          aria-label="Page loading"
        >
          <div className="page-loader-inner">
            <WeaveSpinner size={220} />
            <p className="page-loader-text">Loading portfolio...</p>
          </div>
        </div>
      )}
      <div className={`app-shell${isPageLoading ? " is-loading" : ""}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Ansuman Mohapatra",
        "jobTitle": "Full Stack Developer",
        "description": "MERN Stack Developer from Bhubaneswar, India. Building scalable web apps.",
        "url": "https://ansuman-mohapatra-portfolio.vercel.app/",
        "email": "mohapatraansuman34@gmail.com",
        "telephone": "+91 78945 59501",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bhubaneswar",
          "addressRegion": "Odisha",
          "addressCountry": "IN"
        },
        "sameAs": [
          "https://github.com/ansuman34"
        ],
        "knowsAbout": ["MERN Stack", "React.js", "Node.js", "MongoDB", "AI"],
        "experience": [
          {
            "@type": "Role",
            "name": "Full Stack Developer Intern",
            "description": "MERN stack development"
          }
        ],
        "hasProject": [
          {
            "@type": "SoftwareApplication",
            "name": "AI Resume Analyzer",
            "url": "https://github.com/ansuman34/ai-resume-analyzer"
          }
        ]
      })}} />
<SEOHelmet />
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
          <a href="#resume" onClick={(e) => onNavLink(e, "resume")}>
            Resume
          </a>


          <div className="nav-themes" aria-label="Theme selector" ref={navThemesRef}>
            <button
              type="button"
              className="nav-themes-toggle"
              aria-haspopup="menu"
              aria-expanded={themesOpen}
              onClick={() => setThemesOpen((v) => !v)}
            >
              Themes: <span className="nav-themes-current">{getThemeLabel(currentTheme)}</span>
              <span className="nav-themes-caret" aria-hidden="true">▾</span>
            </button>

            <div
              className={`nav-themes-list${themesOpen ? " is-open" : ""}`}
              role="menu"
              aria-hidden={!themesOpen}
            >
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  role="menuitem"
                  className={`nav-theme-btn${theme === currentTheme ? " is-active" : ""}`}
                  onClick={() => {
                    setCurrentTheme(theme);
                    setThemesOpen(false);
                  }}
                >
                  {getThemeLabel(theme)}
                </button>
              ))}
            </div>
          </div>


          <a href="#contact" className="nav-cta" onClick={(e) => onNavLink(e, "contact")}>
            Contact
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          {/* Theme doodles removed (now controlled via navbar Themes) */}
          <div ref={dollsRef} className="hero-dolls" aria-hidden="true" />
          <p className="hero-eyebrow reveal" data-reveal>
            Full Stack Developer
          </p>

          <div className="hero-avatar reveal" data-reveal>
            <div className="hero-avatar-inner">
              <img
                className="hero-avatar-img"
                src="/Ansuman_pfp.jpg"
                alt="Ansuman Mohapatra"
                loading="eager"
                decoding="async"
              />
              <span className="hero-avatar-glow" aria-hidden="true" />
              <span className="hero-avatar-ring" aria-hidden="true" />
            </div>
          </div>

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
            <a href="https://github.com/ansuman34/" target="_blank" rel="noopener noreferrer">
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
                    <h3>MERN Stack Developer Intern</h3>
                    <time dateTime="2025-07">Jul 2025 – Aug 2025</time>
                  </div>
                  <p className="company">
                    Codebeat <span className="badge">Virtual</span>
                  </p>
                  <ul>
                    <li>Worked on MERN stack development and full-stack project implementation</li>
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
              {projects.map((project) => (
                <article
                  key={project.title}
                  className="project-card reveal"
                  data-reveal
                  role="button"
                  tabIndex={0}
                  onClick={() => openProject(project)}
                  onKeyDown={(e) => e.key === "Enter" && openProject(project)}
                >
                  <div className="project-card-inner">
                    <span className="project-icon" aria-hidden="true">
                      ◆
                    </span>
                    <h3>{project.title}</h3>
                    <p className="stack">{project.stack}</p>
                    <p>{project.summary}</p>
                    <button className="btn btn-primary project-card-btn" type="button" onClick={(e) => { e.stopPropagation(); openProject(project); }}>
                      View details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {activeProject && (
          <div className="project-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeProject()}>
            <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
              <button type="button" className="project-modal-close" onClick={closeProject} aria-label="Close project details">
                ×
              </button>
              <h3 id="project-modal-title">{activeProject.title}</h3>
              <p className="stack">{activeProject.stack}</p>
              <p>{activeProject.details}</p>
              <div className="project-modal-actions">
                <a href={activeProject.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Visit GitHub
                </a>
                <button type="button" className="btn btn-ghost" onClick={closeProject}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <section id="resume" className="section resume">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">05</span>
              <h2>want know about my full background??</h2>
            </header>

            <div className="resume-grid">
              <div className="resume-copy" data-reveal>

                <p className="lead">
                  Download my concise resume for a quick overview, or explore the extended version for a deeper look into my academic and technical journey.
                </p>

                <div className="resume-actions">
                  <a
                    className="btn btn-primary"
                    href="/Ansuman_Mohapatra_Resume.pdf"
                    download
                  >
                    Download resume <span className="btn-icon" aria-hidden="true">↓</span>
                  </a>
                </div>

              </div>


            </div>
          </div>
        </section>

        <section id="education" className="section education">
          <div className="section-inner">
            <header className="section-head">
              <span className="section-label">06</span>
              <h2>Education & certifications</h2>
            </header>

            <div className="edu-grid">
              <article className="edu-card reveal" data-reveal>
                <h3>B.Tech, Computer Science & Engineering</h3>
                <p>Silicon Institute of Technology, Bhubaneswar</p>
                <time dateTime="2023/2027">2023 – 2027</time>
              </article>
              <article className="edu-card reveal" data-reveal>
                <h3>Higher Secondary Education (Science)</h3>
                <p>Tetrahedron Junior Science College — <strong>84.13%</strong></p>
                <time dateTime="2021/2023">2021 – 2023</time>
              </article>
              <article className="edu-card reveal" data-reveal>
                <h3>Matriculation</h3>
                <p>Panchayati Raj High School — <strong>91.5%</strong></p>
                <time dateTime="2021">2021</time>
              </article>
              <article className="edu-card cert reveal" data-reveal>
                <h3>Certifications</h3>
                <p>
                  MERN Stack Development — Beat Code (Jun 2024 – Aug 2024)
                </p>
                <p>
                  MERN Stack Developer Intern — Codebeat (Jul 2025 – Aug 2025)
                </p>
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
      </div>
    </>
  );
}
