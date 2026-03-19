# CapProject

A **Playwright + TypeScript** API testing framework built against the [DummyJSON](https://dummyjson.com) public API.

---

## 📁 Project Structure

```
CapProject/
├── .github/
│   └── workflows/
│       └── Ci.YML                  # GitHub Actions CI/CD pipeline
│
├── fixtures/
│   └── api.fixture.ts              # Playwright fixtures — injects API clients into tests
│
├── playwright-report/
│   └── index.html                  # HTML report (auto-generate)
│
├── reports/
│   ├── junit.xml                   # JUnit report for CI integration
│   └── results.json                # JSON report for dashboards / Excel export
│
├── test-results/
│   └── .last-run.json              # Playwright last run metadata 
│
├── tests/
│   └── api/
│       ├── auth.spec.ts            # Auth tests — login, token validation, edge cases
│       ├── products.spec.ts        # Products — list, filter, pagination, perf budget
│       └── users.spec.ts           # Users — Create → Get → Update → Delete + validation
│
├── utils/
│   ├── apiClient.ts                # Base HTTP client (wraps Playwright request context)
│   ├── dataFactory.ts              # Random test data generators
│   └── schemas.ts                  # AJV schema definitions for response validation
│
├── .auth.json                      # ⚠️ Token written by global-setup (git-ignored)
├── .env                            # ⚠️ Credentials — never commit this (git-ignored)
├── .gitignore
├── global-setup.ts                 # Logs in once before all workers, writes token to .auth.json
├── package-lock.json
├── package.json
├── playwright.config.ts            # Reporters, retries, baseURL, global setup config
└── tsconfig.json
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 (20 recommended) |
| npm | ≥ 9 |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/NavrajDevali/CapProject.git
cd CapProject
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright browsers

```bash
npx playwright install --with-deps chromium
```

> API tests only need Chromium for the request context — no UI browsers required.

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
BASE_URL=https://dummyjson.com
USERNAME=emilys
PASSWORD=emilyspass
```

> `.env` is git-ignored. Never commit real credentials.

---

## 🏃 Running Tests

### Run all tests

```bash
npm test
```

### Run by tag

```bash
# Smoke suite only (fast gate)
npx playwright test --grep @smoke

# Full regression suite
npx playwright test --grep @regression

# All API-tagged tests
npx playwright test --grep @api
```

### Run a specific spec file

```bash
npx playwright test tests/api/auth.spec.ts
npx playwright test tests/api/users.spec.ts
npx playwright test tests/api/products.spec.ts
```

### Open HTML report after a run

```bash
npx playwright show-report
```

---

## 🧪 Test Coverage

### Auth Module (`auth.spec.ts`)

| Test | Tag |
|------|-----|
| Login with valid credentials | `@smoke` `@api` |
| Login with invalid credentials returns 400 | `@regression` `@api` |
| Token is present in login response | `@smoke` `@api` |
| Access protected route with valid token | `@regression` `@api` |

### Users Module (`users.spec.ts`)

| Test | Tag |
|------|-----|
| Create a new user | `@smoke` `@api` |
| Get user by ID | `@smoke` `@api` |
| Update user (PUT) | `@regression` `@api` |
| Partial update user (PATCH) | `@regression` `@api` |
| Delete user | `@regression` `@api` |
| Schema validation on GET /users/1 | `@regression` `@api` |
| 404 on invalid user ID | `@regression` `@api` |
| Required fields validation | `@regression` `@api` |

### Products Module (`products.spec.ts`)

| Test | Tag |
|------|-----|
| List products (default) | `@smoke` `@api` |
| List products with pagination | `@regression` `@api` |
| Filter products by category | `@regression` `@api` |
| Search products by query | `@regression` `@api` |
| Get product by ID | `@smoke` `@api` |
| Schema validation on GET /products/1 | `@regression` `@api` |
| 404 on invalid product ID | `@regression` `@api` |
| GET /products responds within 1000ms | `@regression` `@api` |
| GET /products/:id responds within 800ms | `@regression` `@api` |

---

## 📊 Reports

Reports are generated automatically after every run.

| Reporter | Output location | Use |
|----------|----------------|-----|
| HTML | `playwright-report/index.html` | Visual, interactive |
| JUnit XML | `reports/junit.xml` | CI integration |
| JSON | `reports/results.json` | Dashboards / Excel export |

### View HTML report locally

```bash
npx playwright show-report
```

---

## 🔁 CI/CD — GitHub Actions

Pipeline defined in `.github/workflows/Ci.YML`, triggers on every push and pull request to `main`, `master`, and `develop`.

### Pipeline steps

```
Checkout → Setup Node 20 → npm ci → Install Playwright (Chromium)
    → Smoke tests  (fast gate — fails early if core endpoints are broken)
    → Full test suite
    → Upload HTML + test-results as artifact
    → Publish JUnit summary to GitHub Actions UI
    → Upload JSON report as artifact
```

### Required GitHub Secrets

Before pushing, add these in **Settings → Secrets and variables → Actions**:

| Secret name | Value |
|---|---|
| `BASE_URL` | `https://dummyjson.com` |
| `DUMMYJSON_USERNAME` | `emilys` |
| `DUMMYJSON_PASSWORD` | `emilyspass` |

### Accessing CI reports

1. Go to the **Actions** tab in your GitHub repo.
2. Click on any workflow run.
3. Scroll to **Artifacts** at the bottom.
4. Download `pw-report-<run_number>` → unzip → open `index.html`.

---

## 🏗️ Architecture

```
Test file (tests/api/*.spec.ts)
  └── uses fixture (fixtures/api.fixture.ts)
        └── injects API client
              └── apiClient.ts (base HTTP client)
                    └── reads token from .auth.json
                          (written once by global-setup.ts before all workers start)
```

**Key decisions:**

- **`global-setup.ts`** logs in once and writes the Bearer token to `.auth.json`. This solves the Playwright worker scoping issue where `process.env` variables are not reliably available across workers.
- **`utils/apiClient.ts`** is the base client. All endpoint logic builds on top of it.
- **`utils/dataFactory.ts`** generates unique data per run to prevent test state collisions.
- **`utils/schemas.ts`** centralises all AJV schema definitions for response validation.
- **`fixtures/api.fixture.ts`** exposes typed API clients via `await use()`, enabling automatic teardown.

---

## 🔒 Auth Strategy

- `global-setup.ts` calls `POST /auth/login` once before any test runs.
- The returned Bearer token is written to `.auth.json`.
- All API clients read from `.auth.json` at runtime — not from `process.env` — ensuring the token is available in every Playwright worker process.
- `.auth.json` is git-ignored.

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@playwright/test` | Test runner + API request context |
| `typescript` | Type safety |
| `ajv` | JSON Schema validation |
| `dotenv` | `.env` loading in global-setup |

---

## 🛠️ npm Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run full suite |
| `npx playwright test --grep @smoke` | Smoke tests only |
| `npx playwright test --grep @regression` | Regression tests only |
| `npx playwright show-report` | Open HTML report |

---


