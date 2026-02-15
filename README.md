

# SkillBridge UI — Detailed README & Code Flow

## 1. Project Overview

**SkillBridge** is a React SPA that helps users track **learning items** and how they **apply** them in the real world (projects, tasks, blog, work). The UI is calm and card-based, with a teal/sage palette and no external UI framework.

| Aspect | Details |
|--------|--------|
| **Stack** | React 19, React Router 7, Vite 7, Axios, Tailwind CSS |
| **Entry** | `index.html` → `src/main.jsx` → `App.jsx` |
| **Backend** | Assumes API at `http://localhost:8080`; Vite proxies `/api` there |

---

## 2. Project Structure

```
skillbridge-ui/
├── index.html              # HTML shell, mounts #root
├── vite.config.js          # Vite + React, /api → backend proxy
├── tailwind.config.js      # Brand/sage colors, shadows, animations
├── postcss.config.js       # Tailwind pipeline
├── src/
│   ├── main.jsx            # React root, BrowserRouter, global CSS
│   ├── App.jsx             # Route definitions + root redirect
│   ├── index.css           # Tailwind layers + custom components (cards, modals, pills)
│   ├── api/
│   │   ├── apiClient.js     # Axios instance, JWT attach, 401 → logout
│   │   ├── authApi.js      # POST /auth/login (mode: LOGIN | SIGNUP)
│   │   ├── learningApi.js  # CRUD learning + category
│   │   ├── appliedOutcomeApi.js  # GET/POST/DELETE applied skills per learning
│   │   └── dashboardApi.js # GET /dashboard metrics
│   ├── components/
│   │   ├── AuthPage.jsx         # Login / Signup (same component, route-based mode)
│   │   ├── PrivateRoute.jsx     # Guard: redirect to /login if no token
│   │   ├── DashboardPage.jsx    # Confidence loop, metrics, welcome/empty state
│   │   ├── LearningListPage.jsx # List learning (pending / applied), add/delete
│   │   ├── LearningDetailPage.jsx # Single learning + applied skills list
│   │   ├── AddLearningModal.jsx # Modal: title + category → create learning
│   │   └── AddSkillModal.jsx    # Modal: description + type → create applied skill
│   └── utils/
│       ├── auth.js         # getToken, isAuthenticated, logout (localStorage)
│       └── categories.js   # CATEGORY_LABELS + categoryLabel()
```

---

## 3. Application Entry & Bootstrap Flow

1. **`index.html`**  
   Loads `/src/main.jsx` as module.

2. **`src/main.jsx`**  
   - Imports `index.css` (Tailwind + custom components).  
   - Creates React root on `#root`.  
   - Wraps app in `StrictMode` and **`BrowserRouter`**.  
   - Renders **`App`**.

3. **`src/App.jsx`**  
   - Defines all routes (see Routing below).  
   - **`/`** → `RootRedirect`: if `isAuthenticated()` then `/dashboard`, else `/login`.  
   - Auth routes render `AuthPage`; protected routes wrap content in **`PrivateRoute`**.

So the flow is: **HTML → main.jsx (router + CSS) → App (routes + redirect) → page components**.

---

## 4. Authentication Flow

### 4.1 Where auth lives

- **Storage:** JWT in `localStorage` under key `"token"`.  
- **Check:** `src/utils/auth.js` — `getToken()`, `isAuthenticated()` (truthy token), `logout()` (remove token).  
- **Login/signup:** `src/api/authApi.js` — single function `authenticate(email, password, mode)`.

### 4.2 Auth API contract

- **Endpoint:** `POST /auth/login` (via `apiClient`, so under `/api` in dev: `POST /api/auth/login`).  
- **Body:** `{ email, password, mode }`.  
  - `mode === "LOGIN"` → existing user: returns JWT; if user missing, backend returns **404** and `error: "USER_NOT_FOUND"`.  
  - `mode === "SIGNUP"` → create user if needed, then always return JWT.  
- **Success:** `authApi.authenticate()` writes `response.data.token` to `localStorage` and returns the token.

### 4.3 AuthPage flow (`src/components/AuthPage.jsx`)

1. **Route:** Rendered for `/login` and `/signup`; `location.pathname === "/signup"` → `mode = "SIGNUP"`, else `"LOGIN"`.  
2. **Already logged in:** If `isAuthenticated()`, redirect to `/dashboard` and do not show form.  
3. **Submit:**  
   - Call `authenticate(email, password, mode)`.  
   - On success: `navigate("/dashboard", { replace: true })`.  
   - On error:  
     - 404 + `error === "USER_NOT_FOUND"` → show “No account found” + link to `/signup`.  
     - 401/403 or other → show “Invalid email or password” or server message.

