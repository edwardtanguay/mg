import { config } from "./config.js";
import { articles } from "./data/articles.js";

function initApp() {
  initThemeToggle();
  initNavigation();
  initFooter();
  renderArticles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

/* Render articles dynamically */
function renderArticles() {
  const articlesContainer = document.getElementById("articles-container");
  if (!articlesContainer) return;

  if (!Array.isArray(articles) || articles.length === 0) {
    articlesContainer.innerHTML = "<p>Keine Artikel verfügbar.</p>";
    return;
  }

  const articlesHtml = articles
    .map((item) => {
      const escapedId = escapeHtml(item.id || "");
      const escapedTitle = escapeHtml(item.title);
      const escapedSummary = escapeHtml(item.summary);
      const escapedUrl = encodeURI(item.url);
      const imageSrc = `images/articles/${escapedId}.jpg`;

      return `
        <article class="article-card">
          <div class="article-card__media">
            <img src="${imageSrc}" alt="${escapedTitle}" class="article-card__img" loading="lazy" onerror="this.parentElement.style.display='none'">
          </div>
          <div class="article-card__body">
            <h3 class="article-card__title">${escapedTitle}</h3>
            <p class="article-card__summary">${escapedSummary}</p>
            <div class="article-card__action">
              <a href="${escapedUrl}" class="article-btn" target="_blank" rel="noopener noreferrer">
                <span>Zum Artikel</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  articlesContainer.innerHTML = articlesHtml;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* Footer visibility based on config */
function initFooter() {
  const footer = document.querySelector("footer.bottom-bar");
  const container = document.querySelector(".container");

  if (!config.showFooter) {
    if (footer) {
      footer.style.display = "none";
    }
    if (container) {
      container.classList.add("no-footer");
    }
  }
}

/* Theme Switcher with sleek SVG icons */
function initThemeToggle() {
  const themeToggleBtn = document.querySelector("[data-theme-toggle]");
  if (!themeToggleBtn) return;

  const moonIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;

  const sunIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `;

  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

  function renderTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggleBtn.innerHTML = sunIconSvg;
      themeToggleBtn.setAttribute("aria-label", "Heller Modus");
      themeToggleBtn.setAttribute("title", "Heller Modus");
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggleBtn.innerHTML = moonIconSvg;
      themeToggleBtn.setAttribute("aria-label", "Dunkler Modus");
      themeToggleBtn.setAttribute("title", "Dunkler Modus");
    }
  }

  renderTheme(initialTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    renderTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  });
}

/* Page Navigation & Dynamic Hamburger Logic */
function initNavigation() {
  const navContainer = document.querySelector(".site-nav__container");
  const hamburgerBtn = document.querySelector(".site-nav__hamburger");
  const navList = document.querySelector(".site-nav__list");
  const navLinks = document.querySelectorAll("[data-nav-target]");
  const pageViews = document.querySelectorAll(".page-view");

  // Conditional hamburger display: only show hamburger if there are 4 or more nav items
  const navItemsCount = navLinks.length;
  if (navItemsCount >= 4 && navContainer && hamburgerBtn) {
    navContainer.classList.add("has-hamburger");
    hamburgerBtn.style.display = "inline-flex";
  } else if (hamburgerBtn) {
    hamburgerBtn.style.display = "none";
  }

  if (hamburgerBtn && navList) {
    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      hamburgerBtn.setAttribute("aria-expanded", !isExpanded);
      navList.classList.toggle("open");
    });
  }

  // Smooth, fast view switching
  function switchView(targetId) {
    const targetSection = document.getElementById(`view-${targetId}`);
    if (!targetSection) return;

    // Update active nav link
    navLinks.forEach((link) => {
      if (link.getAttribute("data-nav-target") === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Close mobile menu if open
    if (navList && navList.classList.contains("open")) {
      navList.classList.remove("open");
      if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "false");
    }

    // Fast transition between views
    pageViews.forEach((view) => {
      if (view === targetSection) {
        view.classList.add("active");
        // Force reflow for smooth animation trigger
        requestAnimationFrame(() => {
          view.classList.add("visible");
        });
      } else {
        view.classList.remove("visible");
        view.classList.remove("active");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Initialize initial visible state
  const activeView = document.querySelector(".page-view.active");
  if (activeView) {
    requestAnimationFrame(() => {
      activeView.classList.add("visible");
    });
  }

  // Attach click listeners to any element with data-nav-target (nav links, feature tiles, inline links)
  document.addEventListener("click", (e) => {
    const targetElement = e.target.closest("[data-nav-target]");
    if (targetElement) {
      const targetId = targetElement.getAttribute("data-nav-target");
      if (targetId && document.getElementById(`view-${targetId}`)) {
        e.preventDefault();
        switchView(targetId);
        history.pushState(null, "", `#${targetId}`);
      }
    }
  });

  // Handle browser back/forward and initial hash load
  window.addEventListener("popstate", () => {
    const currentHash = window.location.hash.replace("#", "") || "welcome";
    if (document.getElementById(`view-${currentHash}`)) {
      switchView(currentHash);
    }
  });

  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchView(initialHash);
  }
}
