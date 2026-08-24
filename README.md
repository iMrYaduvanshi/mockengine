# ⚡ MockEngine — Smart API Mocking & Chaos Testing Platform

> **A developer-first Full-Stack SaaS platform to instantly design, mock, and stress-test REST APIs with artificial network latency and probabilistic fault injection.**

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 📌 Problem Statement

In modern web and mobile development:
1. **Frontend-Backend Blockers:** Frontend and mobile engineers are frequently blocked waiting for backend API endpoints to be finalized.
2. **Difficult Chaos & Edge-Case Testing:** Testing real-world network failures (e.g. slow 3G connections, flaky servers returning random 500 errors, or payment timeouts) on production/staging servers is cumbersome.

**MockEngine** solves this by providing instant cloud mock endpoints with custom HTTP status codes, realistic latency injection, and chaos fault simulation.

---

## ✨ Key Features

- 🌐 **Dynamic Catch-All Router:** Next.js catch-all routes (`/api/m/[projectSlug]/[...path]`) automatically match any HTTP method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) and wildcard URL path.
- ⏱️ **Artificial Latency Simulation:** Inject configurable delays (0ms – 5000ms) on mock routes to test frontend loading skeletons and timeout handlers.
- 💥 **Chaos Engineering (Fault Injection):** Configure probabilistic failure rates (0% – 100%) to simulate intermittent server outages (HTTP 500 errors).
- 🔍 **Live Request Inspector:** Automatically records and displays incoming request metadata (HTTP Method, Route, Client IP, Headers, Body, Duration, Status Code).
- 🧪 **In-Dashboard Test Runner:** Embedded interactive API tester to trigger and verify mock endpoints with instant latency feedback.
- 🔒 **Full CORS Support:** Universal CORS pre-flight headers enabled so mock endpoints can be consumed by React, Vue, Angular, Flutter, iOS, Android, and Python apps.
- 📁 **Multi-Project Workspace:** Manage multiple isolated mock projects with unique URL slugs.

---

## 🏗️ System Architecture

```
[ Frontend / Mobile App / Postman / cURL ]
                    │
                    │  HTTP Request (e.g., GET /api/m/ecommerce-demo/products)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 MOCK ENGINE PROXY ROUTER                    │
│ 1. Parse Project Slug & Catch-all Subpaths                  │
│ 2. Query Project & Endpoint Schema via Prisma ORM           │
│ 3. Apply Chaos Engine (Latency Delay + Error Rate)          │
│ 4. Asynchronously Persist RequestLog to Database            │
│ 5. Return Configured Mock JSON with Universal CORS Headers  │
└─────────────────────────────────────────────────────────────┘
                    │                                │
                    ▼                                ▼
       [ SQLite / PostgreSQL DB ]        [ Next.js User Dashboard ]
          (Tables & Migrations)            (Live Request Inspector)
```

---

## 🛠️ Tech Stack & Engineering Decisions

| Technology | Purpose | Why Chosen |
| :--- | :--- | :--- |
| **Next.js (App Router)** | Full-Stack Web Framework | Unified type-safe codebase for frontend UI and high-throughput serverless API routing without CORS friction. |
| **TypeScript** | Strict Type Safety | Eliminates runtime type errors between database models, API handlers, and UI state. |
| **Prisma ORM** | Object-Relational Mapping | Database-agnostic type-safe queries with easy migration from local SQLite to cloud PostgreSQL. |
| **Tailwind CSS** | Modern UI Styling | Fast, utility-first styling for dark-mode developer experience. |
| **Lucide Icons** | Iconography | Clean, lightweight icon set. |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (`v18+` or `v20+` or `v24+`)
- npm (`v9+` or `v10+` or `v11+`)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/iMrYaduvanshi/mockengine.git
cd mockengine
npm install
```

### 3. Initialize & Seed the Database
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Populate initial demo project & mock routes
npx tsx prisma/seed.ts
```

### 4. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 API Usage Example

### Making a Request to Mock Endpoint
```bash
# Direct cURL Request
curl -X GET "http://localhost:3000/api/m/ecommerce-demo/products" \
  -H "Content-Type: application/json"
```

### React / Next.js Integration
```javascript
const response = await fetch("http://localhost:3000/api/m/ecommerce-demo/products");
const data = await response.json();
console.log(data);
```

---

## 💡 Key Learnings & Engineering Highlights

- **Singleton Pattern in Next.js:** Implemented a global Prisma client instance to prevent connection pool exhaustion during Next.js Hot Module Replacement (HMR).
- **Dynamic Catch-All Route Dispatcher:** Designed recursive path matching logic to resolve complex nested routes (e.g., `/orders/102/items`).
- **Resilient Error Boundaries:** Built intelligent 404 handlers that return lists of available project routes when an unconfigured endpoint is requested.
- **Chaos & Network Simulation:** Implemented non-blocking `Promise`-based latency injectors and stochastic error distribution.
