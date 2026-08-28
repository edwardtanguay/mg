import { config } from "./config.js";
import { articles } from "./data/articles.js";
import { videos } from "./data/videos.js";
import { concepts } from "./data/concepts.js";

/**
 * Navigation state tracking for scroll restoration and previous view
 */
let navigationHistory = {
  previousView: "info",
  previousScrollY: 0,
};

function initApp() {
  initThemeToggle();
  initFooter();
  renderNewestFeed();
  renderVideos();
  renderArticles();
  renderConcepts();
  initNavigation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

/**
 * Format relative date in German based on timestamp string (e.g. "2026-08-27 16:00:25")
 * Returns an object: { text: string, isOld: boolean }
 */
function getRelativeDateInfo(dateStr, withSuffix = true) {
  if (!dateStr) return { text: "", isOld: false };
  const cleanedStr = dateStr.replace(" ", "T");
  const itemDate = new Date(cleanedStr);
  if (isNaN(itemDate.getTime())) return { text: "", isOld: false };

  const now = new Date();

  // Reset hours to compare calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

  const diffMs = today.getTime() - itemDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isOld = diffDays > 7;

  if (diffDays <= 0) {
    return { text: withSuffix ? "heute hinzugefügt" : "heute", isOld: false };
  } else if (diffDays === 1) {
    return { text: withSuffix ? "gestern hinzugefügt" : "gestern", isOld: false };
  } else if (diffDays < 30) {
    return {
      text: withSuffix ? `vor ${diffDays} Tagen hinzugefügt` : `vor ${diffDays} Tagen`,
      isOld: diffDays > 7,
    };
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return {
      text:
        months === 1
          ? withSuffix
            ? "vor 1 Monat hinzugefügt"
            : "vor 1 Monat"
          : withSuffix
          ? `vor ${months} Monaten hinzugefügt`
          : `vor ${months} Monaten`,
      isOld: true,
    };
  } else {
    const years = Math.floor(diffDays / 365);
    return {
      text:
        years === 1
          ? withSuffix
            ? "vor 1 Jahr hinzugefügt"
            : "vor 1 Jahr"
          : withSuffix
          ? `vor ${years} Jahren hinzugefügt`
          : `vor ${years} Jahren`,
      isOld: true,
    };
  }
}

/**
 * Format relative date in German (string only, backward compatible)
 */
function formatRelativeDate(dateStr, withSuffix = true) {
  return getRelativeDateInfo(dateStr, withSuffix).text;
}

/**
 * Render the 2 newest items (videos + articles + concepts aggregated) under "Aktuelles:" on the Welcome page
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
          targetHash: `article-${a.id}`,
          thumbSrc: `images/articles/${a.id}.jpg`,
        }))
      : []),
    ...(Array.isArray(videos)
      ? videos.map((v) => ({
          ...v,
          itemType: "video",
          typeLabel: "Video",
          targetHash: `video-${v.id}`,
          thumbSrc: `images/videos/${v.id}.jpg`,
        }))
      : []),
    ...(Array.isArray(concepts)
      ? concepts.map((c) => ({
          ...c,
          itemType: "concept",
          typeLabel: "Konzept",
          targetHash: `concept-${c.id}`,
          thumbSrc: `images/concepts/${c.id}.jpg`,
        }))
      : []),
  ];

  // Sort newest first by whenAdded
  combinedItems.sort((a, b) => {
    if (!a.whenAdded) return 1;
    if (!b.whenAdded) return -1;
    return b.whenAdded.localeCompare(a.whenAdded);
  });

  const latestItems = combinedItems.slice(0, 3);

  if (latestItems.length === 0) {
    container.innerHTML = "<p class='newest-feed__empty'>Zurzeit keine aktuellen Einträge.</p>";
    return;
  }

  const itemsHtml = latestItems
    .map((item) => {
      const escapedTitle = escapeHtml(item.title);
      const escapedThumb = encodeURI(item.thumbSrc);
      const dateInfo = getRelativeDateInfo(item.whenAdded, false);
      const metaLabel = !dateInfo.isOld && dateInfo.text
        ? `${escapeHtml(item.typeLabel)} – ${escapeHtml(dateInfo.text)}`
        : escapeHtml(item.typeLabel);

      return `
        <a href="#${item.targetHash}" class="newest-item-row" data-nav-target="${item.targetHash}" title="${escapedTitle}">
          <div class="newest-item-row__media">
            <img src="${escapedThumb}" alt="${escapedTitle}" class="newest-item-row__img" loading="lazy" onerror="this.style.display='none'">
          </div>
          <div class="newest-item-row__content">
            <div class="newest-item-row__meta">
              <span class="newest-item-row__date">${metaLabel}</span>
            </div>
            <h4 class="newest-item-row__title">${escapedTitle}</h4>
          </div>
        </a>
      `;
    })
    .join("");

  container.innerHTML = itemsHtml;
}

/* Render videos dynamically with permalink link support */
function renderVideos() {
  const videosContainer = document.getElementById("videos-container");
  if (!videosContainer) return;

  if (!Array.isArray(videos) || videos.length === 0) {
    videosContainer.innerHTML = "<p>Keine Videos verfügbar.</p>";
    return;
  }

  const videosHtml = videos
    .map((item, index) => {
      const rawId = item.id || "";
      const escapedId = escapeHtml(rawId);
      const escapedTitle = escapeHtml(item.title);
      const escapedSummary = escapeHtml(item.summary);
      const escapedUrl = encodeURI(item.url);
      const imageSrc = `images/videos/${escapedId}.jpg`;
      const dateInfo = getRelativeDateInfo(item.whenAdded);
      const supertitleClass = dateInfo.isOld
        ? "article-card__supertitle article-card__supertitle--old"
        : "article-card__supertitle";
      const supertitleHtml = dateInfo.text
        ? `<span class="${supertitleClass}">${escapeHtml(dateInfo.text)}</span>`
        : "";

      return `
        <article class="article-card is-video is-collapsed" id="video-card-${escapedId}" data-item-id="${escapedId}" data-item-type="video" data-video-index="${index}" tabindex="0" role="button" aria-expanded="false">
          <button class="article-card__close-btn" type="button" aria-label="Schließen" title="Schließen" data-close-item>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="article-card__media article-card__media--video">
            <a href="${escapedUrl}" class="article-card__media-link" target="_blank" rel="noopener noreferrer" title="${escapedTitle} ansehen (öffnet in neuem Tab)" tabindex="-1">
              <img src="${imageSrc}" alt="${escapedTitle}" class="article-card__img" loading="lazy" onerror="this.parentElement.style.display='none'">
              <div class="video-play-indicator" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4"></polygon>
                </svg>
              </div>
              <span class="video-tag-badge">
                <span>Video</span>
              </span>
            </a>
          </div>
          <div class="article-card__body">
            ${supertitleHtml}
            <h3 class="article-card__title">${escapedTitle}</h3>
            <p class="article-card__summary">
              <span class="article-card__summary-prefix">Summary:</span>
              <span class="article-card__summary-text">${escapedSummary}</span>
            </p>
            <div class="article-card__mobile-action">
              <a href="${escapedUrl}" class="article-card__cta-btn article-card__cta-btn--video" target="_blank" rel="noopener noreferrer">
                <span>Video anschauen</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  videosContainer.innerHTML = videosHtml;

  // Setup permalink trigger click & keyboard interaction for videos
  setupCardInteractions(videosContainer, "video");
}

/* Render articles dynamically with permalink link support and upper-left badge */
function renderArticles() {
  const articlesContainer = document.getElementById("articles-container");
  if (!articlesContainer) return;

  if (!Array.isArray(articles) || articles.length === 0) {
    articlesContainer.innerHTML = "<p>Keine Artikel verfügbar.</p>";
    return;
  }

  const articlesHtml = articles
    .map((item, index) => {
      const rawId = item.id || "";
      const escapedId = escapeHtml(rawId);
      const escapedTitle = escapeHtml(item.title);
      const escapedSummary = escapeHtml(item.summary);
      const escapedUrl = encodeURI(item.url);
      const imageSrc = `images/articles/${escapedId}.jpg`;
      const dateInfo = getRelativeDateInfo(item.whenAdded);
      const supertitleClass = dateInfo.isOld
        ? "article-card__supertitle article-card__supertitle--old"
        : "article-card__supertitle";
      const supertitleHtml = dateInfo.text
        ? `<span class="${supertitleClass}">${escapeHtml(dateInfo.text)}</span>`
        : "";

      return `
        <article class="article-card is-collapsed" id="article-card-${escapedId}" data-item-id="${escapedId}" data-item-type="article" data-article-index="${index}" tabindex="0" role="button" aria-expanded="false">
          <button class="article-card__close-btn" type="button" aria-label="Schließen" title="Schließen" data-close-item>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="article-card__media">
            <a href="${escapedUrl}" class="article-card__media-link" target="_blank" rel="noopener noreferrer" title="${escapedTitle} lesen (öffnet in neuem Tab)" tabindex="-1">
              <img src="${imageSrc}" alt="${escapedTitle}" class="article-card__img" loading="lazy" onerror="this.parentElement.style.display='none'">
              <span class="article-tag-badge">
                <span>Artikel</span>
              </span>
            </a>
          </div>
          <div class="article-card__body">
            ${supertitleHtml}
            <h3 class="article-card__title">${escapedTitle}</h3>
            <p class="article-card__summary">
              <span class="article-card__summary-prefix">Summary:</span>
              <span class="article-card__summary-text">${escapedSummary}</span>
            </p>
            <div class="article-card__mobile-action">
              <a href="${escapedUrl}" class="article-card__cta-btn article-card__cta-btn--article" target="_blank" rel="noopener noreferrer">
                <span>Artikel lesen</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  articlesContainer.innerHTML = articlesHtml;

  // Setup permalink trigger click & keyboard interaction for articles
  setupCardInteractions(articlesContainer, "article");
}

/* Render concepts dynamically (no external link, no mobile CTA button) */
function renderConcepts() {
  const conceptsContainer = document.getElementById("concepts-container");
  if (!conceptsContainer) return;

  if (!Array.isArray(concepts) || concepts.length === 0) {
    conceptsContainer.innerHTML = "<p>Keine Konzepte verfügbar.</p>";
    return;
  }

  const conceptsHtml = concepts
    .map((item, index) => {
      const rawId = item.id || "";
      const escapedId = escapeHtml(rawId);
      const escapedTitle = escapeHtml(item.title);
      const escapedSummary = escapeHtml(item.summary);
      const imageSrc = `images/concepts/${escapedId}.jpg`;
      const dateInfo = getRelativeDateInfo(item.whenAdded);
      const supertitleClass = dateInfo.isOld
        ? "article-card__supertitle article-card__supertitle--old"
        : "article-card__supertitle";
      const supertitleHtml = dateInfo.text
        ? `<span class="${supertitleClass}">${escapeHtml(dateInfo.text)}</span>`
        : "";

      return `
        <article class="article-card is-concept is-collapsed" id="concept-card-${escapedId}" data-item-id="${escapedId}" data-item-type="concept" data-concept-index="${index}" tabindex="0" role="button" aria-expanded="false">
          <button class="article-card__close-btn" type="button" aria-label="Schließen" title="Schließen" data-close-item>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="article-card__media article-card__media--concept">
            <div class="article-card__media-static" title="${escapedTitle}">
              <img src="${imageSrc}" alt="${escapedTitle}" class="article-card__img" loading="lazy" onerror="this.parentElement.style.display='none'">
              <span class="article-tag-badge">
                <span>Konzept</span>
              </span>
            </div>
          </div>
          <div class="article-card__body">
            ${supertitleHtml}
            <h3 class="article-card__title">${escapedTitle}</h3>
            <p class="article-card__summary">
              <span class="article-card__summary-prefix">Summary:</span>
              <span class="article-card__summary-text">${escapedSummary}</span>
            </p>
          </div>
        </article>
      `;
    })
    .join("");

  conceptsContainer.innerHTML = conceptsHtml;

  // Setup permalink trigger click & keyboard interaction for concepts
  setupCardInteractions(conceptsContainer, "concept");
}

function setupCardInteractions(container, type) {
  const cards = container.querySelectorAll(".article-card");

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const isMobile = window.matchMedia("(max-width: 600px)").matches;

      // If clicking close button
      if (e.target.closest("[data-close-item]")) {
        e.preventDefault();
        e.stopPropagation();
        closeCurrentItem();
        return;
      }

      // If clicking prominent mobile CTA button, allow navigation to external URL
      if (e.target.closest(".article-card__cta-btn")) {
        e.stopPropagation();
        return;
      }

      // If card is expanded:
      if (card.classList.contains("is-expanded")) {
        // On mobile: clicking anywhere on thumbnail, text or card background goes back
        if (isMobile) {
          e.preventDefault();
          e.stopPropagation();
          closeCurrentItem();
          return;
        }

        // On desktop: if clicking media link when expanded, allow opening external link
        if (e.target.closest("a.article-card__media-link")) {
          return;
        }
      }

      // If clicking collapsed card, navigate to its permalink
      if (card.classList.contains("is-collapsed")) {
        e.preventDefault();
        const itemId = card.getAttribute("data-item-id");
        if (itemId) {
          saveCurrentScrollPosition();
          const targetHash = `${type}-${itemId}`;
          window.location.hash = `#${targetHash}`;
        }
      }
    });

    // Keyboard support (Enter/Space to toggle when focused on card)
    card.addEventListener("keydown", (e) => {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (card.classList.contains("is-collapsed")) {
          const itemId = card.getAttribute("data-item-id");
          if (itemId) {
            saveCurrentScrollPosition();
            const targetHash = `${type}-${itemId}`;
            window.location.hash = `#${targetHash}`;
          }
        }
      }
    });
  });
}

