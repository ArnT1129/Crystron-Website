import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import "./styles.css";

import navigationHtml from "./templates/partials/navigation.html?raw";
import footerHtml from "./templates/partials/footer.html?raw";
import processModalsHtml from "./templates/partials/process-modals.html?raw";
import homeHtml from "./templates/pages/home.html?raw";
import technologyHtml from "./templates/pages/technology.html?raw";
import teamHtml from "./templates/pages/team.html?raw";
import investorsHtml from "./templates/pages/investors.html?raw";
import newsHtml from "./templates/pages/news.html?raw";
import blogHtml from "./templates/pages/blog.html?raw";
import contactHtml from "./templates/pages/contact.html?raw";
import { blogPosts, getBlogPost } from "./content/blog.js";

window.Chart = Chart;
window.ChartDataLabels = ChartDataLabels;
window.L = L;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

const app = document.getElementById("app");
let mapInitialized = false;
let newsCarouselIndex = 0;

function renderShell(mainHtml) {
  app.innerHTML = `
    ${navigationHtml}
    <div id="main-content-area">
      <main id="main-content">
        ${mainHtml}
      </main>
      ${footerHtml}
    </div>
    ${processModalsHtml}
  `;
}

function renderSite() {
  renderShell(`
    ${homeHtml}
    ${technologyHtml}
    ${teamHtml}
    ${investorsHtml}
    ${newsHtml}
    ${blogHtml}
    ${contactHtml}
  `);
  renderBlogCards();
  initSiteInteractions();
  handleNavigation();
}

function renderBlogPostPage(post) {
  const title = post
    ? `${post.title} | Crystron Technologies`
    : "Blog | Crystron Technologies";
  document.title = title;

  renderShell(`
    <section id="blog-post-page" class="page active blog-post-page">
      <div class="page-shell">
        <article class="blog-article animated-element is-visible">
          <a class="blog-back-link" href="/#blog">
            <i class="fas fa-arrow-left"></i>
            Blog
          </a>
          ${
            post
              ? `<div class="blog-modal-inner">
                  <span class="blog-modal-category">${escapeHtml(
                    post.category
                  )}</span>
                  <h1 class="blog-modal-title">${escapeHtml(post.title)}</h1>
                  <p class="blog-modal-subtitle">${escapeHtml(
                    post.subtitle
                  )}</p>
                  <p class="blog-modal-date">${escapeHtml(
                    post.displayDate || post.date
                  )}</p>
                  <div class="blog-modal-body">${post.html}</div>
                </div>`
              : `<div class="blog-modal-inner">
                  <span class="blog-modal-category">Blog</span>
                  <h1 class="blog-modal-title">Article Not Found</h1>
                  <p class="blog-modal-subtitle">The requested article could not be found.</p>
                </div>`
          }
        </article>
      </div>
    </section>
  `);
  initSharedInteractions();
  initPageLinks({ forceRootNavigation: true });
  updateActiveLink("blog");
}

function renderBlogCards() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  grid.innerHTML = blogPosts
    .map(
      (post) => `
        <article class="blog-card animated-element">
          <a class="blog-card-link" href="/blog/${post.slug}/" aria-label="Read: ${escapeHtml(
        post.title
      )}">
            <div class="blog-card-header">
              <span class="blog-card-category">${escapeHtml(
                post.category
              )}</span>
              <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
              <p class="blog-card-subtitle">${escapeHtml(post.subtitle)}</p>
            </div>
            <div class="blog-card-body">
              <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
            </div>
            <div class="blog-card-footer">
              <span class="blog-card-date">${escapeHtml(
                post.displayDate || post.date
              )}</span>
              <span class="blog-card-cta">Read article <i class="fas fa-arrow-right"></i></span>
            </div>
          </a>
        </article>
      `
    )
    .join("");

  const count = document.getElementById("blog-series-count");
  if (count) count.textContent = `${blogPosts.length} Articles`;
}

