// Theme Switcher Logic with LocalStorage persistence and system preference fallback
(function () {
  const themeToggleBtn = document.querySelector("[data-theme-toggle]");
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Initial theme determination
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  setTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (themeToggleBtn) {
        themeToggleBtn.textContent = "☀️ Light Mode";
        themeToggleBtn.setAttribute("aria-label", "Switch to light mode");
      }
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (themeToggleBtn) {
        themeToggleBtn.textContent = "🌙 Dark Mode";
        themeToggleBtn.setAttribute("aria-label", "Switch to dark mode");
      }
    }
  }
})();
