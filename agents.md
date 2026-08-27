# AGENTS.md

## Project Overview

This repository is a starter template for static websites built with plain HTML, CSS, and JavaScript.

The project must remain simple, modular, and easy to maintain:

- HTML defines document structure and semantic content.
- CSS handles presentation, layout, responsiveness, and visual states.
- JavaScript handles behavior, interactivity, and dynamic DOM updates.
- Do not introduce frameworks, bundlers, package managers, or dependencies unless explicitly requested.

## Directory Structure

The starter template includes minimal starter files:

```text
/
├── index.html
├── .env.example
├── README.md
├── agents.md
├── css/
│   ├── reset.css
│   └── main.css
└── js/
    └── main.js
```

### Suggested Modular Structure for Larger Sites

For larger or more specialized sites, styles and scripts can optionally be broken down into modular files (these are example names to follow as needed, not strict requirements):

```text
css/
├── reset.css          # Minimal browser normalization & box-sizing
├── variables.css      # Custom properties (colors, typography, spacing, etc.)
├── base.css           # Global typography and base element styling
├── layout.css         # Containers, headers, footers, structural grids
├── components.css     # Buttons, cards, modals, form controls
├── utilities.css      # Helper classes (e.g. .nowrap, .is-hidden)
└── responsive.css     # Breakpoint-specific media queries

js/
├── main.js            # Entry point / shared site logic
├── navigation.js      # Mobile menu, navigation toggles
├── forms.js           # Form handling and client-side validation
└── [feature-name].js  # Isolated feature logic (e.g. modal.js, quiz.js)

assets/
├── images/
├── icons/
└── fonts/
```

Only add files when they have a clear responsibility. Avoid creating duplicate, unused, or overly granular files.

## App Characteristics & Requirements

Every site derived from this template should adhere to these baseline features:

1. **Responsive Design**: Must be fully responsive for mobile and desktop screens.
2. **Top Header Link**: Always include a small link at the top of the app:
   ```html
   (see more projects by <a href="https://tanguay.info" target="_blank" rel="noopener noreferrer">Edward</a>)
   ```
3. **Light/Dark Theme Switch**: Always provide a light/dark switch with saved preference (e.g. via `localStorage` and `data-theme` attribute).

## Quality Checks

- **Non-breaking Text**: Keep numeric amounts and currency symbols or unit spaces together (e.g., `1.99&nbsp;€` or `.nowrap`) so they don't wrap onto separate lines.
- **Top-Aligned Checkboxes**: In checklist items, ensure checkbox inputs are top-aligned with multiline label text (`align-items: flex-start`), not centered in the middle of the text block.

## Deployment & Updates (FTP Workflow)

When creating or updating an app:

1. **Cache Busting**: Append or increment a cache-busting query parameter to CSS links (e.g., `href="css/main.css?v=1.0.1"`) so browsers always reload updated styles.
2. **FTP Upload**:
   - Connection credentials are kept locally in `.env` (refer to `.env.example`).
   - For an app (e.g., `frenchnouns`), upload to `public_html/<app-name>` on the `FTP_SERVER`.
   - **First Upload**: Create the directory in `public_html/` and upload all files.
   - **Subsequent Updates**: Only upload changed files.

## HTML Rules

- Use `index.html` as the main entry point.
- Use semantic HTML elements (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `button`, `a`).
- Maintain a logical heading hierarchy with a single `h1`.
- Add meaningful `alt` text to images (or `alt=""` if purely decorative).
- Associate every form control with a `<label>`.
- Do not use inline `style` or inline JavaScript event attributes (`onclick`).

## CSS Rules

- Keep CSS clean, modern, and mobile-first.
- Use CSS custom properties (`:root` / `[data-theme="dark"]`) for colors and spacing.
- Avoid `!important`.
- Keep component styles organized and class names descriptive.

## JavaScript Rules

- Use modern vanilla JavaScript (`const`, `let`, never `var`).
- Check that queried DOM elements exist before attaching listeners or mutating them.
- Avoid global variable pollution.
- Do not inject untrusted content with `innerHTML`; use `textContent`.
