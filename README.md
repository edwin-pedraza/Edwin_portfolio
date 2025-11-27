# 3D Portfolio & Blog (React + Vite)

A polished, single-page portfolio with an integrated blog, admin console, and Supabase-backed content + storage. Built with Vite for fast DX, React hooks, Tailwind utility styling, and 3D scenes via Three.js/React Three Fiber.

## What’s inside
- Portfolio sections (hero, services, projects, testimonials) fed from Supabase tables.
- Blog with rich text posts, tags, cover images, downloads, and gallery support.
- Admin console with magic-link auth to create/update posts, projects, and theme/blog settings.
- Supabase storage uploads for covers, gallery images, and downloadable assets (with delete support).
- Vite + React + Tailwind + Framer Motion + React Three Fiber for UI, motion, and 3D.

## Quick start
```bash
npm install
npm run dev        # start Vite dev server
npm run build      # production build to dist/
npm run preview    # preview the built app
npm run lint       # eslint for js/jsx
npm run deploy     # publish dist/ to GitHub Pages
```
The app serves at `/` in dev and `/Edwin_portfolio/` in production (see `vite.config.js` base).

Supabase setup: ensure the referenced bucket exists and is public (or add storage policies). Schema and policies are under `supabase/` SQL files.

## Project structure
- `src/components/Portfolio/` – main portfolio UI, 3D scenes, HOCs, feature modules.
- `src/components/admin/` – admin console (posts, hero, profile, services, etc.).
- `src/components/blog/` – blog pages, listing, featured/related logic.
- `src/supabase/` – Supabase client and domain helpers (posts, hooks).
- `src/assets/` – images/icons; heavy assets live in `public/` (e.g., models).
- `public/` – static assets and 3D models.


## Blog & portfolio content
- Posts: title, excerpt, rich text body, cover URL, project URL, download label/URL, gallery URLs, tags/tech stack, optional portfolio feature/order.
- Portfolio: hero, profile, services, technologies, projects, testimonials, education/experience all persisted in Supabase tables.

## Deployment notes
- Default GitHub Pages path `/Edwin_portfolio/` is configured in `vite.config.js` and `npm run deploy` (gh-pages). Update `base` if hosting elsewhere.
- Keep secrets out of git. Large binaries belong in `public/` or Supabase Storage.

## Dev tips
- Use Tailwind utility classes for layout/styling.
- Prefer hooks/function components; keep JSX lean by extracting logic.
- Lint before commit: `npm run lint` (ESLint with React + hooks rules).
- If adding tests, use Vitest + React Testing Library next to sources (`*.test.jsx`).
