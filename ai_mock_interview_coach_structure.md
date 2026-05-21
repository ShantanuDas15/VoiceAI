# AI Mock Interview Coach — Folder & File Structure

> **Stack:** React 19 + Vite · FastAPI · Whisper · Gemini 2.0 Flash · LangChain · SQLite · Docker
> **Pattern:** Monorepo · Frontend/Backend separated · Feature-based frontend · Layer-based backend

---

## Root Monorepo Layout

```
ai-mock-interview-coach/
│
├── frontend/                     # React 19 + Vite + TypeScript
├── backend/                      # FastAPI + Whisper + LangChain
├── docker-compose.yml            # Orchestrates frontend + backend containers
├── docker-compose.dev.yml        # Dev overrides (hot reload, volume mounts)
├── .gitignore                    # Root-level ignores
├── .env.example                  # Template for all env vars
├── README.md                     # Project overview + setup guide
└── ARCHITECTURE.md               # System design + data flow docs
```

---

## Frontend — `frontend/`

```
frontend/
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg                  # App logo asset
│   └── manifest.json             # PWA manifest (optional)
│
├── src/
│   │
│   ├── main.tsx                  # React app entry point, renders <App/>
│   ├── App.tsx                   # Root component, router setup
│   ├── vite-env.d.ts             # Vite environment type declarations
│   │
│   ├── assets/                   # Static assets
│   │   ├── icons/
│   │   │   ├── mic.svg
│   │   │   └── waveform.svg
│   │   └── images/
│   │       └── hero-bg.svg
│   │
│   ├── components/               # Reusable UI components
│   │   │
│   │   ├── common/               # App-wide generic components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.types.ts
│   │   │   ├── Badge/
│   │   │   │   └── Badge.tsx
│   │   │   ├── Card/
│   │   │   │   └── Card.tsx
│   │   │   ├── Loader/
│   │   │   │   ├── Loader.tsx    # Spinner / skeleton states
│   │   │   │   └── Skeleton.tsx
│   │   │   ├── Modal/
│   │   │   │   └── Modal.tsx
│   │   │   ├── ProgressBar/
│   │   │   │   └── ProgressBar.tsx
│   │   │   └── Tooltip/
│   │   │       └── Tooltip.tsx
│   │   │
│   │   ├── layout/               # Page-level layout wrappers
│   │   │   ├── Navbar.tsx        # Top navigation bar
│   │   │   ├── Sidebar.tsx       # Session history sidebar
│   │   │   ├── PageWrapper.tsx   # Consistent page padding/max-width
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── interview/            # Feature: interview session UI
│   │   │   ├── QuestionCard.tsx  # Displays current interview question
│   │   │   ├── QuestionTimer.tsx # Countdown timer per question
│   │   │   ├── DifficultyBadge.tsx
│   │   │   └── RoleSelector.tsx  # Job role + difficulty picker form
│   │   │
│   │   ├── recorder/             # Feature: audio recording
│   │   │   ├── AudioRecorder.tsx # Main record/stop/replay component
│   │   │   ├── Waveform.tsx      # Web Audio API waveform visualizer
│   │   │   ├── RecordingTimer.tsx
│   │   │   └── PlaybackControls.tsx
│   │   │
│   │   ├── feedback/             # Feature: AI feedback display
│   │   │   ├── FeedbackPanel.tsx # Full feedback layout
│   │   │   ├── ScoreGauge.tsx    # Visual score ring/gauge
│   │   │   ├── TranscriptBox.tsx # Displays Whisper transcript
│   │   │   ├── ImprovementList.tsx
│   │   │   └── IdealAnswerBox.tsx
│   │   │
│   │   └── history/              # Feature: past sessions
│   │       ├── SessionList.tsx   # List of past interview sessions
│   │       ├── SessionCard.tsx   # Individual session summary card
│   │       └── SessionDetail.tsx # Full session Q&A review
│   │
│   ├── pages/                    # Route-level page components
│   │   ├── HomePage.tsx          # Landing / role selection
│   │   ├── InterviewPage.tsx     # Active interview session
│   │   ├── FeedbackPage.tsx      # Post-answer AI feedback view
│   │   ├── SessionReviewPage.tsx # Full session history review
│   │   ├── DashboardPage.tsx     # Score history + progress charts
│   │   └── NotFoundPage.tsx      # 404
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAudioRecorder.ts   # MediaRecorder API wrapper hook
│   │   ├── useWaveform.ts        # Web Audio API visualizer hook
│   │   ├── useInterview.ts       # Interview session state + API calls
│   │   ├── useFeedback.ts        # Feedback fetch + parsing hook
│   │   └── useSessionHistory.ts  # Past sessions fetch hook
│   │
│   ├── store/                    # Zustand global state
│   │   ├── interviewStore.ts     # Active session: questions, answers, status
│   │   ├── feedbackStore.ts      # Current feedback data
│   │   └── uiStore.ts            # UI state: loading, modals, toasts
│   │
│   ├── services/                 # API service layer (Axios calls)
│   │   ├── api.ts                # Axios instance + base config + interceptors
│   │   ├── interviewService.ts   # POST /sessions, GET /questions
│   │   ├── audioService.ts       # POST /answers/submit (multipart audio)
│   │   └── historyService.ts     # GET /sessions, GET /sessions/:id
│   │
│   ├── types/                    # TypeScript interfaces & enums
│   │   ├── interview.types.ts    # Session, Question, Answer interfaces
│   │   ├── feedback.types.ts     # FeedbackResult, Score, Suggestion
│   │   ├── api.types.ts          # API request/response shapes
│   │   └── enums.ts              # Difficulty, Status, Category enums
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── formatTime.ts         # Format seconds → mm:ss
│   │   ├── scoreColor.ts         # Score number → color class mapping
│   │   ├── audioUtils.ts         # Blob → base64, audio duration helpers
│   │   └── constants.ts          # App-wide string/number constants
│   │
│   └── styles/                   # Global CSS
│       ├── index.css             # TailwindCSS directives + base reset
│       └── animations.css        # Custom keyframe animations
│
├── index.html                    # Vite HTML entry point
├── vite.config.ts                # Vite + React plugin config
├── tsconfig.json                 # TypeScript compiler config
├── tsconfig.node.json            # TypeScript config for Vite node scripts
├── tailwind.config.ts            # TailwindCSS theme + plugin config
├── postcss.config.ts             # PostCSS config for Tailwind
├── eslint.config.ts              # ESLint flat config
├── .prettierrc                   # Prettier formatting rules
├── .env                          # VITE_API_BASE_URL (gitignored)
├── .env.example                  # Template: VITE_API_BASE_URL=
├── package.json
├── package-lock.json
└── Dockerfile                    # Frontend production Docker image (Nginx)
```

