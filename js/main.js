// Main JavaScript for Info Site
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNavigation();
});

/* Theme Switcher with sleek SVG icons */
function initThemeToggle() {
  const themeToggleBtn = document.querySelector("[data-theme-toggle]");
  if (!themeToggleBtn) return;

  const moonIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12.3 2.03c-.22.02-.43.12-.58.28-.15.16-.22.37-.2.59.35 3.32-1.8 6.4-5.06 7.23-1.07.27-2.18.17-3.17-.28-.2-.09-.43-.07-.61.05-.18.12-.29.32-.29.54 0 5.48 4.45 9.93 9.93 9.93 5.48 0 9.93-4.45 9.93-9.93 0-4.32-2.77-8.08-6.9-9.35-.12-.04-.25-.06-.37-.06z"/>
    </svg>
  `;

  const sunIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zm10-7a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1zM5 12a1 1 0 0 1-1 1H2a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1zm14.07-6.07a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 1 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0zM7.76 16.24a1 1 0 0 1 0 1.42l-1.42 1.41a1 1 0 0 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0zm11.31 11.32a1 1 0 0 1-1.41 0l-1.42-1.42a1 1 0 0 1 1.41-1.41l1.42 1.41a1 1 0 0 1 0 1.42zM7.76 7.76a1 1 0 0 1-1.42 0L4.93 6.34a1 1 0 0 1 1.41-1.41l1.42 1.41a1 1 0 0 1 0 1.42z" />
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