function initSiteInteractions() {
  initSharedInteractions();
  initRouting();
  initContactForm();
  initAnimationObservers();
  initProcessEnhancements();
  initNewsCarousel();
  setTimeout(initCharts, 500);
}

function initSharedInteractions() {
  initTheme();
  initMobileMenu();
  initProcessModals();
  initCopyEmail();
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(
    window.location.hostname
  );
  if (
    import.meta.env.PROD &&
    !isLocalHost &&
    !document.getElementById("vercel-insights")
  ) {
    window.va =
      window.va ||
      function (...args) {
        (window.vaq = window.vaq || []).push(args);
      };
    const script = document.createElement("script");
    script.id = "vercel-insights";
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    document.head.appendChild(script);
  }
}

function initTheme() {
  const themeToggleButton = document.getElementById("theme-toggle-button");
  const body = document.body;

  function applyTheme(theme) {
    body.classList.toggle("dark-mode", theme === "dark");
  }

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const newTheme = body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  applyTheme(localStorage.getItem("theme") || "light");
}

function initRouting() {
  initPageLinks({ forceRootNavigation: false });
  window.addEventListener("hashchange", handleNavigation);
}

function initPageLinks({ forceRootNavigation }) {
  document.querySelectorAll(".page-link").forEach((link) => {
    const pageName = link.dataset.page;
    if (forceRootNavigation && pageName) {
      link.setAttribute("href", `/#${pageName}`);
    }

    link.addEventListener("click", (event) => {
      if (!pageName) return;

      event.preventDefault();

      if (forceRootNavigation) {
        window.location.href = `/#${pageName}`;
        return;
      }

      if (window.location.hash.substring(1) === pageName) {
        handleNavigation();
      } else {
        window.location.hash = pageName;
      }
    });
  });
}

function showPage(pageIdToShow) {
  const pages = document.querySelectorAll(".page");
  const sidebarNav = document.getElementById("sidebar-nav");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mainContentArea = document.getElementById("main-content-area");
  const targetPage = document.getElementById(pageIdToShow);

  if (!targetPage) {
    window.location.hash = "home";
    return;
  }

  pages.forEach((page) => page.classList.remove("active"));
  targetPage.classList.add("active");
  updateActiveLink(pageIdToShow.replace("-page", ""));

  if (mainContentArea) {
    mainContentArea.scrollTo({ top: 0, behavior: "auto" });
  }

  if (pageIdToShow === "contact-page" && !mapInitialized) {
    initMap();
    mapInitialized = true;
  }

  if (pageIdToShow === "technology-page") {
    setTimeout(initCharts, 100);
  }

  if (sidebarNav?.classList.contains("open")) {
    sidebarNav.classList.remove("open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    mobileMenuToggle?.querySelector("i")?.classList.remove("fa-times");
    mobileMenuToggle?.querySelector("i")?.classList.add("fa-bars");
    document.body.classList.remove("nav-open");
    document.documentElement.style.removeProperty("--mobile-nav-height");
    if (mainContentArea) {
      mainContentArea.style.marginTop =
        window.innerWidth <= 900 ? "0px" : "80px";
    }
  }
}

function updateActiveLink(pageName) {
  document.querySelectorAll("#sidebar-nav .nav-link").forEach((link) => {
    link.classList.toggle("active-link", link.dataset.page === pageName);
  });
}

function handleNavigation() {
  const pageName = window.location.hash.substring(1) || "home";
  showPage(`${pageName}-page`);
}

function initMobileMenu() {
  const sidebarNav = document.getElementById("sidebar-nav");
  const mainToggle = document.getElementById("mobile-menu-toggle");
  const fallback = document.getElementById("mobile-menu-toggle-fallback");
  const mainContentArea = document.getElementById("main-content-area");

  function setOpen(isOpen) {
    sidebarNav?.classList.toggle("open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    mainToggle?.setAttribute("aria-expanded", String(isOpen));
    fallback?.setAttribute("aria-expanded", String(isOpen));
    const icon = mainToggle?.querySelector("i");
    icon?.classList.toggle("fa-bars", !isOpen);
    icon?.classList.toggle("fa-times", isOpen);

    if (isOpen && sidebarNav && mainContentArea) {
      const height = `${Math.ceil(sidebarNav.getBoundingClientRect().height)}px`;
      document.documentElement.style.setProperty("--mobile-nav-height", height);
      mainContentArea.style.marginTop = "var(--mobile-nav-height)";
    } else if (mainContentArea) {
      document.documentElement.style.removeProperty("--mobile-nav-height");
      mainContentArea.style.marginTop =
        window.innerWidth <= 900 ? "0px" : "80px";
    }
  }

  mainToggle?.addEventListener("click", () => {
    setOpen(!sidebarNav?.classList.contains("open"));
  });
  fallback?.addEventListener("click", () => mainToggle?.click());
  fallback?.setAttribute(
    "aria-expanded",
    mainToggle?.getAttribute("aria-expanded") || "false"
  );
}

function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById("form-submission-status");
    const submitButton = document.getElementById("submit-button");
    const data = new FormData(form);

    status.textContent = "Sending message...";
    status.className = "mt-4 text-center text-base text-accent-secondary";
    submitButton.disabled = true;

    try {
      const response = await fetch("https://formspree.io/f/xrbldjyb", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        status.textContent = "Thanks for your submission!";
        status.className = "mt-4 text-center text-base text-green-500";
        form.reset();
      } else {
        const responseData = await response.json();
        if (Object.hasOwn(responseData, "errors")) {
          status.textContent = responseData.errors
            .map((error) => error.message)
            .join(", ");
        } else {
          status.textContent = "Oops! There was a problem submitting your form";
        }
        status.className = "mt-4 text-center text-base text-red-500";
      }
    } catch (error) {
      status.textContent = "Oops! There was a problem submitting your form";
      status.className = "mt-4 text-center text-base text-red-500";
      console.error("Submission error:", error);
    } finally {
      submitButton.disabled = false;
      setTimeout(() => (status.textContent = ""), 6000);
    }
  });
}

function initMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer || mapContainer._leaflet_id) return;

  const locations = [
    {
      name: "Registered Office",
      coords: [39.745947, -75.547598],
      address: "1209 Orange St, Wilmington, DE 19801",
    },
    {
      name: "Delaware R&D Center",
      coords: [39.775012, -75.572462],
      address: "200 Powder Mill Rd, Wilmington, DE 19803",
    },
    {
      name: "Pennsylvania Operations",
      coords: [40.068308, -75.465112],
      address: "851 Duportail Rd, Chesterbrook, PA 19087",
    },
  ];

  const map = L.map("map").setView([39.9526, -75.1652], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markerGroup = L.featureGroup().addTo(map);
  locations.forEach((loc) => {
    L.marker(loc.coords)
      .bindPopup(`<b>${loc.name}</b><br>${loc.address}`)
      .addTo(markerGroup);
  });

  map.fitBounds(markerGroup.getBounds(), { padding: [30, 30] });
  setTimeout(() => map.invalidateSize(), 150);
}

function initAnimationObservers() {
  const animatedElements = document.querySelectorAll(".animated-element");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("bar")) {
          entry.target.style.height = `calc(${entry.target.style.getPropertyValue(
            "--scale-y"
          )} * 100%)`;
        }
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );
  animatedElements.forEach((el) => observer.observe(el));

  const vpCards = document.querySelectorAll(".vp-card");
  if (vpCards.length) {
    const vpObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vp-visible");
            vpObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    vpCards.forEach((card) => vpObserver.observe(card));
  }
}

function initProcessEnhancements() {
  const crystronContainer = document.getElementById("crystron-steps-container");
  if (crystronContainer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target
            .querySelectorAll(".animate-slide-in")
            .forEach((step) => step.classList.add("start-animation"));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(crystronContainer);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.value || "0", 10);
        const counter = el.querySelector(".counter");
        if (!counter) return;
        let start = 0;
        const steps = 84;
        const increment = target / steps;
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            counter.textContent = `${target}%`;
            clearInterval(timer);
          } else {
            counter.textContent = `${Math.floor(start)}%`;
          }
        }, 1000 / 60);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  document
    .querySelectorAll(".impact-stat")
    .forEach((s) => counterObserver.observe(s));

  mapHoverInteractions();
}

