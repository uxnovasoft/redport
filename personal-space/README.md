# Personal Space — Portfolio v3 (Red, 1920) Landing Page

Implementation of Figma node `4249:1793` (file `CNz1PRNiNBYwlaqBx73PyB`).
Plain HTML + CSS + a tiny JS file — no build step, no dependencies.

## Run

1. `node scripts/fetch-assets.mjs`   # downloads all images/SVGs into ./assets (Node 18+)
2. Open `index.html`, or serve it:  `npx serve .`
3. (Optional) add `fonts/OrangeAvenue-Regular.woff2` for the hero "Designer." word.

## Files

- `index.html`  — markup, mapped section-by-section to the Figma tree
- `styles.css`  — design tokens (`:root`) + component/section styles
- `main.js`     — scales the 1920px frame to the viewport; scroll-triggered section entrances
- `scripts/fetch-assets.mjs` — asset downloader
