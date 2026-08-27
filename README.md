# Static Website Starter Template

A clean, minimalist template for building modern static HTML, CSS, and JavaScript websites without frameworks or build steps.

## Features & Characteristics

- **Responsive Layout**: Designed for seamless display across mobile, tablet, and desktop viewports.
- **Top Header & Navigation**: Clean top header with site title and icon-only light/dark theme switcher, paired with a snappy navigation bar.
- **Dynamic Mobile Menu**: Clean inline navigation on mobile for compact menus ($\le 3$ items), automatically switching to an accessible hamburger menu for $4+$ pages.
- **Light / Dark Mode**: Built-in theme switcher with sleek SVG icons, supporting user preference persistence via `localStorage` and system `prefers-color-scheme`.
- **Fixed Bottom Footer**: Standard fixed footer linking back to portfolio `(see more projects by Edward)` pointing to `https://tanguay.info` that stays pinned while page content scrolls smoothly.
- **Quality Check Guidelines**: Standardized rules for top-aligned checkboxes, non-breaking formatting (`1.99&nbsp;€`), and semantic HTML.
- **Cache Busting Ready**: Asset references include version query parameters (`css/main.css?v=1.0.0`) for reliable browser cache invalidation.

---

## Directory Structure

```text
/
├── index.html            # Main entry point HTML file with page views
├── .env.example          # Sample environment variables for deployment
├── README.md             # Project documentation & guidelines
├── agents.md             # Coding instructions & design rules for AI agents
├── css/
│   ├── reset.css         # Minimal modern CSS reset
│   └── main.css          # Core variables, theme styles, layout, and utilities
└── js/
    └── main.js           # Theme toggle, view switching, and navigation logic
```

### Suggested Modular Structure for Larger Sites

When a project grows, files can be expanded into modular parts as needed (the following are example names to follow, not strict requirements):

- **CSS**: `reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`, `utilities.css`, `responsive.css`
- **JS**: `main.js`, `navigation.js`, `forms.js`, `[feature-name].js`
- **Assets**: `assets/images/`, `assets/icons/`, `assets/fonts/`

---

## Environment Variables & Automated Deployment

This project includes a `.env.example` file documenting the configuration needed for FTP deployment:

```env
FTP_SERVER = ftp.tanguay.info
FTP_USER = edward@tanguay.info
FTP_PASSWORD = TODO
FTP_DIRECTORY = /public_html
```

### Setup

1. Copy `.env.example` to `.env`:
2. Fill in your actual FTP credentials in `.env` (note: `.env` is ignored by `.gitignore` and should never be committed to source control).

### Automated Chatbot Deployment ("ftp" trigger)

Deployment is automated directly through the AI assistant. Whenever the developer types **`ftp`** in the chatbot, the assistant executes the deployment pipeline:

1. **Pre-deployment Tasks**: Runs any preliminary checks or data parsing steps (extensible pipeline).
2. **Cache Busting**: Increments the version tag in `index.html` (e.g. `css/main.css?v=1.0.1`, `js/main.js?v=1.0.1`) whenever asset changes have occurred.
3. **Upload Files**: Connects to `FTP_SERVER` using credentials in `.env` and uploads updated project files to the target directory (`public_html/<app-name>`).

---

## Quality Checklist

- **Currency & Units**: Keep items with spaces together (e.g., `1.99&nbsp;€` or use the `.nowrap` helper class) so they do not break across lines.
- **Checkboxes**: Ensure checklist checkboxes are aligned to the top of multi-line text (`align-items: flex-start`), rather than centered vertically in the block.
- **Accessibility**: Semantic HTML, proper heading hierarchy (`h1` -> `h2`), and visible focus styles.

