---
title: Talentlens
emoji: 😻
colorFrom: gray
colorTo: indigo
sdk: docker
pinned: false
license: mit
short_description: TalentLens is a production-grade AI-powered HR Interview
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

# TalentLens - AI HR Interview Automation System

TalentLens is a production-grade AI-powered HR Interview Automation Platform. It automates the first round of candidate screening by using an interactive Rasa chatbot, then evaluates the interview transcript using Gemini 2.5 AI. It scores candidates, profiles their skills, and provides a B2B SaaS dashboard for recruiters to view these insights and schedule follow-ups via Google Calendar.

## Features (MVP)
* **Interactive Screening Chatbot**: Built with Rasa. Guides candidates through a sequence of HR questions, handles resume uploads, and measures typing speeds.
* **AI Profile Generation**: Processes candidate resumes (PDFs) from MinIO storage and extracts key technical skills, experience years, and generates an AI summary using Gemini.
* **AI Interview Scoring**: Automatically evaluates the chat transcript across predefined metrics: Experience Fit, Career Stability, Communication Quality, Typing Test, and Role Specific.
* **B2B Recruiter Dashboard**: Modern React UI (built with Vite + Tailwind CSS) for recruiters to filter and rank candidates by their AI scores.
* **Infrastructure**: Completely dockerized with PostgreSQL, Redis, MinIO, and Celery for background asynchronous tasks.
* **Observability**: Prometheus metrics enabled in the FastAPI backend (`/metrics`).

## Architecture & Technology Stack
* **Frontend**: React, Vite, React Router, Tailwind CSS, TypeScript.
* **Backend**: FastAPI, SQLAlchemy, Pydantic, Alembic.
* **AI/Workers**: Celery, Redis, Google GenAI SDK (Gemini 2.5 Flash).
* **Bot**: Rasa Open Source.
* **Databases/Storage**: PostgreSQL, Redis, MinIO.

## Prerequisites
* Docker and Docker Compose
* Google Gemini API Key
* (Optional) Google Calendar Service Account JSON for automated scheduling.

## Local Development Setup

1. **Clone the Repository** and navigate to the project root:
   ```bash
   cd TalentLens
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required keys, primarily `GEMINI_API_KEY`.
   ```bash
   cp .env.example .env
   ```

3. **Start the Infrastructure**:
   Spin up the entire stack using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
   This will start:
   - `postgres` (Port: 5432)
   - `redis` (Port: 6379)
   - `minio` (Port: 9000 & 9001)
   - `backend` (FastAPI) (Port: 8000)
   - `frontend` (React/Vite) (Port: 5173)
   - `chatbot` (Rasa) (Port: 5005 & 5055)
   - `celery_worker`

4. **Verify Deployment**:
   - Access the Admin Dashboard at [http://localhost:5173](http://localhost:5173)
   - Access the API Docs at [http://localhost:8000/docs](http://localhost:8000/docs)
   - Access Prometheus Metrics at [http://localhost:8000/metrics](http://localhost:8000/metrics)
   - Access MinIO Console at [http://localhost:9001](http://localhost:9001) (u: minioadmin, p: minioadmin)

## Production Deployment Checklist
For deploying this stack to production:
1. Update `.env` credentials with secure passwords and strict internal networking.
2. Put the `frontend` and `backend` behind an Nginx or Traefik reverse proxy with SSL termination.
3. Configure external logging and hook Prometheus to Grafana for dashboards.
4. Scale Celery workers based on expected concurrent interview load.