function saveCurrentScrollPosition() {
  const currentHash = (window.location.hash.replace("#", "") || "info").toLowerCase();
  if (!currentHash.startsWith("video-") && !currentHash.startsWith("article-") && !currentHash.startsWith("concept-")) {
    navigationHistory.previousView = currentHash === "welcome" ? "info" : currentHash;
    navigationHistory.previousScrollY = window.scrollY || window.pageYOffset || 0;
  }
}

function closeCurrentItem() {
  const currentHash = (window.location.hash.replace("#", "") || "").toLowerCase();
  let returnView = navigationHistory.previousView;
  let returnScrollY = navigationHistory.previousScrollY || 0;

  // If user loaded directly via permalink without prior navigation history:
  if (!returnView || returnView === "info" && (currentHash.startsWith("video-") || currentHash.startsWith("article-") || currentHash.startsWith("concept-"))) {
    if (currentHash.startsWith("video-")) {
      returnView = "videos";
      returnScrollY = 0;
    } else if (currentHash.startsWith("article-")) {
      returnView = "articles";
      returnScrollY = 0;
    } else if (currentHash.startsWith("concept-")) {
      returnView = "concepts";
      returnScrollY = 0;
    } else {
      returnView = "info";
    }
  }

  // Update hash back to the originating page view
  window.location.hash = `#${returnView}`;

  // Restore scroll position smoothly
  requestAnimationFrame(() => {
    window.scrollTo({ top: returnScrollY, behavior: "smooth" });
  });
}

