# 🎙️ AI Mock Interview Coach

> A GenAI-powered mock interview platform with voice recording, local Whisper transcription, and real-time feedback using Groq's high-speed Llama 3.3 model.

---

## 🌟 Features

- **Real-time Voice Capture**: Record your answers directly from the browser using the MediaRecorder API.
- **Fast, Local Transcription**: Uses OpenAI's Whisper model (GPU accelerated) to convert your speech into text near-instantaneously.
- **Intelligent Feedback**: Leverages Groq (Llama 3.3) for rapid, structured feedback on your answers, including a comprehensive score and actionable improvements.
- **Dynamic Question Generation**: Automatically generates role-specific interview questions based on your chosen difficulty level.
- **Session Tracking**: Built-in SQLite database to seamlessly manage interview sessions, scores, and past feedback.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router DOM

### Backend
- **Framework**: FastAPI + Python 3.12
- **AI / LLM**: LangChain + Groq API (Llama 3.3)
- **Speech-to-Text**: Local OpenAI Whisper
- **Database**: SQLite + SQLAlchemy + Alembic

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **GPU Support**: NVIDIA Container Toolkit for accelerated Whisper inference

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your host machine:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) (for GPU acceleration on Linux/WSL)
- A [Groq API Key](https://console.groq.com/keys)

## 🚀 Getting Started

The easiest way to get the full stack up and running is by using Docker Compose.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai-mock-interview-coach.git
cd ai-mock-interview-coach
```

### 2. Configure Environment Variables
Copy the example environment files for both the backend and frontend:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Next, open `backend/.env` and securely add your Groq API Key:
```env
GROQ_API_KEY=gsk_your_api_key_here
```

*(Note: The `backend/.env` is safely ignored by Git to prevent secrets from leaking.)*

### 3. Start the Application
Run the following command to build and start the containers. This will download the required Whisper models and start both the backend API and frontend UI.
```bash
docker compose up --build
```

### 4. Access the App
Once the containers are successfully running, you can access the stack at:
- **Frontend Web App**: [http://localhost](http://localhost) (Served via Nginx on port 80)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📂 Project Structure

```text
.
├── backend/                  # FastAPI Application
│   ├── app/                  # Main application source code
│   │   ├── api/              # API Route handlers (sessions, questions, answers)
│   │   ├── ai/               # AI integrations (LLM clients, Prompts)
│   │   └── db/               # SQLAlchemy Models & Migrations
│   ├── storage/              # SQLite DB and audio file uploads (ignored by Git)
│   ├── Dockerfile            # Backend container definition
│   └── requirements.txt
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Main application layouts
│   │   └── services/         # API integration layer
│   ├── Dockerfile            # Multi-stage build (Vite + Nginx)
│   └── package.json
├── docker-compose.yml        # Orchestrates the frontend and backend services
└── README.md                 # You are here!
```

## 🔒 Security & Deployment Notes

- **Environment Variables**: Never commit `.env` files. The project relies on variables injected via `.env` files or your deployment host's secrets manager.
- **CORS Setup**: In a production environment, ensure you update the `ALLOWED_ORIGINS` variable in your backend `.env` file to strictly match your frontend's public domain.

## 📄 License

This project is licensed under the MIT License.
