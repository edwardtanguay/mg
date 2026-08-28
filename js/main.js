import { config } from "./config.js";
import { articles } from "./data/articles.js";
import { videos } from "./data/videos.js";

function initApp() {
  initThemeToggle();
  initNavigation();
  initFooter();
  renderNewestFeed();
  renderVideos();
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
function formatRelativeDate(dateStr, withSuffix = true) {
  if (!dateStr) return "";
  const cleanedStr = dateStr.replace(" ", "T");
  const itemDate = new Date(cleanedStr);
  if (isNaN(itemDate.getTime())) return "";

  const now = new Date();

  // Reset hours to compare calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

  const diffMs = today.getTime() - itemDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return withSuffix ? "heute hinzugefügt" : "heute";
  } else if (diffDays === 1) {
    return withSuffix ? "gestern hinzugefügt" : "gestern";
  } else if (diffDays < 30) {
    return withSuffix ? `vor ${diffDays} Tagen hinzugefügt` : `vor ${diffDays} Tagen`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1
      ? (withSuffix ? "vor 1 Monat hinzugefügt" : "vor 1 Monat")
      : (withSuffix ? `vor ${months} Monaten hinzugefügt` : `vor ${months} Monaten`);
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1
      ? (withSuffix ? "vor 1 Jahr hinzugefügt" : "vor 1 Jahr")
      : (withSuffix ? `vor ${years} Jahren hinzugefügt` : `vor ${years} Jahren`);
  }
}

/**
 * Render the 2 newest items (videos + articles aggregated) under "Aktuelles:" on the Welcome page
 */
function renderNewestFeed() {
  const container = document.getElementById("newest-feed-container");
  if (!container) return;

  const combinedItems = [
    ...(Array.isArray(articles)
      ? articles.map((a) => ({
          ...a,
          itemType: "article",
          typeLabel: "Artikel",
          targetView: "articles",
          thumbSrc: `images/articles/${a.id}.jpg`,
        }))
      : []),
    ...(Array.isArray(videos)
      ? videos.map((v) => ({
          ...v,
          itemType: "video",
          typeLabel: "Video",
          targetView: "videos",
          thumbSrc: `images/videos/${v.id}.jpg`,
        }))
      : []),
  ];

  // Sort newest first by whenAdded
  combinedItems.sort((a, b) => {
    if (!a.whenAdded) return 1;
    if (!b.whenAdded) return -1;
    return b.whenAdded.localeCompare(a.whenAdded);
  });

  const latestTwo = combinedItems.slice(0, 2);

  if (latestTwo.length === 0) {
    container.innerHTML = "<p class='newest-feed__empty'>Zurzeit keine aktuellen Einträge.</p>";
    return;
  }

  const itemsHtml = latestTwo
    .map((item) => {
      const escapedTitle = escapeHtml(item.title);
      const escapedThumb = encodeURI(item.thumbSrc);
      const escapedType = escapeHtml(item.typeLabel);
      const relativeTime = formatRelativeDate(item.whenAdded, false);

      const typeIcon =
        item.itemType === "video"
          ? `<svg class="feed-item__type-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
          : `<svg class="feed-item__type-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

      return `
        <a href="#${item.targetView}" class="newest-item-row" data-nav-target="${item.targetView}" title="${escapedTitle}">
          <div class="newest-item-row__media">
            <img src="${escapedThumb}" alt="${escapedTitle}" class="newest-item-row__img" loading="lazy" onerror="this.style.display='none'">
            ${
              item.itemType === "video"
                ? `<span class="newest-item-row__play-badge">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                   </span>`
                : ""
            }
          </div>
          <div class="newest-item-row__content">
            <div class="newest-item-row__meta">
              <span class="newest-item-row__badge newest-item-row__badge--${item.itemType}">
                ${typeIcon}
                <span>${escapedType}</span>
              </span>
              ${relativeTime ? `<span class="newest-item-row__date">${escapeHtml(relativeTime)}</span>` : ""}
            </div>
            <h4 class="newest-item-row__title">${escapedTitle}</h4>
          </div>
        </a>
      `;
    })
    .join("");

  container.innerHTML = itemsHtml;
}

