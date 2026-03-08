# AnalyserX 🚀
> AI-Powered Resume Analyzer — Final Year Project

AnalyserX is a full-stack web application that uses NLP and machine learning to parse resumes, extract skills, compute ATS scores, match against job descriptions, and provide actionable AI-generated improvement suggestions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Python Flask, SQLAlchemy, JWT |
| NLP / AI | scikit-learn (TF-IDF), keyword extraction |
| PDF | PyPDF2 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
analyserx/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models/models.py     # SQLAlchemy models (User, Resume)
│   │   ├── routes/
│   │   │   ├── auth.py          # /api/auth  — register, login, me, update
│   │   │   ├── resume.py        # /api/resume — upload, list, get, delete, compare
│   │   │   └── analytics.py     # /api/analytics — summary & charts
│   │   └── utils/
│   │       ├── analyzer.py      # NLP analysis engine (TF-IDF, ATS, suggestions)
│   │       └── pdf_parser.py    # PyPDF2 text extraction
│   ├── run.py                   # Entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx              # Router + auth guards
│   │   ├── index.js
│   │   ├── index.css            # Global styles + Tailwind
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/api.js         # Axios + JWT interceptor
│   │   ├── components/layout/Layout.jsx  # Sidebar navigation
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Upload.jsx
│   │       ├── Results.jsx
│   │       ├── Analytics.jsx
│   │       └── Settings.jsx
│   ├── tailwind.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🚀 Quick Start

### Option A — Docker (Recommended)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd analyserx

# 2. Start everything
docker-compose up --build

# App is now running at:
#   Frontend → http://localhost:3000
#   Backend  → http://localhost:5000
```

### Option B — Manual (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py                  # Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm start                      # Runs on http://localhost:3000
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user (JWT required) |
| PUT | `/api/auth/update` | Update profile (JWT required) |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload PDF + job description |
| GET | `/api/resume/list` | List user's resumes |
| GET | `/api/resume/<id>` | Get single resume with analysis |
| DELETE | `/api/resume/<id>` | Delete a resume |
| POST | `/api/resume/compare` | Compare multiple resumes |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Dashboard charts + summary stats |

---

## 🧠 How the AI Analysis Works

1. **PDF Parsing** — PyPDF2 extracts raw text from the uploaded PDF.

2. **Skill Extraction** — A vocabulary of 80+ tech and soft skills is matched via regex against the resume text.

3. **Match Score** — TF-IDF vectorization + cosine similarity between resume and job description text gives a percentage match (0–100%).

4. **ATS Score** — Rule-based scoring checks for: contact info, education section, experience section, word count, and special character density. Each missing element subtracts points from 100.

5. **Skill Gap Analysis** — Skills required by the job description but absent in the resume are flagged as gaps.

6. **AI Suggestions** — Heuristics generate personalized improvement tips: missing sections, weak action verbs, lack of quantified achievements, keyword alignment, etc.

---

## 🎨 UI Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | JWT-based sign-in |
| Register | `/register` | Create account |
| Dashboard | `/dashboard` | Resume list + stats |
| Upload | `/upload` | PDF upload + job description |
| Results | `/results/:id` | Full analysis report |
| Analytics | `/analytics` | Charts & trends |
| Settings | `/settings` | Profile & password |

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 1 hour by default
- File uploads validated (PDF only, 16MB max)
- All resume routes require valid JWT

---

## 📦 Environment Variables

Copy `.env` and update values:
```env
SECRET_KEY=your-flask-secret
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///analyserx.db   # or postgresql://...
```

---

## 👨‍🎓 For Examiners

This project demonstrates:
- **Full-stack development** (React + Flask)
- **NLP & ML** (TF-IDF, cosine similarity, keyword extraction)
- **RESTful API design** with JWT authentication
- **Docker containerization** for production deployment
- **Responsive UI** with Tailwind CSS
- **Data visualization** with Recharts

---

*Built with ❤️ as a Final Year Project*
