# AGENTS.md

## Project Overview

This is a static website built with plain HTML, CSS, and JavaScript.

The project must remain simple, modular, and easy to maintain:

- HTML defines document structure and semantic content.
- CSS handles presentation, layout, responsiveness, and visual states.
- JavaScript handles behavior, interactivity, and dynamic DOM updates.
- Do not introduce frameworks, bundlers, package managers, or dependencies unless explicitly requested.

## Directory Structure

Use and preserve the following structure:

```text
/
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── navigation.js
│   ├── forms.js
│   └── [feature-name].js
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── README.md
```

Only add files when they have a clear responsibility. Avoid creating duplicate, unused, or overly granular files.

## HTML Rules

- Use `index.html` as the main entry point.
- Use semantic HTML elements whenever appropriate:
  - `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer`.
  - Use real `button` elements for actions.
  - Use `a` elements only for navigation.
- Maintain a logical heading hierarchy. Start with one `h1` per page and do not skip heading levels unnecessarily.
- Add meaningful `alt` text to informative images. Use empty `alt=""` for decorative images.
- Associate every form control with a visible `<label>`.
- Use descriptive class names based on purpose, not appearance.
  - Prefer `.site-header`, `.hero-title`, `.contact-form`.
  - Avoid `.blue-box`, `.left-column`, `.big-text`.
- Do not put CSS in `<style>` tags or HTML attributes.
- Do not put JavaScript directly in HTML event attributes such as `onclick`.
- Load stylesheets from `/css` and scripts from `/js`.

Example:

```html
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/utilities.css">
<link rel="stylesheet" href="css/responsive.css">

<script src="js/navigation.js" defer></script>
<script src="js/forms.js" defer></script>
<script src="js/main.js" defer></script>
```

## CSS Rules

### File Responsibilities

- `reset.css`: Minimal cross-browser normalization and box-sizing rules.
- `variables.css`: CSS custom properties for colors, typography, spacing, shadows, radii, widths, and transitions.
- `base.css`: Global element styles, typography, body defaults, links, buttons, and accessibility defaults.
- `layout.css`: Site-wide layout structures such as containers, grids, headers, footers, and sections.
- `components.css`: Reusable UI components such as cards, buttons, modals, forms, alerts, and navigation items.
- `utilities.css`: Small single-purpose helper classes used sparingly.
- `responsive.css`: Media-query overrides and breakpoint-specific adjustments.

### Styling Principles

- Use CSS custom properties from `variables.css` instead of repeating hard-coded values.
- Use a consistent spacing scale.
- Prefer flexible layouts with Flexbox and CSS Grid.
- Build mobile-first styles. Add media queries only when the design requires them.
- Keep selectors shallow and specific enough to avoid accidental styling conflicts.
- Avoid `!important` except when overriding unavoidable third-party styles.
- Avoid styling by element position unless necessary:
  - Avoid `.card:nth-child(3)`.
  - Prefer semantic modifier classes such as `.card--featured`.
- Use class-based styling rather than IDs for reusable UI.
- Keep component styles close together in `components.css`.
- Do not use inline styles unless explicitly requested.

Example variables:

```css
:root {
  --color-background: #ffffff;
  --color-surface: #f5f7fa;
  --color-text: #1a1a1a;
  --color-primary: #1d4ed8;
  --color-primary-hover: #1e40af;
  --color-border: #d1d5db;

  --font-family-base: Arial, sans-serif;

  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;

  --container-width: 75rem;
  --transition-fast: 150ms ease;
}
```

## JavaScript Rules

### File Responsibilities

- `main.js`: Application initialization and shared site behavior.
- `navigation.js`: Mobile navigation, menu toggles, active links, and navigation accessibility.
- `forms.js`: Client-side form validation, feedback, and submission behavior.
- Feature-specific files: Self-contained functionality such as `modal.js`, `tabs.js`, `carousel.js`, or `theme-toggle.js`.

### Coding Principles

