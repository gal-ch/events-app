---
paths:
  - "packages/frontend/**"
---

# Frontend Folder Structure

These rules apply to all code under `packages/frontend/`. The canonical example is `packages/frontend/app/events/`.

## Top-level layout

`packages/frontend/` has **no `src/` folder**. Top-level holds only configs, the Vite entry HTML/script, and the `app/` directory:

```
packages/frontend/
├── index.html
├── main.tsx              # Vite entry — bootstraps React, imports styles
├── vite.config.ts
├── tsconfig*.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── app/
    ├── App.tsx           # root component
    ├── shared/           # cross-module code (see below)
    └── <module>/         # one folder per feature module
```

Do not put modules, shared code, or assets at the package root. Only `main.tsx`, configs, and `app/` live there.

## The `shared/` folder

Cross-module code lives under `app/shared/` with a fixed set of subfolders:

- `shared/types/` — re-exports from `@events/types`. Modules must import types from `@/shared/types`, never from `@events/types` directly.
- `shared/components/` — React components used by more than one module.
- `shared/hooks/` — React hooks used by more than one module.
- `shared/assets/` — images, SVGs, fonts.
- `shared/styles/` — global CSS (`index.css` with Tailwind directives).
- `shared/utils/` — pure utility functions (`cn()`, `postgrest` helpers, etc.).

If a component, hook, or util is used inside one module only, it belongs to that module — not to `shared/`.

## Module layout

Every module under `app/<module>/` follows this layout:

```
<module>/
├── services/
│   └── api.ts            # fetch functions and query-string builders
├── hooks/                # React Query hooks (one file per hook + index.ts barrel)
│   ├── <useHook>.ts
│   └── index.ts
├── components/           # UI components composed by the module's entry
│   └── <Component>/
│       └── index.tsx
└── index.tsx             # module entry — the page-level container, owns UI state, exported for routing
```

The module's `index.tsx` is the page container — it owns local UI state (`useState` for filters, sort, pagination) and composes components from `components/`. Other modules and `App.tsx` import the page from the module via `import { EventsPage } from '@/events'`.

## Component folder pattern

Every component is a folder containing `index.tsx`. Subcomponents used **only** by their parent nest inside the parent's folder:

```
components/
├── EventsTable/
│   ├── index.tsx
│   └── SortableHeader/   # only used by EventsTable → nested
│       └── index.tsx
├── FilterBar/
│   └── index.tsx
├── Pagination/
│   └── index.tsx
└── StatusBadge/
    └── index.tsx
```

If a subcomponent gets reused by a sibling, promote it to the module's `components/` root (or to `shared/components/` if used across modules).

Do not place flat `.tsx` files next to component folders. Every component gets its own folder.

## Imports

Use the `@/` path alias for intra-`app/` imports. It is configured in `tsconfig.app.json` and `vite.config.ts` as `./app/*`. Example:

```ts
import { cn } from '@/shared/utils'
import type { FilterState } from '@/shared/types'
import { EventsPage } from '@/events'
```

Within a module, use short relative imports for siblings (`./SortableHeader`, `../../components/FilterBar`). Use `@/shared/*` for anything outside the module.

## State

- **Server state** — wrap API calls in a React Query hook inside `<module>/hooks/`. Use query keys of the form `['<module>', params]`.
- **UI state** — keep local `useState` in the module's `index.tsx` page container. Do not introduce Zustand, Redux, or Context for UI state unless a concrete cross-component need arises.

## Styling

- **Tailwind only.** No CSS modules, no styled-components, no inline `<style>` tags.
- Use `cn()` from `@/shared/utils` for conditional class merging — it combines `clsx` and `tailwind-merge` to handle Tailwind class conflicts safely.

## Reference

When in doubt, mirror the layout and patterns in `packages/frontend/app/events/`.
