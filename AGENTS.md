# Repository Guidelines

## Project Structure & Module Organization
Source code lives in `src/`: pages and API routes under `src/app`, reusable UI in `src/components`, and utilities in `src/lib`. Tests reside in `src/__tests__` next to shared fixtures. Database schema and migrations sit in `prisma/`, while static assets, icons, and fonts belong in `public/`. Keep API handlers close to the surfaces that consume them for fast navigation.

## Build, Test, and Development Commands
Run `npm run dev` for a Turbopack dev server at `http://localhost:3000`. Use `npm run build` before deploying and `npm start` to serve the production build locally. `npm run lint` applies the shared ESLint rules, and `npm run test` executes Vitest in headless mode. When the Prisma schema changes, apply `npx prisma migrate dev --name "<change>"` and regenerate the client with `npx prisma generate`.

## Coding Style & Naming Conventions
Components and hooks are TypeScript-first; keep props and return values typed to match the Prisma models. Follow the existing two-space indentation, trailing commas, and double-quoted strings enforced by ESLint. Name components and hooks with `PascalCase`, utilities in `camelCase`, and place shadcn primitives under `src/components/ui`. Order Tailwind utilities from layout to spacing to color so diffs stay readable.

## Testing Guidelines
Vitest with Testing Library (see `vitest.config.ts` and `vitest.setup.ts`) backs unit and interaction tests. Add new specs in `src/__tests__` using the `*.test.tsx` suffix, and rely on RTL queries over manual DOM traversal. Cover core flows—date selection, CRUD dialogs, timezone helpers—and run `npm run test` before every pull request. For rapid feedback, `npx vitest watch` keeps the suite hot-reloading.

## Commit & Pull Request Guidelines
Mirror the repo’s Conventional Commit style (`feat:`, `fix:`, `chore:`) in present tense, keeping subjects under 72 characters (e.g. `feat: add admin seat controls`). If a branch accumulates noise, squash locally before pushing. Pull requests should link issues, summarise user-facing changes, list affected routes or configs, and include screenshots or recordings when the UI shifts. Note lint, test, and migration results in the description to accelerate reviews.

## Database & Environment Notes
Set `DATABASE_URL` in `.env.local` before starting the app and never commit secrets. After pulling schema updates, run `npx prisma migrate deploy` and restart the dev server so Prisma reloads. Keep seed scripts in `prisma/` and make them idempotent to avoid duplicate data.
