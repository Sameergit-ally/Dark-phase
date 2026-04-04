# 🛡️ DarkGuard — AI-Powered Dark Pattern Detection

DarkGuard is a full-stack AI platform that detects, highlights, and reports dark patterns (deceptive UI tricks) on websites in real-time. It protects Indian users from manipulative UI design and enables CCPA 2023-compliant complaint filing.

## 🏗️ Architecture

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Chrome Extension │────▶│  FastAPI Backend │────▶│    Supabase      │
│  (Manifest V3)    │     │  (Python)        │     │  (PostgreSQL)    │
└──────────────────┘     └────────┬────────┘     └──────────────────┘
                                  │
┌──────────────────┐     ┌────────┴────────┐     ┌──────────────────┐
│  React Dashboard  │────▶│   Groq LLM API  │     │     Redis        │
│  (Vite + TS)      │     │  (llama-3.3-70b)│     │   (Cache/Broker) │
└──────────────────┘     └─────────────────┘     └──────────────────┘
```

## 📁 Project Structure

```
commerce/
├── darkguard-backend/       # FastAPI Python backend
│   ├── main.py              # App entry point
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic (Groq, ML, PDF, etc.)
│   ├── tasks/               # Celery background tasks
│   ├── models/              # Pydantic schemas
│   ├── templates/           # Jinja2 PDF templates
│   ├── ml/                  # ML training & ONNX export
│   └── Dockerfile
├── darkguard-frontend/      # React + TypeScript + Vite
│   └── src/
│       ├── pages/           # 7 pages (Landing, Dashboard, etc.)
│       ├── components/      # Reusable UI components
│       ├── hooks/           # React Query hooks
│       ├── store/           # Zustand state management
│       └── lib/             # API client, Supabase, utils
├── darkguard-extension/     # Chrome Extension (Manifest V3)
│   ├── content.js           # DOM scanner + highlighter
│   ├── background.js        # Service worker
│   ├── popup/               # Extension popup UI
│   └── styles/              # Overlay CSS
├── supabase/
│   └── schema.sql           # Database schema with RLS
└── docker-compose.yml       # Redis + backend services
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis (for Celery)
- Supabase account (free tier)
- Groq API key (free at console.groq.com)

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
3. Create a Storage bucket named `complaints`
4. Copy your project URL, anon key, and service role key

### 2. Backend Setup

```bash
cd darkguard-backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# Copy and edit .env
copy .env.example .env
# Fill in your API keys in .env

# Run the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd darkguard-frontend

# Install dependencies
npm install

# Copy and edit .env
# Edit .env with your Supabase credentials

# Run dev server
npm run dev
```

### 4. Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `darkguard-extension/` folder
4. The DarkGuard shield icon appears in your toolbar

### 5. Docker (Optional)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 🔑 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLM inference | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `REDIS_URL` | Redis connection URL | ✅ |
| `GOOGLE_VISION_API_KEY` | Google Vision for OCR | Optional |
| `RESEND_API_KEY` | Resend for email digests | Optional |
| `TWILIO_ACCOUNT_SID` | Twilio for WhatsApp | Optional |

### Frontend (.env)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `/api/v1`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/analyze` | Analyze a page for dark patterns |
| `GET` | `/api/v1/trust-score/{domain}` | Get domain trust score |
| `GET` | `/api/v1/leaderboard` | Public leaderboard |
| `POST` | `/api/v1/complaints/generate` | Generate CCPA complaint |
| `GET` | `/api/v1/complaints` | List user's complaints |
| `POST` | `/api/v1/community/report` | Submit community report |
| `GET` | `/api/v1/community/leaderboard` | Community points leaderboard |
| `POST` | `/api/v1/audit/start` | Start B2B website audit |
| `GET` | `/api/v1/audit/{job_id}/status` | Check audit status |
| `GET` | `/api/v1/user/preferences` | Get user profile |
| `PUT` | `/api/v1/user/preferences` | Update preferences |

## ✨ Features

1. **Real-Time DOM Scanner** — Scans every page for dark patterns
2. **Groq AI Classification** — LLM-powered detection with JSON mode
3. **Visual Highlighter** — Color-coded borders + tooltips on deceptive elements
4. **Site Trust Scores** — A-F grading for every domain
5. **Pre-Purchase Alerts** — Warning modal before checkout
6. **1-Click CCPA Complaints** — PDF generation with legal references
7. **Community Crowdsource** — Report missed patterns, earn points
8. **Multilingual Detection** — Hindi, Tamil, Bengali, Telugu, Marathi
9. **Weekly Digest** — Email/WhatsApp summary of your protection
10. **B2B Self-Audit** — Crawl & audit your own website

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, Celery, Redis
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI/LLM:** Groq API (llama-3.3-70b-versatile)
- **ML:** scikit-learn, ONNX Runtime
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Extension:** Manifest V3, vanilla JS
- **PDF:** WeasyPrint + Jinja2
- **Charts:** Recharts

## 📄 License

MIT License — Built with ❤️ to protect consumers from dark patterns.
