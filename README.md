# MPF.AI - Modern Public Management Platform

## 🚀 Project Overview
**MPF.AI** is a comprehensive platform for public administration management, built with a focus on modularity, scalability, and clean architecture. It handles Citizen Management (GC), Department Administration, Task Tracking, and Strategic Planning (FODA).

The project uses a **Screaming Architecture** combined with **Hexagonal (DDD)** principles to ensure that the code structure reflects the business domain.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Material Tailwind](https://www.material-tailwind.com/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [MSW](https://mswjs.io/)
- **Validation**: [Zod](https://zod.dev/)

## 📂 Project Structure

```bash
src/
├── _core/                  # Application Core (Auth, Store, API Facade)
├── _shared/                # Shared Kernel (Base Components, Types, Infra)
├── app/                    # Business Domains (Feature Modules)
│   ├── departments/        # Department Management
│   ├── gc/                 # Citizen Management (Gestión Ciudadana)
│   ├── tasks/              # Task Tracking
│   ├── foda/               # SWOT Analysis
│   └── admin/              # User Administration
└── __tests__/              # Global Tests & Mocks
```

Each domain folder (e.g., `src/app/departments/`) follows a **Hexagonal** internal structure:
- **`_domain/`**: Pure business logic, types, and schemas.
- **`_application/`**: Use cases, Redux slices, and hooks.
- **`components/`**: UI components (Adapters).
- **`_test/`**: Domain-specific tests.

## 🏁 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd mpf.ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🧪 Running Tests

This project uses a **Hybrid Testing Strategy** (see [TESTING.md](./TESTING.md) for details).

### Unit & Component Tests (Mocked)
Run these by default. They use **MSW** to mock API responses, so no backend is needed.
```bash
npm test
```

### Integration Tests (Real Backend)
To test against a real running backend (e.g., localhost:8080):
```bash
npm run test:integration
```

## 🏗️ Architecture Highlights

### Centralized API Slice
We use Redux Toolkit's `injectEndpoints` pattern.
- **Base**: Defined in `src/_shared/_infrastructure/api/baseApiSlice.ts`.
- **Injected**: Each domain injects its own endpoints (e.g., `departmentsApiSlice.ts`).
- **Unified**: Everything is re-exported from `src/_core/api/index.ts`.

### Screaming Architecture
The folder structure tells you *what* the application does. If you need to work on "Departments", you go to `src/app/departments`. You don't hunt through a generic `components` folder.
