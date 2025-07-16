# Mood Music

Mood Music is an AI-powered web application that recommends music based on your mood. It consists of a backend (Python/FastAPI) and a frontend (Next.js/React), integrating with Spotify for music recommendations.

## Project Structure

```
.
├── ai-mood-music-backend/   # Backend (FastAPI, Python)
│   └── ...
├── ai-mood-music-frontend/  # Frontend (Next.js, React)
│   └── ...
```

## Getting Started

### Backend

1. Navigate to the backend directory:
   ```bash
   cd ai-mood-music-backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ai-mood-music-frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the frontend app:
   ```bash
   pnpm dev
   ```

## Features
- Chat with an AI agent to get music recommendations based on your mood
- Spotify integration for real music suggestions
- Modern UI with Next.js and Tailwind CSS

## License
MIT 