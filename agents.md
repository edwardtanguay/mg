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
2. **Top Header & Site Navigation**:
   - Top header contains site title on the left and icon-only theme toggle on the right.
   - Navigation links are placed immediately below the top header.
   - For mobile screens, navigation remains inline/compact for $\le 3$ pages; an accessible hamburger menu is displayed when there are $4$ or more pages.
3. **Light/Dark Theme Switch**: Always provide a light/dark switch with saved preference (e.g. via `localStorage` and `data-theme` attribute) using sleek solid SVG icons without text labels.
4. **Fixed Bottom Footer Link**: Always include a fixed bottom footer linking to portfolio that remains in place while middle content scrolls:
   ```html
   <footer class="bottom-bar">
     <span class="bottom-bar__link">
       (see more projects by <a href="https://tanguay.info" target="_blank" rel="noopener noreferrer">Edward</a>)
     </span>
   </footer>
   ```

## Quality Checks

- **Non-breaking Text**: Keep numeric amounts and currency symbols or unit spaces together (e.g., `1.99&nbsp;€` or `.nowrap`) so they don't wrap onto separate lines.
- **Top-Aligned Checkboxes**: In checklist items, ensure checkbox inputs are top-aligned with multiline label text (`align-items: flex-start`), not centered in the middle of the text block.

## Data Parsing & Content Architecture

A core design pattern of this template is enabling developers to store content in flat, readable text files within `/data/` and compile them into static JavaScript modules in `/js/data/` for dynamic client-side rendering.

### Workflow & Conventions:

1. **Source Data Files (`/data/*.txt`)**:
   - Add plaintext or delimited files in `/data/` (e.g. `/data/see-also-links.dpod.txt`).
   - Format records with clear separators (e.g. `url; title` or `key: value`).

2. **Parser Modules (`/cmd/parse-data/*.ts`)**:
   - Create a dedicated parsing function in `/cmd/parse-data/parse-[feature].ts` (e.g. `parseSeeAlsoLinks()`).
   - The parser reads the text file, converts entries into structured JavaScript objects or arrays, and writes an ES module output to `/js/data/[feature].js` (e.g. `export const seeAlsoLinks = [...];`).

3. **Orchestration (`npm run pd`)**:
   - `/cmd/parse-data.ts` acts as the master runner that imports and executes each individual parse function.
   - Run `npm run pd` to re-generate all `/js/data/` modules at any time.

4. **Frontend Consumption (`/js/main.js`)**:
   - Frontend scripts import the data modules directly (`import { seeAlsoLinks } from "./data/see-also-links.js";`).
   - Elements are rendered cleanly and securely at runtime via standard DOM APIs.

## Automated Deployment & Updates ("npm run deploy" / "ftp" trigger)

When the developer runs **`npm run deploy`** or types **`ftp`** in the chatbot, the pipeline automatically executes:

1. **Pre-deployment Tasks (`npm run pd`)**:
   - Runs `/cmd/parse-data.ts` to ensure all static JavaScript data files in `/js/data/` are up to date.
2. **Cache Busting**:
   - `/cmd/deploy.ts` increments/updates cache-busting timestamp parameters (`?v=YYYYMMDDHHMMSS`) on all stylesheet and script references in `index.html`.
3. **FTP Upload**:
   - Reads FTP credentials from `.env` (`FTP_SERVER`, `FTP_USER`, `FTP_PASSWORD`, `FTP_DIRECTORY`).
   - Uses `basic-ftp` to upload changed project files (`index.html`, `css/`, `js/`, `data/`, `assets/`) to the destination server.

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
- Do not inject untrusted content with `innerHTML`; use `textContent` where applicable.

