# Project Architecture & Decisions Log

## 1. Architectural Overview
This project implements a **Screaming Architecture** fused with **Hexagonal Architecture (Ports & Adapters)** principles, adapted for a modern Next.js + Redux Toolkit application.

### Key Concepts
- **Screaming Architecture**: The top-level directory structure in `src/app/` reflects the **Business Domains** (e.g., `departments`, `gc` for Citizen Management, `foda`), rather than technical layers (e.g., `components`, `containers`).
- **Hexagonal Layers**: Each domain module is internally structured to separate concerns:
  - **`_domain/`**: The Core. Contains pure TypeScript types, Zod schemas, and constants. No UI or Framework dependencies.
  - **`_application/`**: The Application Layer. Contains Redux Slices, API injections, and Custom Hooks. Orchestrates data flow.
  - **`components/` (Infrastructure)**: The Adapter Layer. React components that consume the Application Layer to present UI.
  - **`_test/`**: Co-located tests specific to the domain.

## 2. State Management Strategy (Redux Toolkit)
We use a **Centralized API Slice with Distributed Injection** pattern to balance scalability with code cohesion.

### The Pattern
1.  **Base Definition (`src/_shared/_infrastructure/api/baseApiSlice.ts`)**:
    - Creates the empty API slice using `createApi`.
    - Defines the `baseUrl` and global `tagTypes`.
    - **Rule**: No endpoints are defined here.

2.  **Distributed Injection (`src/app/<domain>/_application/slices/*ApiSlice.ts`)**:
    - Each domain defines its own endpoints using `apiSlice.injectEndpoints({...})`.
    - This keeps domain logic co-located with the domain code, respecting DDD.

3.  **Unified Facade (`src/_core/api/index.ts`)**:
    - Re-exports the `apiSlice` and *all* generated hooks from a single location.
    - **Rule**: UI components must import from `@/_core/api`, never from the slice files directly.

## 3. Testing Strategy
We employ a **Hybrid Testing Approach** as detailed in `TESTING.md`.

- **Mocked Tests (Default)**:
  - use **MSW (Mock Service Worker)** to intercept network requests.
  - Fast, deterministic, and offline-capable.
  - Used for Development and CI.

- **Integration Tests (Optional)**:
  - Run against a real backend (`localhost:8080`).
  - Verified by `src/__tests__/api.integration.test.ts`.

## 4. Directory Structure
```
src/
├── _core/                  # App Nucleus (Auth, Store, API Facade)
├── _shared/                # Shared Kernel (UI Kit, Base Infra, Utils)
├── app/                    # Business Domains (Screaming Arch)
│   ├── departments/        # Domain: Departments
│   │   ├── _application/   # Slices, Hooks
│   │   ├── _domain/        # Types, Schemas
│   │   ├── _test/          # Domain Tests
│   │   └── components/     # React UI
│   ├── gc/                 # Domain: Citizen Management
│   └── ...
└── __tests__/              # Global Integration Tests & Mocks
```

## 5. Technical Stack
- **Framework**: Next.js 14 (App Router)
- **State**: Redux Toolkit (RTK Query)
- **Styling**: Tailwind CSS + Material Tailwind
- **Testing**: Vitest + React Testing Library + MSW
- **Validation**: Zod
