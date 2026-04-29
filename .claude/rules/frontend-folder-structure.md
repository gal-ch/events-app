---
paths:
  - "packages/frontend/**"
---

# Frontend Folder Structure

These rules apply to all code under `packages/frontend/`. The canonical example is `packages/frontend/src/events/`.

## Top-level layout

Top-level holds only configs, the Vite entry HTML/script, and the `src/` directory:

```
packages/frontend/
├── index.html
├── main.tsx              # Vite entry — bootstraps React, imports styles
├── vite.config.ts
├── tsconfig*.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── src/
    ├── App.tsx           # root component
    ├── shared/           # cross-module code (see below)
    └── <module>/         # one folder per feature module
```

Do not put modules, shared code, or assets at the package root. Only `main.tsx`, configs, and `src/` live there.

## The `shared/` folder

Cross-module code lives under `src/shared/` with a fixed set of subfolders:

- `shared/types/` — re-exports from `@events/types`. Modules must import types from `@/shared/types`, never from `@events/types` directly.
- `shared/components/` — React components used by more than one module.
- `shared/hooks/` — React hooks used by more than one module.
- `shared/assets/` — images, SVGs, fonts.
- `shared/styles/` — global CSS (`index.css` with Tailwind directives).
- `shared/utils/` — pure utility functions (`cn()`, `postgrest` helpers, etc.).

If a component, hook, or util is used inside one module only, it belongs to that module — not to `shared/`.

## Module layout

Every module under `src/<module>/` follows this layout:

```
<module>/
├── services/
│   └── api.ts            # fetch functions and query-string builders
├── hooks/                # React Query hooks — one file per hook, imported by filename
│   └── <useHook>.ts      # no index.ts barrel; consumers do `import { useFoo } from './hooks/useFoo'`
├── components/           # UI components composed by the module's entry
│   ├── <Component>.tsx                  # single-file component — flat
│   └── <Parent>/                        # folder only when there are nested subcomponents
│       ├── <Parent>.tsx
│       └── <Child>.tsx
└── index.tsx             # module entry — the page-level container, owns UI state, exported for routing
```

The module's `index.tsx` is the page container — it owns local UI state (`useState` for filters, sort, pagination) and composes components from `components/`. Other modules and `App.tsx` import the page from the module via `import { EventsPage } from '@/events'`.

## Component file & folder pattern

**One component per file.** Every component lives in its own file named after the component (`<Component>.tsx`). Do not declare helper components in the same file as their parent — extract them to their own file. Do not use `index.tsx` for components — the filename must match the component name.

A component only gets its own folder when it has nested subcomponents that are used **only** by that parent. Single-file components stay flat:

```
components/
├── EventsTable/                  # folder, because SortableHeader nests inside
│   ├── EventsTable.tsx
│   └── SortableHeader.tsx        # only used by EventsTable → nested, no own folder
├── FilterBar/                    # folder, because FilterSelect/SelectItem nest inside
│   ├── FilterBar.tsx
│   ├── FilterSelect.tsx
│   └── SelectItem.tsx
├── Pagination/                   # folder, because PageButton nests inside
│   ├── Pagination.tsx
│   └── PageButton.tsx
└── StatusBadge.tsx               # single-file → flat, no folder
```

Imports look like:

```ts
import { EventsTable } from './components/EventsTable/EventsTable'
import { FilterBar } from './components/FilterBar'
```

If a subcomponent gets reused by a sibling, promote it to the module's `components/` root (or to `shared/components/` if used across modules).

## Imports

Use the `@/` path alias for intra-`src/` imports. It is configured in `tsconfig.app.json` and `vite.config.ts` as `./src/*`. Example:

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

When in doubt, mirror the layout and patterns in `packages/frontend/src/events/`.
