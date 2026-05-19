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
- [Telegram Bot & Account Linking](#-telegram-bot--account-linking)
- [Automated Testing Suite](#-automated-testing-suite)
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

### Telegram Bot Integration
- **100% Inline Button Flow**: Interactive user flow requiring zero manually typed commands during cold mailing. Upload resume → Select role → Target company → Review AI email → Approve & queue.
- **Microservices Orchestration**: Real-time integration with FastAPI (AI Resume Parsing, Gemini Mentor, and Cold Email Generation) and Spring Boot (Email Queue Worker).
- **Interactive Career Mentor**: Instant access to an active conversational Google Gemini AI career agent directly through the bot for advice, interview practice, and resume tuning.

### Premium Subscription Tier
- **White-Labeled Portfolio Sharing**: Recruiter-ready public portfolio sharing link (`/api/profile/public/{user_id}`) enabled exclusively for Premium accounts.
- **Unrestricted Bot Workflows**: Access 24/7 automated resume parsing, AI cold-email draft generation, and queued delivery pipelines.
- **Elevated Send Limits**: Expands email queues to 15 queued sends per day (from 3 per day for Free accounts).

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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/resume/analyze` | JWT | Upload PDF + target role → ATS score |
| `POST` | `/api/emails/generate` | JWT | Generate AI cold email |
| `POST` | `/api/match-jobs` | JWT | Match user profile to job |
| `GET`  | `/api/profile/` | JWT | Retrieve developer profile details |
| `PUT`  | `/api/profile/` | JWT | Update developer profile details |
| `GET`  | `/api/profile/public/{user_id}` | Public | Public white-labeled portfolio sharing (Gated to Premium) |
| `GET`  | `/api/profile/internal/by-email/{email}` | Service Token | Internal verified lookup for Telegram Bot verification |
| `GET`  | `/health` | Public | Service health check |

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

## 🤖 Telegram Bot & Account Linking

Cypherdon comes with an advanced mobile-first automation companion bot at [**@Cypherdon_Autobot**](https://t.me/Cypherdon_Autobot).

### 🔗 Web Console Pairing Integration
We've integrated a glassmorphic **Telegram Agent Integration Card** inside the Developer Identity Console under the **Console Settings** tab (`/profile` page):
1. Navigate to your web-dashboard profile settings tab.
2. Locate the **Cypherdon Telegram Agent** integration panel.
3. Click the copy button to grab your custom linking command: `/link your_email@example.com`.
4. Click **Launch Telegram Bot** to open the chat window in Telegram.

### 🔄 Account Activation Flow
1. Send `/link your_email@example.com` to the bot.
2. The bot performs a secure service-to-service handshake with the FastAPI microservice using the `X-Internal-Secret` credential.
3. Once paired, the bot fetches your live profile from the database and confirms your subscription tier:
   - **Premium Users 🌟**: Complete automation access is instantly unlocked! Press `/start` to run.
   - **Free Users ⚠️**: The bot will guide you to upgrade inside the web app's Simulator to unlock automated operations.

### 🔮 Interactive Mentor & Job Hunter Loop
- **Cold Email Automation**: `/start` → Upload Resume (PDF) → Select target role via inline buttons → Enter target company → Preview AI cold email → Approve & queue.
- **Conversational Career Mentor**: Message the bot with any career or interview question! The bot uses Google Gemini (`gemini-2.5-flash`) to act as a career coach, reviewing skills, answering questions, or doing role-play mock interviews.

---

## 🧪 Automated Testing Suite

The Python FastAPI service features a robust, mock-driven automated testing suite to verify backend status, authorization structures, and database rules.

### 📂 Test Architecture (`backend/tests/`)
All tests are defined under the [backend/tests/](file:///c:/Users/hwbha/c++%20code/cypherdon/backend/tests/) directory and leverage `pytest` and `fastapi.testclient.TestClient`.

The suite covers:
1. **System Health Check (`test_health_check`)**: Assures the base `/` health endpoint is fully online.
2. **Access Control Gates (`test_unauthorized_profile_access`)**: Asserts that requests to secure user endpoints (e.g. `GET /api/profile/`) without proper bearer tokens fail with a `403 Forbidden` status.
3. **Dependency Injection & Mocking (`test_authorized_profile_access`)**: Uses dependency overrides to bypass external Supabase token checks, ensuring mock authenticated profiles retrieve valid user payloads.
4. **Subscription Paywall & Gating (`test_public_profile_free_user` & `test_public_profile_premium_user`)**:
   - Asserts that requests to view a Free tier user's public portfolio link result in a gated `403 Forbidden` indicating a premium subscription is required.
   - Asserts that Premium users' white-labeled portfolios are fully visible (`200 OK`) publicly to recruiters.

### ⚙️ Running the Tests
To execute the automated backend suite:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the tests using `pytest`:
   ```bash
   pytest -v
   ```

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
