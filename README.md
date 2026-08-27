# Static Website Starter Template

A clean, minimalist template for building modern static HTML, CSS, and JavaScript websites without frameworks or build steps.

## Features & Characteristics

- **Responsive Layout**: Designed for seamless display across mobile, tablet, and desktop viewports.
- **Light / Dark Mode**: Built-in theme switcher supporting user preference persistence via `localStorage` and system `prefers-color-scheme`.
- **Top Header Link**: Standard header link back to portfolio `(see more projects by Edward)` pointing to `https://tanguay.info`.
- **Quality Check Guidelines**: Standardized rules for top-aligned checkboxes, non-breaking formatting (`1.99&nbsp;€`), and semantic HTML.
- **Cache Busting Ready**: Asset references include version query parameters (`css/main.css?v=1.0.0`) for reliable browser cache invalidation.

---

## Directory Structure

```text
/
├── index.html            # Main entry point HTML file
├── .env.example          # Sample environment variables for deployment
├── README.md             # Project documentation & guidelines
├── agents.md             # Coding instructions & design rules for AI agents
├── css/
│   ├── reset.css         # Minimal modern CSS reset
│   └── main.css          # Core variables, theme styles, layout, and utilities
└── js/
    └── main.js           # Theme toggle and shared JavaScript logic
```

### Suggested Modular Structure for Larger Sites

When a project grows, files can be expanded into modular parts as needed (the following are example names to follow, not strict requirements):

- **CSS**: `reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`, `utilities.css`, `responsive.css`
- **JS**: `main.js`, `navigation.js`, `forms.js`, `[feature-name].js`
- **Assets**: `assets/images/`, `assets/icons/`, `assets/fonts/`

---

## Environment Variables & Deployment

This project includes a `.env.example` file documenting the configuration needed for FTP deployment:

```env
FTP_SERVER = ftp.tanguay.info
FTP_USER = edward@tanguay.info
FTP_PASSWORD = TODO
FTP_DIRECTORY = /public_html
```

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your actual FTP credentials in `.env` (note: `.env` is ignored by `.gitignore` and should never be committed to source control).

### Deployment Workflow

1. **Cache Busting**: Update the version tag in `index.html` (e.g. `css/main.css?v=1.0.1`) whenever CSS changes are made.
2. **Initial Upload**:
   - Create the target folder in `public_html/<app-name>` on the FTP server.
   - Upload all site files to that directory.
3. **Subsequent Updates**:
   - Only upload files that have changed.

---

## Quality Checklist

- **Currency & Units**: Keep items with spaces together (e.g., `1.99&nbsp;€` or use the `.nowrap` helper class) so they do not break across lines.
- **Checkboxes**: Ensure checklist checkboxes are aligned to the top of multi-line text (`align-items: flex-start`), rather than centered vertically in the block.
- **Accessibility**: Semantic HTML, proper heading hierarchy (`h1` -> `h2`), and visible focus styles.
