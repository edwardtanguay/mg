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

## NPM Scripts

- `npm run dev`: Starts the local HTTP development server
- `npm run pd`: Runs the data parsing pipeline, parsing all files in `/data`
- `npm run deploy`: Deploys site to FTP server based on data in `.env`

---

## Environment Variables & Automated Deployment

This project includes a `.env.example` file documenting the configuration needed for FTP deployment:

```env
FTP_SERVER = ftp.tanguay.info
FTP_USER = edward@tanguay.info
FTP_PASSWORD = TODO
FTP_DIRECTORY = /public_html/infosite001
```

### Setup

1. Copy `.env.example` to `.env`:
2. Fill in your actual FTP credentials in `.env` (note: `.env` is ignored by `.gitignore` and should never be committed to source control).

