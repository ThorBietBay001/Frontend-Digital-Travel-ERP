# AI Agent Notes

## Project Snapshot
- React + TypeScript + Vite app with React Router v7.
- Tailwind CSS v4 with custom theme tokens and utility classes.
- UI copy is primarily Vietnamese.

## Key Commands
- dev server: `npm run dev`
- production build: `npm run build`
- lint: `npm run lint`
- preview: `npm run preview`

## Code Structure and Conventions
- Routes are declared in `src/App.tsx` and wrap pages with `MainLayout`.
- Pages live in `src/pages/`; shared layout is in `src/layouts/`.
- Prefer Tailwind utilities for styling; custom utilities live in `src/index.css`:
  - `.glass-panel`, `.glass-card`, `.text-gradient-orange`, `.text-gradient-green`
  - theme tokens defined in `@theme` for colors and fonts
- Icon set: `lucide-react`.
- `src/App.css` still contains Vite starter styles; confirm usage before removing or editing.

## Domain Documentation
- Product overview and module list: [docs/overview.md](docs/overview.md)
- Database schema (Oracle): [docs/README-Database.md](docs/README-Database.md)

## Working Notes
- Keep UI text consistent with the existing Vietnamese copy unless explicitly asked to translate.
- When adding new UI elements, reuse existing theme tokens and glassmorphism utilities.