---

## Backend — `backend/`

```
backend/
│
├── app/                          # Main application package
│   │
│   ├── main.py                   # FastAPI app factory, mounts routers, CORS
│   ├── config.py                 # Settings via pydantic-settings (reads .env)
│   ├── dependencies.py           # FastAPI dependency injection (DB session, etc.)
│   │
│   ├── api/                      # HTTP layer — routers only, no business logic
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py         # Registers all v1 sub-routers
│   │   │   ├── sessions.py       # POST /sessions, GET /sessions, GET /sessions/{id}
│   │   │   ├── questions.py      # POST /sessions/{id}/questions/generate
│   │   │   └── answers.py        # POST /answers/submit, GET /answers/{id}/feedback
│   │   └── health.py             # GET /health — liveness check endpoint
│   │
│   ├── services/                 # Business logic layer
│   │   ├── __init__.py
│   │   ├── interview_service.py  # Orchestrates question gen + answer eval flow
│   │   ├── transcription_service.py  # Whisper: audio file → transcript text
│   │   ├── question_service.py   # LangChain chain: role + difficulty → questions
│   │   ├── evaluation_service.py # LangChain chain: transcript → score + feedback
│   │   └── storage_service.py    # Saves/retrieves audio files from local storage
│   │
│   ├── ai/                       # All GenAI / LLM logic isolated here
│   │   ├── __init__.py
│   │   ├── llm_client.py         # Gemini client init, model config, retry logic
│   │   ├── whisper_client.py     # Whisper model load, transcribe(), GPU/CPU config
│   │   │
│   │   ├── chains/               # LangChain LCEL chains
│   │   │   ├── __init__.py
│   │   │   ├── question_chain.py # Prompt → LLM → output parser for question gen
│   │   │   ├── evaluation_chain.py   # Prompt → LLM → structured feedback
│   │   │   ├── feedback_chain.py     # Chain-of-thought improvement feedback
│   │   │   └── ideal_answer_chain.py # Few-shot ideal answer suggestion
│   │   │
│   │   └── prompts/              # All prompt templates (NOT hardcoded in chains)
│   │       ├── __init__.py
│   │       ├── question_prompts.py   # System + user prompts for Q generation
│   │       ├── evaluation_prompts.py # Rubric-based answer evaluation prompts
│   │       ├── feedback_prompts.py   # CoT improvement feedback prompts
│   │       └── ideal_answer_prompts.py
│   │
│   ├── models/                   # SQLAlchemy ORM models (DB tables)
│   │   ├── __init__.py
│   │   ├── base.py               # DeclarativeBase, common timestamp mixin
│   │   ├── session.py            # InterviewSession model
│   │   ├── question.py           # Question model
│   │   └── answer.py             # Answer model (transcript, score, feedback)
│   │
│   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── session.py            # SessionCreate, SessionRead, SessionDetail
│   │   ├── question.py           # QuestionRead, QuestionGenerateRequest
│   │   ├── answer.py             # AnswerSubmit, AnswerRead, FeedbackResult
│   │   └── common.py             # Shared: PaginatedResponse, ErrorResponse
│   │
│   ├── db/                       # Database setup and session management
│   │   ├── __init__.py
│   │   ├── database.py           # SQLAlchemy engine + async session factory
│   │   └── init_db.py            # Creates all tables on startup
│   │
│   └── utils/                    # Backend utility functions
│       ├── __init__.py
│       ├── audio.py              # FFmpeg conversion: WebM → WAV via PyDub
│       ├── file_manager.py       # Audio upload path management, cleanup
│       ├── exceptions.py         # Custom HTTP exception classes
│       └── logger.py             # Loguru logger config
│
├── migrations/                   # Alembic DB migration files
│   ├── env.py                    # Alembic environment config
│   ├── script.py.mako            # Migration script template
│   └── versions/
│       └── 0001_initial_schema.py    # First migration: create all tables
│
├── tests/                        # Pytest test suite
│   ├── __init__.py
│   ├── conftest.py               # Pytest fixtures: test client, test DB session
│   │
│   ├── unit/                     # Unit tests (no I/O, mocked deps)
│   │   ├── test_question_chain.py
│   │   ├── test_evaluation_chain.py
│   │   ├── test_audio_utils.py
│   │   └── test_schemas.py
│   │
│   └── integration/              # Integration tests (real FastAPI TestClient)
│       ├── test_sessions_api.py
│       ├── test_answers_api.py
│       └── test_health.py
│
├── storage/                      # Runtime audio file storage (gitignored)
│   └── audio/
│       └── .gitkeep              # Keeps folder in git, files gitignored
│
├── alembic.ini                   # Alembic config: points to migrations/
├── pyproject.toml                # Python project metadata + Ruff config
├── requirements.txt              # Pinned production dependencies
├── requirements-dev.txt          # Dev-only: pytest, httpx, ruff, etc.
├── .env                          # Secrets: GEMINI_API_KEY, etc. (gitignored)
├── .env.example                  # Template for all required env vars
├── .ruff.toml                    # Ruff linter + formatter rules
├── Dockerfile                    # Backend production Docker image
└── .dockerignore                 # Excludes storage/, .env, __pycache__, etc.
```