/* Render videos dynamically with collapsed and expanded states */
function renderVideos() {
  const videosContainer = document.getElementById("videos-container");
  if (!videosContainer) return;

  if (!Array.isArray(videos) || videos.length === 0) {
    videosContainer.innerHTML = "<p>Keine Videos verfügbar.</p>";
    return;
  }

  const videosHtml = videos
    .map((item, index) => {
      const escapedId = escapeHtml(item.id || "");
      const escapedTitle = escapeHtml(item.title);
      const escapedSummary = escapeHtml(item.summary);
      const escapedUrl = encodeURI(item.url);
      const imageSrc = `images/videos/${escapedId}.jpg`;
      const relativeDate = formatRelativeDate(item.whenAdded);
      const supertitleHtml = relativeDate
        ? `<span class="article-card__supertitle">${escapeHtml(relativeDate)}</span>`
        : "";

      return `
        <article class="article-card is-video is-collapsed" data-video-index="${index}" tabindex="0" role="button" aria-expanded="false">
          <div class="article-card__media article-card__media--video">
            <img src="${imageSrc}" alt="${escapedTitle}" class="article-card__img" loading="lazy" onerror="this.parentElement.style.display='none'">
            <div class="video-play-indicator" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4"></polygon>
              </svg>
            </div>
            <span class="video-tag-badge">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Video</span>
            </span>
          </div>
          <div class="article-card__body">
            ${supertitleHtml}
            <h3 class="article-card__title">${escapedTitle}</h3>
            <p class="article-card__summary">
              <span class="article-card__summary-prefix">Summary:</span>
              <span class="article-card__summary-text">${escapedSummary}</span>
            </p>
            <div class="article-card__action">
              <a href="${escapedUrl}" class="article-btn article-btn--primary article-btn--video" target="_blank" rel="noopener noreferrer">
                <span>Zum Video</span>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <polygon points="6 4 20 12 6 20 6 4"></polygon>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  videosContainer.innerHTML = videosHtml;

  // Setup single-open accordion click & keyboard interaction for videos
  setupAccordionInteraction(videosContainer, ".article-card");
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
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  articlesContainer.innerHTML = articlesHtml;

  // Setup single-open accordion click & keyboard interaction for articles
  setupAccordionInteraction(articlesContainer, ".article-card");
}

function setupAccordionInteraction(container, selector) {
  const cards = container.querySelectorAll(selector);

  function closeAllCardsExcept(targetCard) {
    cards.forEach((c) => {
      if (c !== targetCard && c.classList.contains("is-expanded")) {
        collapseCard(c);
      }
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // If clicking button/link, allow standard link behavior
      if (e.target.closest("a.article-btn")) {
        return;
      }

      if (card.classList.contains("is-collapsed")) {
        closeAllCardsExcept(card);
        expandCard(card);
        requestAnimationFrame(() => {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      } else {
        collapseCard(card);
      }
    });

    // Keyboard support (Enter/Space to toggle when focused on card)
    card.addEventListener("keydown", (e) => {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (card.classList.contains("is-collapsed")) {
          closeAllCardsExcept(card);
          expandCard(card);
          requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        } else {
          collapseCard(card);
        }
      }
    });
  });
}

function expandCard(card) {
  card.classList.remove("is-collapsed");
  card.classList.add("is-expanded");
  card.setAttribute("aria-expanded", "true");
}

function collapseCard(card) {
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
      const linkTarget = link.getAttribute("data-nav-target");
      if (link.closest(".site-nav__list") && linkTarget === targetId) {
        link.classList.add("active");
      } else if (link.closest(".site-nav__list")) {
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

