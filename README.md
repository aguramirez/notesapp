# 📒 NotesApp

A modern, high-performance Full Stack Single Page Application (SPA) designed to create, manage, archive, and categorize personal notes in real-time. Built with a premium dark mode, responsive mobile-first design, installable PWA capabilities, and optimized Stale-While-Revalidate caching.

---

## 🚀 Key Features

* **🎨 Rich & Premium Aesthetics**: Clean dark mode interfaces styled with custom vanilla CSS, smooth micro-animations, glassmorphic menus, and zero generic placeholders.
* **📱 Mobile-First Responsive Design**: 
  * Fully adapted layouts for mobile screens.
  * Side drawer menu positioned ergonomically on the **right** for mobile viewports, opened by a header hamburger menu button.
* **📂 Tag & Category Management**: Seamless multi-selection filter chips. Dropdown selectors in creation modals open **upward** to avoid screen clipping and prevent modal body scrolling.
* **🔒 Secure Password Fields**: Built-in interactive show/hide password eye buttons on the login and registration forms for improved input verification.
* **⚡ Instant Tab & Category Switches (SWR Cache)**: Employs **Stale-While-Revalidate** in-memory caching. Transitions between categories and active/archived screens occur instantly without flashing annoying loading skeleton blocks, updating in the background.
* **📲 Progressive Web App (PWA)**: Natively installable on both **Android** and **iOS/iPhone** devices, equipped with a custom offline assets caching service worker and high-quality branding icons.

---

## 🔑 Test Credentials

For quick evaluation, you can use the pre-configured test account or register a new one:

* **Username**: `agustin`
* **Password**: `ensolvers`

---

## 🛠️ Technology Stack

* **Frontend**: React (TypeScript), Vite, Vanilla CSS, Lucide Icons, SweetAlert2.
* **Backend**: Java 17, Spring Boot 3.2.x, Spring Data JPA, Spring Security (JWT Auth).
* **Database**: SQLite (for local development), PostgreSQL (for production/live deployment).

---

## 💻 Running Locally

### Prerequisites
* Java JDK 17
* Maven 3.9+
* Node.js 18+ (npm 10+)

### Automatic Startup
To build the backend and start both servers simultaneously:
```bash
./run.sh
```
This script will:
1. Build the Spring Boot API.
2. Launch the Spring Boot backend on `http://localhost:8080` using a local `notes.db` SQLite database file.
3. Install frontend node modules and start the Vite dev server at `http://localhost:5174` (or `http://localhost:5173`).
4. Cleanly exit both servers simultaneously when pressing `Ctrl + C`.

### Manual Startup
* **Backend API**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
* **Frontend Client**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🌐 Production Deployment

This project is prepared with environment-variable overrides for quick, containerized production deployments.

### 1. Backend (com.ensolvers.notes) on Railway
1. Create a **New Project** on [Railway](https://railway.app) and link your GitHub repository.
2. Set the service **Root Directory** to `/backend`.
3. In the service **Variables** section, configure the following environment variables:
   * `CORS_ALLOWED_ORIGINS`: Set this to your frontend's Vercel URL (e.g. `https://notes-app.vercel.app`).
   * `JWT_SECRET`: A secure custom secret key.
   * *(Optional)* If you connect a Railway PostgreSQL database service to the project, the schema will build automatically. If not, it will fall back to the default external Neon PostgreSQL.

### 2. Frontend (Vite Client) on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend` (it will auto-detect Vite).
3. In **Environment Variables**, add:
   * `VITE_API_BASE_URL`: Set this to your Railway deployment API URL with the `/api` suffix (e.g. `https://notes-backend.up.railway.app/api`).
4. Vercel will use the custom `vercel.json` rewrites to enable SPA client routing reloads.
