# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/`:
  - `src/components/Portfolio/` UI, canvas, HOCs, and feature modules.
  - `src/supabase/` client and hooks (`client.js`, `hooks.js`).
  - `src/assets/` images/icons used by components.
- Static files and 3D models live in `public/` (e.g., `public/desktop_pc/`, `public/planet/`).
- Entry points: `index.html`, `src/main.jsx`, `src/App.jsx`.
- Keep new feature code colocated under `src/components/Portfolio/<Feature>/` and export via a local `index.js` when helpful.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint on `js/jsx` files.
- `npm run deploy` — publish `dist/` to GitHub Pages via `gh-pages`.

## Coding Style & Naming Conventions
- JavaScript/React with ES modules; 2‑space indentation.
- Components/files in PascalCase (`Works.jsx`, `Earth.jsx`); hooks in camelCase prefixed with `use`.
- Prefer function components + hooks; avoid class components.
- Use Tailwind utility classes in `className`; keep component JSX clean by extracting complex logic.
- Lint with ESLint (`eslint`, `eslint-plugin-react`, hooks); fix warnings before committing.

## Testing Guidelines
- No test framework is configured. If adding tests, use Vitest + React Testing Library.
- Place unit tests next to sources as `*.test.jsx` (e.g., `src/components/Portfolio/Works.test.jsx`).
- Aim for critical-path coverage (rendering, interactions, hooks logic).

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`, `test:`.
- Commits should be small and scoped; reference issues like `#123` when applicable.
- PRs must include: brief summary, before/after screenshots for UI, steps to verify, and any config/migration notes.

## Security & Configuration
- Environment variables (Vite) via `.env.local` (not committed):
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```
- Never commit secrets. Large binary assets belong under `public/`; consider Git LFS for very large files.