function mapHoverInteractions() {
  const lfpSteps = Array.from(
    document.querySelectorAll(
      "#lfp-diagram .compact-steps .step, #lfp-diagram .step"
    )
  );
  const crySteps = Array.from(
    document.querySelectorAll(
      "#crystron-diagram .compact-steps .step, #crystron-diagram .step"
    )
  );

  lfpSteps.forEach((s, i) => {
    s.addEventListener("mouseenter", () => {
      s.classList.add("hovered");
      crySteps[Math.min(i, crySteps.length - 1)]?.classList.add("hovered");
    });
    s.addEventListener("mouseleave", () => {
      s.classList.remove("hovered");
      crySteps[Math.min(i, crySteps.length - 1)]?.classList.remove("hovered");
    });
  });

  crySteps.forEach((s, i) => {
    s.addEventListener("mouseenter", () => {
      s.classList.add("hovered");
      lfpSteps[Math.min(i, lfpSteps.length - 1)]?.classList.add("hovered");
    });
    s.addEventListener("mouseleave", () => {
      s.classList.remove("hovered");
      lfpSteps[Math.min(i, lfpSteps.length - 1)]?.classList.remove("hovered");
    });
  });
}

function initCharts() {
  try {
    const cssVars = getComputedStyle(document.body);
    const accentPrimary =
      cssVars.getPropertyValue("--accent-primary").trim() || "#2b6cb0";
    const accentSecondary =
      cssVars.getPropertyValue("--accent-secondary").trim() || "#319795";
    const textSecondary =
      cssVars.getPropertyValue("--text-secondary").trim() || "#4a5568";
    const textPrimary =
      cssVars.getPropertyValue("--text-primary").trim() || "#1a202c";

    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const getGrad = (canvas, opacity) => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, hexToRgba(accentSecondary, opacity));
      gradient.addColorStop(1, hexToRgba(accentPrimary, opacity));
      return gradient;
    };

    const barChart = (id, label, data, options = {}) => {
      const canvas = document.getElementById(id);
      if (!canvas || canvas.dataset.chartReady) return;
      if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;
      new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["LFP", "Crystron"],
          datasets: [
            {
              label,
              data,
              backgroundColor: [getGrad(canvas, 0.6), getGrad(canvas, 1)],
              borderRadius: 10,
              maxBarThickness: 56,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            datalabels: { display: false },
          },
          scales: {
            x: {
              ticks: { display: true, color: textSecondary },
              grid: { display: false },
            },
            y: {
              beginAtZero: options.beginAtZero ?? true,
              min: options.min,
              suggestedMax: options.suggestedMax,
              ticks: { display: false },
            },
          },
        },
        plugins: [ChartDataLabels],
      });
      canvas.dataset.chartReady = "true";
    };

    barChart("energyChart", "MJ/kg", [13.6, 2.5], { suggestedMax: 15 });
    barChart("voltageChart", "Volts", [3.4, 3.9], {
      beginAtZero: false,
      min: 3.2,
      suggestedMax: 4.0,
    });
    barChart("energyDensityChart", "KWh/Kg", [561, 566], {
      beginAtZero: false,
      min: 555,
      suggestedMax: 570,
    });
    barChart("costChart", "$/kWh", [4.4, 2.65], { suggestedMax: 5 });
    barChart("wasteChart", "Ton/Ton", [1, 0], { suggestedMax: 1.2 });
    barChart("waterChart", "Ton/Ton", [1000, 0], { suggestedMax: 1100 });

    const tamBarCtx = document.getElementById("tamBarChart");
    if (tamBarCtx && !tamBarCtx.dataset.chartReady) {
      if (tamBarCtx.clientWidth === 0 || tamBarCtx.clientHeight === 0) return;
      const ctx = tamBarCtx.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, accentSecondary);
      gradient.addColorStop(1, accentPrimary);
      const isNarrow = window.innerWidth <= 640;

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["2022", "2025", "2030"],
          datasets: [
            {
              label: "Demand (GWh)",
              data: [700, 1700, 4700],
              backgroundColor: gradient,
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: isNarrow ? 0.45 : 0.7,
              categoryPercentage: isNarrow ? 0.6 : 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          maxBarThickness: isNarrow ? 80 : 150,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor:
                cssVars.getPropertyValue("--bg-secondary").trim() || "#0e1a22",
              titleColor: textPrimary,
              bodyColor: textSecondary,
              borderColor: accentPrimary,
              borderWidth: 2,
              padding: 12,
              titleFont: { size: 14, weight: "bold" },
              bodyFont: { size: 13 },
              callbacks: {
                label: (context) =>
                  `~${context.parsed.y.toLocaleString()} GWh`,
              },
            },
            datalabels: {
              display: true,
              color: textPrimary,
              anchor: "end",
              align: "top",
              offset: 8,
              font: { size: 14, weight: "bold" },
              formatter: (value) => `~${value.toLocaleString()}`,
            },
          },
          scales: {
            x: {
              ticks: { color: textSecondary, font: { size: 14, weight: "600" } },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              max: 5500,
              ticks: { display: false },
              grid: { display: false, drawBorder: false },
            },
          },
        },
        plugins: [ChartDataLabels],
      });
      tamBarCtx.dataset.chartReady = "true";
    }

  } catch (e) {
    console.warn("Chart init failed", e);
  }
}

