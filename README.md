# 🤖 Cypherdon — AI-Powered Job Application Automation

<div align="center">

**Automate your job hunt. From resume parsing to cold emails — all AI-powered.**

[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-darkgreen?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-blue?style=for-the-badge&logo=telegram)](https://core.telegram.org/bots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Telegram Bot](#-telegram-bot)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🧠 Overview

Cypherdon is a **polyglot microservices platform** that automates the end-to-end job application process:

1. **Parse** your resume and get an ATS compatibility score
2. **Match** your profile against job descriptions using a weighted scoring algorithm
3. **Generate** personalized cold emails using AI (GPT-4o-mini)
4. **Queue & send** those emails via a rate-limited SMTP scheduler
5. **Control everything** from a Telegram bot — no web browser needed

---

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js     │────▶│  Spring Boot 4   │────▶│  FastAPI         │
│  Frontend    │     │  (Java 21)       │     │  (Python 3.10)   │
│  Port: 3000  │     │  Port: 8080      │     │  Port: 8000      │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │                         ▲
                           │                         │
                           ▼                         │
                    ┌──────────────┐          ┌──────────────┐
                    │  Supabase    │          │  Telegram    │
                    │  PostgreSQL  │          │  Bot         │
                    └──────────────┘          └──────────────┘
```

| Service | Role |
|---------|------|
| **Spring Boot** | Core API gateway, JWT auth, job/application tracking, email queue scheduler |
| **FastAPI** | AI engine — resume parsing (PyMuPDF), ATS scoring, email generation (OpenAI) |
| **Next.js** | Web dashboard with Supabase Auth |
| **Telegram Bot** | Mobile-first, button-driven UI for the entire automation flow |
| **Supabase** | PostgreSQL database + user authentication |

---

## ✨ Features

### Resume Analysis
- PDF text extraction via **PyMuPDF**
- ATS scoring (0–100) based on keyword match, section presence, and quantified achievements
- Actionable improvement suggestions

### Job Matching
- Deterministic scoring algorithm with weighted criteria:
  - Skill match (50%)
  - Role alignment (30%)
  - Experience level (20%)
- Returns match score + missing skills

### AI Cold Email Generation
- Powered by **GPT-4o-mini** with structured JSON output
- Supports multiple tones: `formal` and `startup`
- Personalized per company — mentions specific projects from your resume

### Email Queue System
- Rate-limited: 3/day (free) or 15/day (paid)
- Randomized 10–20 minute send delay (anti-spam)
- Exponential backoff retry (5min → 15min → 45min)
- Async processing via dedicated `ExecutorService` thread pool
- Gmail SMTP with App Password authentication

### Telegram Bot
- 100% inline button-driven — no commands needed
- Upload resume → Select role → Target company → Review AI email → Approve & queue
- Real-time integration with both FastAPI and Spring Boot

### Security
- Supabase JWT authentication on all user endpoints
- Internal microservice auth via `X-Internal-Secret` header filter
- All secrets externalized via environment variables
- Database connection pooling (HikariCP, 25 connections)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS |
| Core Backend | Spring Boot 4, Java 21, Spring Security, Spring Mail |
| AI Engine | FastAPI, Python 3.10, PyMuPDF, OpenAI SDK |
| Bot | python-telegram-bot v21, httpx |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT |
| Email | Gmail SMTP |

---

## 📁 Project Structure

```
cypherdon/
├── frontend/                # Next.js web dashboard
│   ├── app/                 # Pages (login, signup, dashboard, profile)
│   ├── components/          # Reusable UI components
│   └── lib/                 # API client utilities
│
├── backend/                 # Python FastAPI (AI Engine)
│   ├── bot/                 # Telegram bot (ConversationHandler)
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic (matcher, email gen, resume parser)
│   ├── schemas/             # Pydantic models
│   └── requirements.txt
│
├── spring-backend/          # Java Spring Boot (Core Server)
│   └── src/main/java/com/cypherdon/core/
│       ├── config/          # SecurityConfig, InternalApiKeyFilter
│       ├── controller/      # REST controllers
│       ├── dto/             # Data transfer objects
│       ├── model/           # JPA entities (User, Job, Application, EmailTask)
│       ├── repository/      # Spring Data JPA repositories
│       ├── scheduler/       # EmailWorker (async queue processor)
│       └── service/         # Business services
│
├── scraper/                 # Job scraping utilities
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Java 21+
- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords)
- A [Telegram Bot Token](https://t.me/BotFather)

### 1. Clone the repo

```bash
git clone https://github.com/HarshwardhanBhaskar/Cypherdon.git
cd Cypherdon
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Fill in your Supabase, OpenAI, Telegram, and service keys
```

Update `spring-backend/src/main/resources/application.yml` with your:
- Database credentials
- Gmail SMTP App Password
- JWT secret

### 3. Start the Python AI Engine

```bash
cd backend
pip install -r requirements.txt
python main.py
# Running on http://localhost:8000
```

### 4. Start the Spring Boot Core Server

```bash
cd spring-backend
./mvnw spring-boot:run
# Running on http://localhost:8080
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 6. Start the Telegram Bot

```bash
cd backend
python -m bot.main
# Bot is now polling for messages
```

---

## 📡 API Reference

### FastAPI (AI Engine — Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/analyze` | Upload PDF + target role → ATS score |
| `POST` | `/api/emails/generate` | Generate AI cold email |
| `POST` | `/api/match-jobs` | Match user profile to job |
| `GET`  | `/health` | Service health check |

### Spring Boot (Core — Port 8080)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | Public | Register user |
| `POST` | `/api/auth/login` | Public | Login user |
| `GET`  | `/api/jobs` | JWT | List jobs |
| `POST` | `/api/applications` | JWT | Create application |
| `POST` | `/api/ai/analyze-resume` | Internal | Proxy to FastAPI |
| `POST` | `/api/emails/queue` | Internal | Queue email for sending |

---

## 🤖 Telegram Bot

Search for **@Cypherdon_Autobot** on Telegram and press Start.

**Flow:**
1. 🚀 Start Automation
2. 📄 Upload Resume (PDF)
3. 🎯 Select Role (inline buttons)
4. 🏢 Type Company Name
5. 📧 Review AI Email → Approve ✅ or Regenerate 🔄
6. ✅ Email queued for automated sending!

---

## 🔒 Security

- **No secrets in source code** — all credentials use `${ENV_VAR:default}` syntax
- **InternalApiKeyFilter** — custom Spring Security filter for service-to-service auth
- **JWT validation** on all user-facing endpoints
- **Rate limiting** — prevents email abuse (3/day free, 15/day paid)
- **HikariCP tuning** — connection pool sized for production load
- **Database indexes** — composite indexes on hot query paths

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/HarshwardhanBhaskar">Harsh Wardhan Bhaskar</a></b>
</div>
