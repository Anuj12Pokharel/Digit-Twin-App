# Digit Twin

Your personal AI replica — a voice-driven Digital Twin that speaks, remembers, and acts on your behalf in both **Personal** and **Work** modes.

---

## Architecture

```
anuj/
├── backend/          FastAPI REST API  (Python 3.11+)
│   ├── main.py       All routes
│   ├── models.py     SQLAlchemy ORM models
│   ├── schemas.py    Pydantic request/response schemas
│   ├── auth.py       JWT authentication
│   ├── database.py   SQLite (swap to Postgres for prod)
│   ├── tools.py      OpenAI Realtime function-calling tools
│   └── services/
│       ├── jira_service.py
│       ├── google_calendar_service.py
│       └── knowledge_service.py  (ChromaDB RAG brain)
│
└── frontend/         Expo React Native app  (iOS / Android / Web)
    ├── App.js        Navigation state machine
    └── src/
        ├── screens/
        │   ├── SplashScreen.js
        │   ├── OnboardingScreen.js
        │   ├── GetStartedScreen.js
        │   ├── SignUpScreen.js
        │   ├── LoginScreen.js
        │   ├── HomeScreen.js      (voice chat + mode switch)
        │   ├── SettingsScreen.js  (Jira / Google Calendar)
        │   └── DocumentEditor.js
        ├── api/api.js             Axios client + auth helpers
        └── constants/Theme.js
```

---

## Quick Start

### 1 — Prerequisites

| Tool | Version |
|------|---------|
| Python | ≥ 3.11 |
| Node.js | ≥ 18 |
| Expo CLI | `npm install -g expo-cli` |

---

### 2 — Backend Setup

```powershell
# From the project root  c:\Users\hp\Desktop\anuj
cd backend

# Create & activate a virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy the environment template and fill in your keys
copy .env.example .env
```

Edit `backend/.env`:

```env
OPENAI_API_KEY=sk-...
SECRET_KEY=a-long-random-string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Start the server:

```powershell
# From the project root (NOT inside backend/)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8003
```

Interactive API docs → **http://localhost:8003/docs**

---

### 3 — Frontend Setup

```powershell
cd frontend
npm install
```

Open `src/api/api.js` and set `API_BASE_URL`:

```js
// For the web simulator (same machine)
const API_BASE_URL = 'http://localhost:8003';

// For a physical device on the same Wi-Fi
const API_BASE_URL = 'http://192.168.X.X:8003';
```

Start the dev server:

```powershell
npx expo start
```

| Target | Command |
|--------|---------|
| Web browser | Press `w` |
| iOS simulator | Press `i` (macOS + Xcode required) |
| Android emulator | Press `a` |
| Physical device | Scan QR with Expo Go app |

---

## Navigation Flow

```
App launch
  └─ First time    → Splash → Onboarding → GetStarted → SignUp / Login → Home
  └─ Returning     → Login → Home
  └─ Already authed→ Home (direct)
```

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | OAuth2 form → JWT |
| GET | `/me` | ✓ | Current user profile |
| PATCH | `/users/me` | ✓ | Update profile / mode |
| POST | `/jira/connect` | ✓ | Save Jira credentials |
| GET | `/jira/issues` | ✓ | Fetch assigned issues |
| POST | `/google/connect` | ✓ | Exchange OAuth code |
| GET | `/google/calendar/events` | ✓ | Upcoming events |
| GET/POST | `/tasks` | ✓ | List / create tasks |
| PATCH/DELETE | `/tasks/{id}` | ✓ | Update / delete task |
| GET/POST | `/documents` | ✓ | List / create docs |
| PATCH/DELETE | `/documents/{id}` | ✓ | Update / delete doc |
| POST | `/chat-completions` | ✓ | Text chat with AI Twin |
| POST | `/auth/realtime-session` | ✓ | OpenAI Realtime voice session token |
| POST | `/switch-mode` | ✓ | Toggle Personal ↔ Work |

---

## Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `OPENAI_API_KEY` | ✅ | — | For chat + RAG embeddings |
| `SECRET_KEY` | ✅ | hardcoded fallback | **Change in production** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | `10080` (7 days) | JWT TTL |
| `GOOGLE_CLIENT_ID` | — | — | For Google Calendar OAuth |
| `GOOGLE_CLIENT_SECRET` | — | — | For Google Calendar OAuth |

---

## Known Platform Notes

- **`react-native-webrtc`** is guarded behind a `Platform.OS !== 'web'` check in `HomeScreen.js` — voice calling works on iOS/Android only.
- The **ChromaDB** vector store (`knowledge_service.py`) is lazily initialised — the backend starts cleanly with no API key; an error is raised only when a document is ingested or queried.
- **SQLite** is used by default (`digital_twin.db` in the backend folder). For production, replace `SQLALCHEMY_DATABASE_URL` in `database.py` with a PostgreSQL URI.

---

## License

MIT
