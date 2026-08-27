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

/**
 * Format relative date in German based on timestamp string (e.g. "2026-08-27 16:00:25")
 */
function formatRelativeDate(dateStr) {
  if (!dateStr) return "";
  const cleanedStr = dateStr.replace(" ", "T");
  const articleDate = new Date(cleanedStr);
  if (isNaN(articleDate.getTime())) return "";

  const now = new Date();

  // Reset hours to compare calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const artDay = new Date(articleDate.getFullYear(), articleDate.getMonth(), articleDate.getDate());

  const diffMs = today.getTime() - artDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "heute hinzugefügt";
  } else if (diffDays === 1) {
    return "gestern hinzugefügt";
  } else if (diffDays < 30) {
    return `vor ${diffDays} Tagen hinzugefügt`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "vor 1 Monat hinzugefügt" : `vor ${months} Monaten hinzugefügt`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "vor 1 Jahr hinzugefügt" : `vor ${years} Jahren hinzugefügt`;
  }
}

/* Render articles dynamically with collapsed and expanded states */
function renderArticles() {
  const articlesContainer = document.getElementById("articles-container");
  if (!articlesContainer) return;

  if (!Array.isArray(articles) || articles.length === 0) {
    articlesContainer.innerHTML = "<p>Keine Artikel verfügbar.</p>";
    return;
  }

  const articlesHtml = articles
    .map((item, index) => {
      const escapedId = escapeHtml(item.id || "");
      const escapedTitle = escapeHtml(item.title);
      const escapedSummary = escapeHtml(item.summary);
      const escapedUrl = encodeURI(item.url);
      const imageSrc = `images/articles/${escapedId}.jpg`;
      const relativeDate = formatRelativeDate(item.whenAdded);
      const supertitleHtml = relativeDate
        ? `<span class="article-card__supertitle">${escapeHtml(relativeDate)}</span>`
        : "";

      return `
        <article class="article-card is-collapsed" data-article-index="${index}" tabindex="0" role="button" aria-expanded="false">
          <div class="article-card__media">
            <img src="${imageSrc}" alt="${escapedTitle}" class="article-card__img" loading="lazy" onerror="this.parentElement.style.display='none'">
          </div>
          <div class="article-card__body">
            ${supertitleHtml}
            <h3 class="article-card__title">${escapedTitle}</h3>
            <p class="article-card__summary">
              <span class="article-card__summary-prefix">Summary:</span>
              <span class="article-card__summary-text">${escapedSummary}</span>
            </p>
            <div class="article-card__action">
              <a href="${escapedUrl}" class="article-btn article-btn--primary" target="_blank" rel="noopener noreferrer">
                <span>Zum Artikel</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              <button type="button" class="article-btn article-btn--collapse js-article-collapse" aria-label="Artikel einklappen">
                <span>Einklappen</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  articlesContainer.innerHTML = articlesHtml;

  // Setup click & keyboard interaction for expanding/collapsing
  const articleCards = articlesContainer.querySelectorAll(".article-card");
  articleCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // If clicking "Zum Artikel" link, allow standard link behavior
      if (e.target.closest("a.article-btn")) {
        return;
      }

      // If clicking "Einklappen" button
      if (e.target.closest(".js-article-collapse")) {
        e.stopPropagation();
        collapseArticle(card);
        return;
      }

      // If card is collapsed, expand it
      if (card.classList.contains("is-collapsed")) {
        expandArticle(card);
      } else {
        // If clicking on the expanded card (outside links/buttons), collapse it
        collapseArticle(card);
      }
    });

    // Keyboard support (Enter/Space to toggle when focused on card)
    card.addEventListener("keydown", (e) => {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (card.classList.contains("is-collapsed")) {
          expandArticle(card);
        } else {
          collapseArticle(card);
        }
      }
    });
  });
}

function expandArticle(card) {
  card.classList.remove("is-collapsed");
  card.classList.add("is-expanded");
  card.setAttribute("aria-expanded", "true");
}

function collapseArticle(card) {
  card.classList.remove("is-expanded");
  card.classList.add("is-collapsed");
  card.setAttribute("aria-expanded", "false");
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

/* Theme Switcher with sleek SVG icons and showLightDark config */
function initThemeToggle() {
  const themeToggleBtn = document.querySelector("[data-theme-toggle]");
  const isToggleVisible = config.showLightDark === true || config.showLightDark === "true";

  if (!isToggleVisible) {
    // When showLightDark is false, default to dark theme and hide the button
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeToggleBtn) {
      themeToggleBtn.style.display = "none";
    }
    return;
  }

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

/* Page Navigation */
function initNavigation() {
  const hamburgerBtn = document.querySelector(".site-nav__hamburger");
  const navList = document.querySelector(".site-nav__list");
  const navLinks = document.querySelectorAll("[data-nav-target]");
  const pageViews = document.querySelectorAll(".page-view");

  // Keep hamburger hidden as requested
  if (hamburgerBtn) {
    hamburgerBtn.style.display = "none";
  }

  // Smooth, fast view switching
  function switchView(targetId) {
    // Map welcome alias to info
    if (targetId === "welcome") {
      targetId = "info";
    }

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
      const mappedTargetId = targetId === "welcome" ? "info" : targetId;
      if (mappedTargetId && document.getElementById(`view-${mappedTargetId}`)) {
        e.preventDefault();
        switchView(mappedTargetId);
        history.pushState(null, "", `#${mappedTargetId}`);
      }
    }
  });

  // Handle browser back/forward and initial hash load
  window.addEventListener("popstate", () => {
    let currentHash = window.location.hash.replace("#", "") || "info";
    if (currentHash === "welcome") currentHash = "info";
    if (document.getElementById(`view-${currentHash}`)) {
      switchView(currentHash);
    }
  });

  let initialHash = window.location.hash.replace("#", "");
  if (initialHash === "welcome") initialHash = "info";
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchView(initialHash);
  }
}

