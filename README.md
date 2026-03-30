# Campuls

Campuls is a mobile-first departmental PWA scaffold built with Next.js App Router, Tailwind CSS, Supabase, React Query, IndexedDB, and a service worker. The current workspace is runnable against a real Supabase backend, while the data layer, migration, and offline abstractions are already in place.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS and a shared component shell
- Supabase browser/server/admin clients
- React Query hooks for `select`/read abstractions
- IndexedDB via `idb` for collections, files, queued mutations, and offline session state
- Service worker for shell caching
- Vitest + Testing Library + Playwright

## Key Structure

- `src/app`: routes, layout, manifest
- `src/components`: app shell and shared UI primitives
- `src/features`: feature-level components and hooks
- `src/lib/supabase`: clients, repository helpers, read and write hook abstractions
- `src/lib/offline`: IndexedDB and queued sync helpers
- `supabase/migrations`: schema, indexes, RLS, and realtime setup

## Local Run

1. Copy `.env.example` to `.env.local`.
2. Add Supabase values if available. If not, the app runs in demo mode.
3. Install dependencies with `corepack pnpm install`.
4. Start the app with `corepack pnpm dev`.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm test:e2e`

## Notes

- Reads are abstracted through reusable hooks instead of direct component-level `.select()` calls.
- Writes are abstracted through mutation hooks with offline queue support.
- The login flow uses demo/offline behavior until real Supabase auth credentials are supplied.
# campuls
