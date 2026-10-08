import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { animate, inView, stagger, scroll } from "motion";

(() => {
  const page = document.getElementById("page");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // =========================================================================
  // 1. Lenis Smooth Momentum Scrolling (Framer-style continuous lerp damping)
  // =========================================================================
  const lenis = new Lenis({
    autoRaf: true,
    lerp: prefersReducedMotion ? 1 : 0.075,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.5,
    smoothWheel: !prefersReducedMotion,
  });

  // Responsive handling for smooth scroll
  window.addEventListener("resize", () => {
    if (lenis) lenis.resize();
  });

  // Dynamic scale factor for service card previews (645x380 base frame)
  const serviceMediaList = document.querySelectorAll(".service__media");
  if (serviceMediaList.length > 0) {
    const updateCardScales = () => {
      serviceMediaList.forEach((el) => {
        const w = el.getBoundingClientRect().width;
        if (w > 0) {
          el.style.setProperty("--c-scale", (w / 645).toFixed(4));
        }
      });
    };
    updateCardScales();
    window.addEventListener("resize", updateCardScales);
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateCardScales);
      serviceMediaList.forEach((el) => ro.observe(el));
    }
  }

  // =========================================================================
  // 2. Mobile Navigation Drawer
  // =========================================================================
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const mobileNavClose = document.getElementById("mobileNavClose");
  const mobileNavBackdrop = document.getElementById("mobileNavBackdrop");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav__link");

  function openMobileNav() {
    if (mobileNav) {
      mobileNav.classList.add("is-open");
      mobileNav.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lenis.stop();
    }
  }

  function closeMobileNav() {
    if (mobileNav) {
      mobileNav.classList.remove("is-open");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lenis.start();
    }
  }

  if (navToggle) navToggle.addEventListener("click", openMobileNav);
  const navToggleBottom = document.getElementById("navToggleBottom");
  if (navToggleBottom) navToggleBottom.addEventListener("click", openMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener("click", closeMobileNav);
  if (mobileNavBackdrop)
    mobileNavBackdrop.addEventListener("click", closeMobileNav);

  // Smooth anchor navigation with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        closeMobileNav();
        lenis.scrollTo(targetElement, {
          offset: 0,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  });

  // =========================================================================
  // Top Header morphs into Floating Capsule on scroll
  // =========================================================================
  const siteHeader = document.getElementById("siteHeader");

  if (siteHeader) {
    const SCROLL_THRESHOLD = 50;
    const updateHeaderSticky = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrolled = scrollY > SCROLL_THRESHOLD;
      siteHeader.classList.toggle("is-scrolled", scrolled);
    };

    if (lenis) {
      lenis.on("scroll", updateHeaderSticky);
    }
    window.addEventListener("scroll", updateHeaderSticky, { passive: true });
    updateHeaderSticky();
  }

  // Top Scroll Progress Bar linked with Motion
  const scrollProgressBar = document.getElementById("scrollProgress");
  if (scrollProgressBar) {
    scroll(
      animate(scrollProgressBar, { scaleX: [0, 1] }, { ease: "linear" }),
      { target: document.documentElement }
    );
  }

  // =========================================================================
  // 3. Section Entrance Observer (Fade + Rise + Scale)
  // =========================================================================
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    targets.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  }

  // =========================================================================
  // 4. Framer Motion Animations (Matt Perry's Motion Engine)
  // =========================================================================
  if (!prefersReducedMotion) {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (isFinePointer) {
      // Circular Arrow Buttons (.arrow) - smooth rotation without jumping scale
      document.querySelectorAll(".arrow").forEach((arrow) => {
        arrow.addEventListener("mouseenter", () => {
          animate(
            arrow,
            { rotate: 45 },
            { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          );
        });

        arrow.addEventListener("mouseleave", () => {
          animate(
            arrow,
            { rotate: 0 },
            { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          );
        });
      });


      // B. 3D Perspective Tilt on Project & Service Cards
      document.querySelectorAll(".project").forEach((project) => {
        const media = project.querySelector(".project__media") || project;
        project.addEventListener("mousemove", (e) => {
          const rect = project.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          const rotateX = (py - 0.5) * -7;
          const rotateY = (px - 0.5) * 7;
          animate(
            media,
            { rotateX, rotateY, scale: 1.015 },
            { duration: 0.22, ease: "easeOut" }
          );
        });

        project.addEventListener("mouseleave", () => {
          animate(
            media,
            { rotateX: 0, rotateY: 0, scale: 1 },
            { type: "spring", stiffness: 280, damping: 18 }
          );
        });
      });

      document.querySelectorAll(".service").forEach((service) => {
        service.addEventListener("mousemove", (e) => {
          const rect = service.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          const rotateX = (py - 0.5) * -5;
          const rotateY = (px - 0.5) * 5;
          animate(
            service,
            { rotateX, rotateY, scale: 1.012 },
            { duration: 0.22, ease: "easeOut" }
          );
        });

        service.addEventListener("mouseleave", () => {
          animate(
            service,
            { rotateX: 0, rotateY: 0, scale: 1 },
            { type: "spring", stiffness: 280, damping: 18 }
          );
        });
      });
    }

    // C. Scroll-Linked Parallax on Case Study Background
    const caseSection = document.querySelector(".case");
    const caseBgImg = document.querySelector(".case__bg img");
    if (caseSection && caseBgImg) {
      scroll(animate(caseBgImg, { y: [-35, 35] }), {
        target: caseSection,
        offset: ["start end", "end start"],
      });
    }

    // D. Staggered Card Reveals on Scroll
    const worksGrid = document.querySelector(".works__grid");
    if (worksGrid) {
      inView(
        worksGrid,
        () => {
          animate(
            ".project",
            { opacity: [0, 1], y: [45, 0] },
            { delay: stagger(0.12), duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          );
        },
        { margin: "0px 0px -10% 0px" }
      );
    }

    const servicesGrid = document.querySelector(".services__grid");
    if (servicesGrid) {
      inView(
        servicesGrid,
        () => {
          animate(
            ".service",
            { opacity: [0, 1], y: [35, 0], scale: [0.98, 1] },
            { delay: stagger(0.1), duration: 0.75, ease: [0.16, 1, 0.3, 1] }
          );
        },
        { margin: "0px 0px -10% 0px" }
      );
    }

    const timeline = document.querySelector(".timeline");
    if (timeline) {
      inView(
        timeline,
        () => {
          animate(
            ".exp-row",
            { opacity: [0, 1], x: [-20, 0] },
            { delay: stagger(0.08), duration: 0.7, ease: [0.16, 1, 0.3, 1] }
          );
        },
        { margin: "0px 0px -10% 0px" }
      );
    }

    const tgrid = document.querySelector(".tgrid");
    if (tgrid) {
      inView(
        tgrid,
        () => {
          animate(
            ".tcard",
            { opacity: [0, 1], y: [35, 0] },
            { delay: stagger(0.12), duration: 0.75, ease: [0.16, 1, 0.3, 1] }
          );
        },
        { margin: "0px 0px -10% 0px" }
      );
    }
  }
})();