function initNewsCarousel() {
  window.moveNewsCarousel = moveNewsCarousel;
  newsCarouselIndex = 0;
  moveNewsCarousel(0);
  window.addEventListener("resize", () => {
    newsCarouselIndex = 0;
    moveNewsCarousel(0);
  });
}

function getCardsPerView() {
  return window.innerWidth <= 640 ? 1 : 3;
}

function moveNewsCarousel(direction) {
  const carousel = document.getElementById("news-carousel");
  if (!carousel) return;

  const cards = carousel.querySelectorAll(".news-card");
  const totalCards = cards.length;
  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, totalCards - cardsPerView);
  newsCarouselIndex = Math.min(
    maxIndex,
    Math.max(0, newsCarouselIndex + direction)
  );

  if (cards.length > 0) {
    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    carousel.style.transform = `translateX(-${
      newsCarouselIndex * (cardWidth + gap)
    }px)`;
  }

  const prevArrow = document.querySelector(".news-carousel-arrow.prev");
  const nextArrow = document.querySelector(".news-carousel-arrow.next");
  if (prevArrow) prevArrow.disabled = newsCarouselIndex === 0;
  if (nextArrow) nextArrow.disabled = newsCarouselIndex >= maxIndex;
}

function initCopyEmail() {
  window.copyEmail = async (event) => {
    const email = "info@crystronmat.com";
    const button = event.target.closest("button");
    const icon = button?.querySelector("i");
    const originalClass = icon?.className;

    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      console.error("Failed to copy email:", err);
      const textArea = document.createElement("textarea");
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    if (icon) {
      icon.className = "fas fa-check";
      icon.style.color = "var(--accent-secondary)";
      setTimeout(() => {
        icon.className = originalClass;
        icon.style.color = "";
      }, 2000);
    }
  };
}

function initProcessModals() {
  window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeModal = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      event.target.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  window.closeModalButton = (button) => {
    const modal = button.closest(".modal-overlay");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".modal-overlay.active").forEach((modal) => {
      modal.classList.remove("active");
    });
    document.body.style.overflow = "";
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const blogMatch = window.location.pathname.match(/^\/blog\/([^/]+)\/?$/);
if (blogMatch) {
  renderBlogPostPage(getBlogPost(blogMatch[1]));
} else {
  renderSite();
}
