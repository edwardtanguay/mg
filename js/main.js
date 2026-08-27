import { config } from "./config.js";
import { seeAlsoLinks } from "./data/see-also-links.js";

function initApp() {
  initThemeToggle();
  initNavigation();
  initFooter();
  initSeeAlsoLinks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
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
      themeToggleBtn.setAttribute("aria-label", "Switch to light mode");
      themeToggleBtn.setAttribute("title", "Switch to light mode");
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggleBtn.innerHTML = moonIconSvg;
      themeToggleBtn.setAttribute("aria-label", "Switch to dark mode");
      themeToggleBtn.setAttribute("title", "Switch to dark mode");
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

  // Attach click listeners to nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-nav-target");
      if (targetId) {
        switchView(targetId);
        history.replaceState(null, "", `#${targetId}`);
      }
    });
  });

  // Handle hash on initial load or popstate
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(`view-${initialHash}`)) {
    switchView(initialHash);
  }
}

/**
 * Format link display text according to length and slash segments rule:
 * - Strip protocol & www
 * - If length <= 30 chars, show full clean URL
 * - If > 30 chars, drop domain and take rightmost whole slash segments <= 30 chars without mid-word cutting
 */
function formatLinkDisplayText(url) {
  const cleanUrl = url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");

  if (cleanUrl.length <= 30) {
    return cleanUrl;
  }

  const segments = cleanUrl.split("/");
  const pathSegments = segments.length > 1 ? segments.slice(1) : segments;

  const chosenSegments = [];
  for (let i = pathSegments.length - 1; i >= 0; i--) {
    const candidate = [pathSegments[i], ...chosenSegments].join("/");
    if (candidate.length <= 30 || chosenSegments.length === 0) {
      chosenSegments.unshift(pathSegments[i]);
    } else {
      break;
    }
  }

  return chosenSegments.join("/");
}

/* Format & Render See Also Links */
function initSeeAlsoLinks() {
  const container = document.getElementById("see-also-container");
  if (!container) return;

  if (!Array.isArray(seeAlsoLinks) || seeAlsoLinks.length === 0) {
    container.innerHTML = "<p class='text-muted'>No links available.</p>";
    return;
  }

  container.innerHTML = "";

  seeAlsoLinks.forEach((item) => {
    if (!item.url || !item.title) return;

    const displayText = formatLinkDisplayText(item.url);

    const linkItem = document.createElement("div");
    linkItem.className = "link-item";

    const anchor = document.createElement("a");
    anchor.className = "link-item__anchor";
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    // Link icon SVG
    const linkIconSvg = `
      <svg class="link-item__icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    `;
    anchor.innerHTML = `${linkIconSvg}<span>${displayText}</span>`;

    const titleSpan = document.createElement("span");
    titleSpan.className = "link-item__title";
    titleSpan.textContent = item.title;

    linkItem.appendChild(anchor);
    linkItem.appendChild(titleSpan);

    container.appendChild(linkItem);
  });
}