---

## Docker & Deployment Files — Root Level

```
ai-mock-interview-coach/
│
├── docker-compose.yml
│   ├── service: backend          # Builds backend/Dockerfile, port 8000
│   └── service: frontend         # Builds frontend/Dockerfile, port 80
│
├── docker-compose.dev.yml        # Dev override: hot reload, volume mounts
│   ├── service: backend          # uvicorn --reload, mounts ./backend/app
│   └── service: frontend         # Vite dev server, mounts ./frontend/src
│
└── nginx/
    └── nginx.conf                # Nginx config: serve React build, proxy /api → backend
```

---

## Environment Variables Reference

### `backend/.env.example`

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Whisper
WHISPER_MODEL_SIZE=small
WHISPER_DEVICE=cuda                  # or cpu

# App
APP_ENV=development                  # development | production
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:5173

# DB
DATABASE_URL=sqlite+aiosqlite:///./storage/interview_coach.db

# Storage
AUDIO_UPLOAD_DIR=./storage/audio
MAX_AUDIO_SIZE_MB=10
```

### `frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Key Design Decisions

### Why `app/ai/` isolated from `app/services/`?

AI layer holds only LLM + Whisper logic.
Service layer handles business rules + DB.
Swap Gemini → another LLM later without touching services.

### Why `app/ai/prompts/` as own module?

Prompts are first-class artifacts — version-controlled, reviewable, tunable.
Hardcoding prompts inside chains = untestable, unmaintainable.

### Why feature-based components in frontend?

`components/recorder/`, `components/feedback/`, `components/interview/`
Each feature folder self-contained — easy to find, easy to extend.

### Why `services/` in frontend separate from `store/`?

Services = HTTP calls only (Axios).
Store = state management only (Zustand).
Hooks wire them together per component need.
No Axios calls inside Zustand store — clean separation.

---

## File Count Summary

| Area | Files |
|---|---|
| Frontend (`src/`) | ~48 files |
| Backend (`app/`) | ~37 files |
| Tests | ~8 files |
| Config / Docker / Root | ~16 files |
| **Total** | **~109 files** |

---

*Last updated: May 2026 · AI Mock Interview Coach · Skibidi's GenAI Portfolio*
