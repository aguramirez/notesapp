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
## 🌐 Production Deployment

Este proyecto está alojado en el repositorio **[RamirezCura-80b1d7](https://github.com/hirelens-challenges/RamirezCura-80b1d7)**. Para desplegarlo:

### Backend en Railway
1. Haz fork del repositorio a tu cuenta (p. ej. `aguramirez/notes-app`).
2. En Railway crea un nuevo proyecto → *Deploy from GitHub* y selecciona tu fork.
3. Establece **Root Directory** a `/backend`.
4. Configura variables de entorno:
   - `SPRING_DATASOURCE_URL` – URL de la base de datos PostgreSQL que Railway creará.
   - `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD` – credenciales de la base de datos.
   - `JWT_SECRET` – cadena aleatoria segura (`openssl rand -hex 32`).
   - `CORS_ALLOWED_ORIGINS` – URL de tu despliegue en Vercel (ej. `https://<tu-frontend>.vercel.app`).
5. Railway detectará Maven y ejecutará `./mvnw clean package && java -jar target/*.jar`.

### Frontend en Vercel
1. En Vercel crea un nuevo proyecto → *Import Git Repository* e ingresa la URL de tu fork.
2. Define **Root Directory** como `frontend`.
3. Añade la variable de entorno:
   - `VITE_API_BASE_URL` – `https://<tu-backend>.railway.app/api`.
4. Vercel usará `frontend/vercel.json` para reenviar todas las rutas al `index.html`.

Con estos pasos la aplicación quedará disponible en Vercel y Railway sin cambios adicionales.
```
