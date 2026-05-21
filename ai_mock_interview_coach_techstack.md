# AI Mock Interview Coach — Complete Tech Stack

> **Project Type:** Generative AI · Voice + LLM · Full-Stack Web Application
> **Build Cost:** $0 (100% free tiers)
> **Estimated Build Time:** 10–14 days (solo beginner)

---

## Table of Contents

1. [Frontend](#1-frontend)
2. [Backend](#2-backend)
3. [Speech & Audio Processing](#3-speech--audio-processing)
4. [Generative AI / LLM Layer](#4-generative-ai--llm-layer)
5. [Database & Storage](#5-database--storage)
6. [DevOps & Containerization](#6-devops--containerization)
7. [Deployment Platforms](#7-deployment-platforms)
8. [Development Tools](#8-development-tools)
9. [Version Summary Table](#9-version-summary-table)

---

## 1. Frontend

| Technology | Version | Purpose | Free |
|---|---|---|---|
| **React** | `19.1.0` | UI component library & SPA framework | ✅ |
| **Vite** | `6.3.5` | Frontend build tool & dev server | ✅ |
| **TypeScript** | `5.8.3` | Static typing for React components | ✅ |
| **TailwindCSS** | `4.1.7` | Utility-first CSS styling | ✅ |
| **Axios** | `1.7.9` | HTTP client for API calls | ✅ |
| **React Router DOM** | `7.6.0` | Client-side routing | ✅ |
| **Zustand** | `5.0.4` | Lightweight global state management | ✅ |
| **Framer Motion** | `12.12.1` | Smooth UI animations & transitions | ✅ |
| **React Hook Form** | `7.55.0` | Performant form management | ✅ |
| **Lucide React** | `0.511.0` | Clean open-source icon library | ✅ |
| **React Toastify** | `11.0.5` | Toast notification system | ✅ |

### Browser APIs Used (Built-in, No Install Required)

- **MediaRecorder API** — captures microphone audio in-browser
- **Web Audio API** — real-time audio visualization (waveform display)
- **Blob / File API** — handles audio blob before sending to backend

---

## 2. Backend

| Technology | Version | Purpose | Free |
|---|---|---|---|
| **Python** | `3.12.4` | Core backend language | ✅ |
| **FastAPI** | `0.115.12` | High-performance async REST API framework | ✅ |
| **Uvicorn** | `0.34.3` | ASGI server to run FastAPI | ✅ |
| **Pydantic** | `2.11.5` | Data validation & request/response schemas | ✅ |
| **Python-Multipart** | `0.0.20` | Handles multipart file uploads (audio) | ✅ |
| **HTTPX** | `0.28.1` | Async HTTP client for external API calls | ✅ |
| **Python-dotenv** | `1.1.0` | Environment variable management | ✅ |
| **Loguru** | `0.7.3` | Clean structured logging | ✅ |

---

## 3. Speech & Audio Processing

| Technology | Version | Purpose | Free |
|---|---|---|---|
| **OpenAI Whisper** | `20240930` | Speech-to-text transcription (runs locally) | ✅ |
| **FFmpeg** | `7.1` | Audio format conversion (WebM → WAV/MP3) | ✅ |
| **PyDub** | `0.25.1` | Python audio manipulation library | ✅ |
| **SoundFile** | `0.12.1` | Read/write audio files | ✅ |

### Whisper Model Size Recommendation

| Model | Size | Speed | Accuracy | Best For |
|---|---|---|---|---|
| `tiny` | 39 MB | Fastest | Low | Quick testing only |
| `base` | 74 MB | Fast | Moderate | Development |
| `small` | **244 MB** | **Balanced** | **Good** | **Recommended ✅** |
| `medium` | 769 MB | Slow | High | High-accuracy prod |

> Use `whisper-small` for the best balance of speed and accuracy on a local machine.
> On your RTX 4060, Whisper runs on GPU via CUDA — transcription will be near real-time.

---

## 4. Generative AI / LLM Layer

| Technology | Version / Model | Purpose | Free |
|---|---|---|---|
| **Google Generative AI SDK** | `0.8.5` | Official Python SDK for Gemini | ✅ |
| **Gemini 2.0 Flash** | `gemini-2.0-flash` | Question generation + answer evaluation | ✅ |
| **LangChain Core** | `0.3.63` | LLM prompt chaining & output parsing | ✅ |
| **LangChain Google GenAI** | `2.1.4` | LangChain integration with Gemini | ✅ |

### LLM Task Breakdown

| Task | Model | Strategy |
|---|---|---|
| Generate interview questions from job role | Gemini 2.0 Flash | Structured prompt with role + difficulty |
| Evaluate transcribed answer (accuracy, depth) | Gemini 2.0 Flash | Rubric-based evaluation prompt |
| Generate detailed improvement feedback | Gemini 2.0 Flash | Chain-of-thought feedback prompt |
| Suggest ideal answer for comparison | Gemini 2.0 Flash | Few-shot prompted ideal response |

### Free Tier Limits (Gemini 2.0 Flash)

- **15 requests / minute**
- **1 million tokens / day**
- **No credit card required**

---

## 5. Database & Storage

| Technology | Version | Purpose | Free |
|---|---|---|---|
| **SQLite** | `3.46.x` (built-in) | Stores session history, scores, user data | ✅ |
| **SQLAlchemy** | `2.0.41` | ORM for database interaction | ✅ |
| **Alembic** | `1.16.2` | Database schema migrations | ✅ |
| **aiofiles** | `24.1.0` | Async file I/O for saving audio blobs | ✅ |

### Database Schema Overview

```
sessions          → id, role, difficulty, created_at
questions         → id, session_id, question_text, category
answers           → id, question_id, audio_path, transcript, score, feedback
```

> SQLite is used for simplicity and portability. No server setup required — the DB is a single `.db` file.

---

## 6. DevOps & Containerization

| Technology | Version | Purpose | Free |
|---|---|---|---|
| **Docker** | `27.5.1` | Containerize backend + frontend | ✅ |
| **Docker Compose** | `2.35.1` | Orchestrate multi-container setup | ✅ |

### Recommended Docker Compose Services

```yaml
services:
  backend:    # FastAPI + Whisper + LangChain
  frontend:   # React (served via Nginx)
```

> Keep Whisper model weights in a Docker volume so they're not re-downloaded on every rebuild.

---

## 7. Deployment Platforms

### Frontend

| Platform | Plan | Notes |
|---|---|---|
| **Vercel** | Free (Hobby) | Best DX, auto-deploys from GitHub |
| **Netlify** | Free tier | Alternative, generous bandwidth |
| **GitHub Pages** | Free | Static only, no SSR needed here |

### Backend

| Platform | Plan | Notes |
|---|---|---|
| **Render** | Free tier | 512 MB RAM, spins down after inactivity |
| **Railway.app** | $5 free credits/month | Better cold-start performance |
| **HuggingFace Spaces** | Free (Docker SDK) | Best for ML-heavy apps with Whisper |

> **Recommended combo:** Vercel (frontend) + HuggingFace Spaces Docker (backend + Whisper)
> HuggingFace Spaces provides GPU hours on free tier, making Whisper inference faster.

---

## 8. Development Tools

| Tool | Version | Purpose |
|---|---|---|
| **VS Code** | Latest | Primary IDE |
| **ESLint** | `9.27.0` | JavaScript/TypeScript linting |
| **Prettier** | `3.5.3` | Code formatting |
| **Ruff** | `0.11.12` | Fast Python linter + formatter |
| **Git** | `2.49.x` | Version control |
| **GitHub** | — | Remote repository + CI/CD via Actions |
| **Postman / Bruno** | Latest | API testing |
| **TablePlus** | Free tier | SQLite database GUI viewer |

---

## 9. Version Summary Table

| Layer | Technology | Version |
|---|---|---|
| Language (Frontend) | TypeScript | `5.8.3` |
| Language (Backend) | Python | `3.12.4` |
| Frontend Framework | React | `19.1.0` |
| Build Tool | Vite | `6.3.5` |
| Styling | TailwindCSS | `4.1.7` |
| State Management | Zustand | `5.0.4` |
| Backend Framework | FastAPI | `0.115.12` |
| ASGI Server | Uvicorn | `0.34.3` |
| Data Validation | Pydantic | `2.11.5` |
| Speech-to-Text | OpenAI Whisper | `20240930` |
| Audio Processing | PyDub + FFmpeg | `0.25.1` / `7.1` |
| LLM | Gemini 2.0 Flash | `gemini-2.0-flash` |
| LLM Orchestration | LangChain Core | `0.3.63` |
| AI SDK | Google GenAI SDK | `0.8.5` |
| Database | SQLite + SQLAlchemy | `3.x` / `2.0.41` |
| Containerization | Docker + Compose | `27.5.1` / `2.35.1` |
| Deployment (FE) | Vercel | Free Hobby |
| Deployment (BE) | HuggingFace Spaces | Free Docker |

---

## Architecture at a Glance

```
User (Browser)
    │
    ├─── React 19 + Vite ──────────────────────── Vercel
    │         │
    │    MediaRecorder API (audio capture)
    │         │
    │    [Audio Blob → multipart/form-data]
    │         │
    ▼         ▼
FastAPI (Python 3.12) ─────────────────── HuggingFace Spaces (Docker)
    │
    ├── Whisper small  →  transcript (text)
    │
    ├── LangChain + Gemini 2.0 Flash
    │       ├── Question Generator
    │       ├── Answer Evaluator
    │       └── Feedback Generator
    │
    └── SQLAlchemy → SQLite (.db file)
```

---

*Last updated: May 2026 · Built for Skibidi's GenAI Portfolio*