### 4.4 Protecting routes and 401 handling

- **`PrivateRoute`** (`src/components/PrivateRoute.jsx`):  
  If `!isAuthenticated()` → `<Navigate to="/login" replace />`, else render `children`.

- **`apiClient`** (`src/api/apiClient.js`):  
  - Request interceptor: every request gets `Authorization: Bearer <token>` from `localStorage`.  
  - Response interceptor: on **401** (e.g. expired/missing token), removes `token` and does `window.location.href = "/login"`.  
  - 403 is left to the UI (e.g. in-page error), not treated as global logout.

So: **AuthPage** (login/signup) → **authenticate()** → token in localStorage → **PrivateRoute** and **apiClient** use the same token for access and auto-logout.

---

## 5. Routing Summary

| Path | Component | Protection | Behavior |
|------|-----------|------------|----------|
| `/` | `RootRedirect` | — | Authenticated → `/dashboard`, else → `/login` |
| `/login` | `AuthPage` | Redirect if authenticated | Login form; mode `LOGIN` |
| `/signup` | `AuthPage` | Redirect if authenticated | Signup form; mode `SIGNUP` |
| `/dashboard` | `DashboardPage` | `PrivateRoute` | Metrics, confidence, “Today’s focus”, add learning |
| `/learning` | `LearningListPage` | `PrivateRoute` | List all learning (pending/applied), add/delete |
| `/learning/:learningId` | `LearningDetailPage` | `PrivateRoute` | One learning + list of applied skills |

All API calls from these pages go through **apiClient**, so JWT and 401 behavior are consistent.

---

## 6. Data Model (Frontend View)

- **Learning**  
  - Fields used in UI: `id`, `title`, `status` (`"PENDING"` | `"APPLIED"`), `category`, `createdAt`.  
  - One learning has many **applied skills (outcomes)**.

- **Applied skill (outcome)**  
  - Fields: `id`, `description`, `type` (`PROJECT` | `TASK` | `BLOG` | `WORK`), `createdAt`.  
  - Belongs to one learning via `learningId`.

Categories and outcome types are fixed in the UI (see `utils/categories.js` and `AddLearningModal` / `AddSkillModal`).

---

## 7. API Layer & Request Flow

### 7.1 apiClient (`src/api/apiClient.js`)

- **Base URL:** `"/api"` (Vite proxy strips `/api` and forwards to `http://localhost:8080`).  
- **Request:** Attach `Authorization: Bearer <token>`.  
- **Response:** On 401 → clear token, redirect to `/login`; otherwise reject so callers can handle (e.g. 403, 404).

### 7.2 API modules (all use apiClient)

| File | Purpose |
|------|--------|
| **authApi.js** | `authenticate(email, password, mode)` → `POST /auth/login` |
| **learningApi.js** | `getLearningList()`, `getLearningById(id)`, `createLearning(title, category)`, `updateLearning(id, title, category)`, `deleteLearning(id)` |
| **appliedOutcomeApi.js** | `getOutcomes(learningId)`, `createOutcome(learningId, description, type)`, `deleteOutcome(learningId, outcomeId)` |
| **dashboardApi.js** | `getDashboard()` → `{ totalLearning, appliedCount, pendingCount }` |

So: **User action in a page** → **component calls one of these APIs** → **apiClient adds JWT and sends request** → **proxy to backend** → **response (or 401 handled by interceptor)**.

---

## 8. Page-by-Page Code Flow

### 8.1 Dashboard (`/dashboard`)

- **PrivateRoute** allows access only if `isAuthenticated()`.  
- **DashboardPage** on mount runs `loadData()`:
  - `getLearningList()` and `getDashboard()` in parallel.
  - Sets `items` (learnings) and `metrics` (totalLearning, appliedCount, pendingCount).
- **UI logic:**  
  - If `items.length === 0`: welcome block + “Add your first learning” → opens **AddLearningModal**.  
  - Else: confidence card (e.g. applied/total as %), “Today’s focus” (pending items, up to 3), “At a glance” (counts), “Needs an application” list.  