function expandCard(card) {
  card.classList.remove("is-collapsed");
  card.classList.add("is-expanded");
  card.setAttribute("aria-expanded", "true");
  const mediaLink = card.querySelector(".article-card__media-link");
  if (mediaLink) mediaLink.removeAttribute("tabindex");
}

function collapseCard(card) {
  card.classList.remove("is-expanded");
  card.classList.add("is-collapsed");
  card.setAttribute("aria-expanded", "false");
  const mediaLink = card.querySelector(".article-card__media-link");
  if (mediaLink) mediaLink.setAttribute("tabindex", "-1");
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

/* Page Navigation & Permalinks */
function initNavigation() {
  const hamburgerBtn = document.querySelector(".site-nav__hamburger");
  const navList = document.querySelector(".site-nav__list");
  const navLinks = document.querySelectorAll("[data-nav-target]");
  const pageViews = document.querySelectorAll(".page-view");
  const videosContainer = document.getElementById("videos-container");
  const articlesContainer = document.getElementById("articles-container");
  const conceptsContainer = document.getElementById("concepts-container");

  // Keep hamburger hidden as requested
  if (hamburgerBtn) {
    hamburgerBtn.style.display = "none";
  }

  function handleRoute(rawHash) {
    let hash = (rawHash || "info").replace("#", "").toLowerCase();
    if (hash === "welcome" || !hash) hash = "info";

    // 1. Check if hash is a video permalink (#video-[id])
    if (hash.startsWith("video-")) {
      const videoId = hash.replace("video-", "");
      showPermalinkItem("videos", "video", videoId);
      return;
    }

    // 2. Check if hash is an article permalink (#article-[id])
    if (hash.startsWith("article-")) {
      const articleId = hash.replace("article-", "");
      showPermalinkItem("articles", "article", articleId);
      return;
    }

    // 3. Check if hash is a concept permalink (#concept-[id])
    if (hash.startsWith("concept-")) {
      const conceptId = hash.replace("concept-", "");
      showPermalinkItem("concepts", "concept", conceptId);
      return;
    }

    // 4. Regular view switching
    showStandardView(hash);
  }

  function showPermalinkItem(viewId, itemType, itemId) {
    const targetSection = document.getElementById(`view-${viewId}`);
    if (!targetSection) return;

    // Update active nav link
    updateNavLinks(viewId);

    // Switch active view section
    activateSection(targetSection);

    // Container configuration for single expanded card
    const container =
      itemType === "video"
        ? videosContainer
        : itemType === "concept"
        ? conceptsContainer
        : articlesContainer;
    if (container) {
      container.setAttribute("data-single-active", "true");
      const cards = container.querySelectorAll(".article-card");
      let foundCard = null;

      cards.forEach((c) => {
        if (c.getAttribute("data-item-id") === itemId) {
          expandCard(c);
          foundCard = c;
        } else {
          collapseCard(c);
        }
      });

      if (foundCard) {
        requestAnimationFrame(() => {
          foundCard.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }

  function showStandardView(viewId) {
    const targetSection = document.getElementById(`view-${viewId}`);
    if (!targetSection) return;

    // Reset single active attributes and collapse all cards
    if (videosContainer) {
      videosContainer.removeAttribute("data-single-active");
      videosContainer.querySelectorAll(".article-card").forEach(collapseCard);
    }
    if (articlesContainer) {
      articlesContainer.removeAttribute("data-single-active");
      articlesContainer.querySelectorAll(".article-card").forEach(collapseCard);
    }
    if (conceptsContainer) {
      conceptsContainer.removeAttribute("data-single-active");
      conceptsContainer.querySelectorAll(".article-card").forEach(collapseCard);
    }

    // Update active nav link
    updateNavLinks(viewId);

    // Switch view section
    activateSection(targetSection);
  }

  function updateNavLinks(activeTarget) {
    navLinks.forEach((link) => {
      const linkTarget = link.getAttribute("data-nav-target");
      if (link.closest(".site-nav__list") && linkTarget === activeTarget) {
        link.classList.add("active");
      } else if (link.closest(".site-nav__list")) {
        link.classList.remove("active");
      }
    });

    if (navList && navList.classList.contains("open")) {
      navList.classList.remove("open");
      if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "false");
    }
  }

  function activateSection(targetSection) {
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
  }

  // Attach click listeners to any element with data-nav-target
  document.addEventListener("click", (e) => {
    const targetElement = e.target.closest("[data-nav-target]");
    if (targetElement) {
      const targetId = targetElement.getAttribute("data-nav-target");
      saveCurrentScrollPosition();
      window.location.hash = `#${targetId}`;
    }
  });

  // Handle browser back/forward navigation and hash changes
  window.addEventListener("popstate", () => {
    handleRoute(window.location.hash);
  });
  window.addEventListener("hashchange", () => {
    handleRoute(window.location.hash);
  });

  // Initial load
  handleRoute(window.location.hash);
}


