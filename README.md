# Production-Ready Social OAuth Authentication System

A complete, production-grade social login and authentication system built with **React (Vite)**, **Node.js (Express)**, **Passport.js**, and native **SQLite** with built-in account linking for:
* 🟢 **Google OAuth 2.0**
* 🐱 **GitHub OAuth 2.0**
* 🔵 **Facebook Login**
* 💼 **LinkedIn OAuth 2.0 (OpenID Connect)**

---

## 🌟 Architecture Overview

```
[ React Frontend ] (http://localhost:5173)
       │
       │  1. User clicks "Continue with [Provider]"
       ▼
[ Node.js Express Backend ] (http://localhost:5000)
       │
       │  2. Redirects to Provider Consent Screen with Client ID
       ▼
[ Provider Auth Server (Google / GitHub / Facebook / LinkedIn) ]
       │
       │  3. User authorizes access
       ▼
[ Node.js Callback Endpoint ] (/auth/[provider]/callback)
       │
       │  4. Exchanges Code + Client Secret for Access Token & Profile
       │  5. Finds or creates User in SQLite & links OAuth identities
       │  6. Creates secure HttpOnly session cookie (connect.sid)
       ▼
[ React Protected Dashboard ] (http://localhost:5173/dashboard)
```

---

## 📁 Project Structure

```
login/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── authApi.js      # Credentials-enabled API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Sticky navbar with avatar & logout
│   │   │   ├── ProtectedRoute.jsx # Route guard for private pages
│   │   │   ├── LoadingSpinner.jsx # Smooth loading animations
│   │   │   └── ProviderIcons.jsx  # Crisp SVG brand logos
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Centralized authentication context
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx   # Modern login UI with live provider status
│   │   │   ├── DashboardPage.jsx # Protected dashboard with user profile & metrics
│   │   │   └── NotFoundPage.jsx  # 404 page
│   │   ├── App.jsx             # React router configuration
│   │   ├── index.css           # Custom CSS design system
│   │   └── main.jsx            # React root
│   ├── index.html
│   └── package.json
│
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   ├── database.js         # SQLite database initialization
│   │   └── passport.js         # Google, GitHub, Facebook & LinkedIn strategies
│   ├── controllers/
│   │   └── authController.js   # Callback redirects, /auth/me, logout logic
│   ├── middleware/
│   │   └── authMiddleware.js   # Route protection & config verification
│   ├── models/
│   │   └── userModel.js        # User find/create & account linking queries
│   ├── routes/
│   │   ├── authRoutes.js       # /auth/google, /auth/github, /auth/facebook, etc.
│   │   └── apiRoutes.js        # Protected sample API routes
│   ├── .env                    # Local secrets (git-ignored)
│   ├── .env.example            # Environment variable template
│   ├── database.sqlite         # Local SQLite database
│   ├── package.json
│   └── server.js               # Express application entry point
│
├── .gitignore                  # Prevents secrets & node_modules from git
└── README.md                   # Documentation & setup guide
```

---

## 🚀 Quick Start (Local Development)

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```
*Backend runs on: `http://localhost:5000`*

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## ⚙️ How to Configure Real OAuth Credentials

Open `server/.env` and fill in the credentials from each respective provider:

### 1. Google OAuth 2.0
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services** > **OAuth consent screen**.
3. Select **External**, enter your App Name and support email. Add the `.../auth/userinfo.email` and `.../auth/userinfo.profile` scopes.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. Set **Authorized JavaScript origins**:
   * `http://localhost:5173`
   * `http://localhost:5000`
7. Set **Authorized redirect URIs**:
   * `http://localhost:5000/auth/google/callback`
8. Copy the **Client ID** and **Client Secret** into `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_secret_here
   ```

---

### 2. GitHub OAuth 2.0
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **OAuth Apps** > **New OAuth App**.
3. Set **Application name**: `AuthSphere Social Login`
4. Set **Homepage URL**: `http://localhost:5173`
5. Set **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
6. Click **Register application**.
7. Copy **Client ID** and generate a new **Client Secret**.
8. Paste them into `server/.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

---

### 3. Facebook / Meta Login
1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Click **My Apps** > **Create App** > Select **Authenticate and request data from users with Facebook Login**.
3. Under **Facebook Login** > **Settings** > **Valid OAuth Redirect URIs**, enter:
   * `http://localhost:5000/auth/facebook/callback`
4. Under **App settings** > **Basic**, copy your **App ID** and **App Secret**.
5. Paste them into `server/.env`:
   ```env
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```

---

### 4. LinkedIn OAuth 2.0 (OpenID Connect)
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
2. Click **Create App**, enter your App Name and link a LinkedIn Page.
3. In the **Products** tab, request access to **Sign In with LinkedIn using OpenID Connect**.
4. In the **Auth** tab, under **Authorized redirect URLs for your app**, add:
   * `http://localhost:5000/auth/linkedin/callback`
5. Copy your **Client ID** and **Primary Client Secret**.
6. Paste them into `server/.env`:
   ```env
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   ```

---

## 🔒 Security Best Practices Implemented

* **Strict Secret Isolation**: Secrets exist solely on the Node.js server. Vite/React has zero exposure to client secrets.
* **HttpOnly Session Cookies**: Prevents client-side scripts from reading or stealing session tokens (XSS protection).
* **Safe Multi-Provider Account Linking**: Automatically links new provider accounts to existing accounts if the verified email matches, eliminating duplicate fragmented profiles.
* **Route Protection**: Client-side `<ProtectedRoute />` prevents unauthenticated visits and eliminates loading flicker.
* **Backend Authentication Guard**: `ensureAuthenticated` middleware enforces access control on API routes.
* **Graceful Degradation**: Clear diagnostic alerts if a provider is triggered before `.env` keys are added.

---

## 🌐 Callback URL Reference

| Provider | Development Callback URL | Production Callback URL |
| :--- | :--- | :--- |
| **Google** | `http://localhost:5000/auth/google/callback` | `https://your-api.com/auth/google/callback` |
| **GitHub** | `http://localhost:5000/auth/github/callback` | `https://your-api.com/auth/github/callback` |
| **LinkedIn** | `http://localhost:5000/auth/linkedin/callback` | `https://your-api.com/auth/linkedin/callback` |