- **Add learning:** “Add Learning” opens **AddLearningModal**; `onAdd(title, category)` calls `createLearning(title, category)` then `navigate("/learning")`.  
- **Logout:** “Log out” calls `logout()` (clear token) and `navigate("/login", { replace: true })`.

### 8.2 Learning list (`/learning`)

- **LearningListPage** on mount calls `getLearningList()` → `setItems(data)`.  
- **Sections:**  
  - Pending: `items.filter(i => i.status === "PENDING")`.  
  - Applied: `items.filter(i => i.status === "APPLIED")`.  
- **Add:** Opens **AddLearningModal**; `onAdd(title, category)` → `createLearning()` → close modal → `loadItems()` again.  
- **Delete:** `handleDelete(e, id)` → `deleteLearning(id)` → `loadItems()`.  
- **Navigate:** Clicking an item → `navigate(\`/learning/${item.id}\`)`.

### 8.3 Learning detail (`/learning/:learningId`)

- **LearningDetailPage** uses `useParams().learningId`.  
- On mount / when `learningId` changes, `refresh()` runs:
  - `getLearningById(learningId)` and `getOutcomes(learningId)` in parallel.
  - Sets `learning` and `outcomes`.  
- **Add applied skill:** Opens **AddSkillModal**; `onAdd(description, type)` → `createOutcome(learningId, description, type)` → close modal → `refresh()`.  
- **Delete outcome:** `handleDeleteSkill(outcomeId)` → `deleteOutcome(learningId, outcomeId)` → `refresh()`.  
- **NotFound:** If `!learning` after load, show “Learning item not found” and link back to `/learning`.

### 8.4 Add Learning modal

- **AddLearningModal** is used from Dashboard and Learning list.  
- **State:** `title`, `category` (from `CATEGORIES` in modal), `submitting`, `error`, random `tip`.  
- **Submit:** `onAdd(title.trim(), category)` (parent does `createLearning` and then either navigate or `loadItems()`).  
- **Escape** closes modal via `useEffect` key listener.

### 8.5 Add Skill modal

- **AddSkillModal** is used only on Learning detail.  
- **State:** `description`, `type` (PROJECT/TASK/BLOG/WORK), `submitting`, `error`, random `tip`.  
- **Submit:** `onAdd(description.trim(), type)` (parent calls `createOutcome(learningId, description, type)` then `refresh()`).  
- **Escape** closes modal.

---

## 9. Styling & Theming

- **Tailwind** via `tailwind.config.js`: custom `brand` (teal) and `sage` palettes, `surface`/`page`, `borderRadius`, `boxShadow`, `animation`/`keyframes` (e.g. fadeIn, slideUp).  
- **`src/index.css`:**  
  - Tailwind layers (`@tailwind base/components/utilities`).  
  - Custom component classes: `.progress-track` / `.progress-fill`, `.pill`, `.pill-pending` / `.pill-applied` / `.pill-type`, `.modal-overlay` / `.modal-card`, `.card`, `.focus-item`.  

So: **Tailwind** for layout and tokens, **index.css** for shared UI building blocks used across Dashboard, Learning list, and Detail.

---

## 10. End-to-End User Flows (Code Path)

1. **First-time signup**  
   Open app → `/` → RootRedirect (no token) → `/login`. Go to `/signup` → AuthPage (mode SIGNUP) → submit → `authenticate(..., "SIGNUP")` → token stored → navigate to `/dashboard` → PrivateRoute allows → DashboardPage loads learnings + dashboard API → empty state → “Add your first learning” → AddLearningModal → createLearning → navigate to `/learning`.

2. **Login and view confidence**  
   `/login` → AuthPage (mode LOGIN) → authenticate → `/dashboard` → loadData (getLearningList + getDashboard) → render confidence %, today’s focus, at a glance.

3. **Add applied skill**  
   Dashboard or Learning list → open a learning → `/learning/:id` → LearningDetailPage → refresh() (getLearningById + getOutcomes) → “Add Applied Skill” → AddSkillModal → createOutcome → refresh() → list and progress update.

4. **Session expiry**  
   Any API call returns 401 → apiClient response interceptor removes token and sets `window.location.href = "/login"` → user sees login again.

---

## 11. Configuration Quick Reference

- **Dev server:** `npm run dev` (Vite).  
- **API proxy:** In `vite.config.js`, `/api` → `http://localhost:8080` (path rewritten to drop `/api`).  
- **Build:** `npm run build` → output in `dist/`.  
- **Lint:** `npm run lint` (ESLint).

---