- Use modern JavaScript.
- Prefer `const`; use `let` only when reassignment is needed.
- Never use `var`.
- Use descriptive names for variables, functions, and DOM references.
- Keep each file focused on one responsibility.
- Avoid global variables and duplicate event listeners.
- Use `data-*` attributes as JavaScript hooks when appropriate.
- Do not rely on CSS class names as the only JavaScript selectors when a dedicated `data-*` hook is clearer.
- Check that queried DOM elements exist before using them.
- Use event delegation for repeated or dynamically generated elements.
- Keep DOM manipulation minimal and predictable.
- Do not inject untrusted content with `innerHTML`.
- Use `textContent` for plain text.
- Do not use external libraries unless explicitly requested.

Example:

```js
const menuButton = document.querySelector("[data-menu-toggle]");
const siteNavigation = document.querySelector("[data-site-navigation]");

if (menuButton && siteNavigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNavigation.classList.toggle("is-open", !isOpen);
  });
}
```

## Naming Conventions

Use consistent naming across HTML, CSS, and JavaScript.

### CSS Classes

Use readable component-oriented class names:

```text
.component
.component__element
.component--modifier
.is-active
.is-hidden
.has-error
```

Examples:

```html
<article class="project-card project-card--featured">
  <h2 class="project-card__title">Project title</h2>
</article>
```

### JavaScript Hooks

Use `data-*` attributes for behavior:

```html
<button
  class="site-header__menu-button"
  type="button"
  data-menu-toggle
  aria-expanded="false"
  aria-controls="site-navigation"
>
  Menu
</button>
```

```js
const menuButton = document.querySelector("[data-menu-toggle]");
```

## Accessibility Requirements

- Ensure all interactive elements work with keyboard navigation.
- Preserve visible focus styles.
- Use native HTML controls before creating custom controls.
- Add ARIA attributes only when native HTML does not provide the necessary semantics.
- Keep sufficient color contrast between text and backgrounds.
- Respect `prefers-reduced-motion` for animations and transitions.
- Do not communicate important information through color alone.
- Ensure modal dialogs, menus, and accordions correctly manage focus and ARIA state.

## Responsive Design Requirements

- Start with a mobile layout and progressively enhance for larger screens.
- Test layouts at narrow, medium, and wide viewport sizes.
- Avoid fixed widths that cause horizontal scrolling on small screens.
- Use responsive images where appropriate.
- Ensure navigation, buttons, forms, and touch targets remain usable on mobile devices.

## Quality Checklist

Before completing work, verify:

- The HTML is semantic and valid.
- All stylesheet and script paths are correct.
- CSS files are placed in `/css`.
- JavaScript files are placed in `/js`.
- No inline CSS or inline JavaScript has been added.
- No unused files, selectors, variables, or event listeners remain.
- The page works without JavaScript where reasonable.
- Interactive elements work with mouse, keyboard, and touch input.
- The layout works on mobile and desktop widths.
- Browser console errors and warnings are resolved.
- Images have suitable `alt` text.
- Forms have labels and understandable validation messages.

## Change Guidelines

When making changes:

1. Inspect the existing structure before editing.
2. Reuse existing components, utility classes, variables, and patterns where possible.
3. Keep changes narrow in scope.
4. Do not rewrite unrelated code.
5. Add new CSS or JavaScript files only when existing files would become unclear or serve a different responsibility.
6. Remove dead code introduced by replaced functionality.
7. Update `README.md` if setup, structure, behavior, or usage changes.

## Prohibited Patterns

Do not:

- Add React, Vue, Angular, jQuery, Tailwind, Bootstrap, or build tooling without explicit approval.
- Put all styles into one large unstructured stylesheet.
- Put all JavaScript into one large script file.
- Use inline `style`, `onclick`, `onchange`, or similar HTML event handlers.
- Use `!important` as a routine styling mechanism.
- Add dependencies for functionality achievable with native browser APIs.
- Replace semantic elements with generic `div` elements without a reason.
- Modify unrelated files during a focused task.

