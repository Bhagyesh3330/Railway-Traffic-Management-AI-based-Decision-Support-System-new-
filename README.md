Railway Decision Support System - Official-style Prototype
==========================================================

This archive contains a prototype full-stack project:
- Backend: Express.js (backend/src) with PostgreSQL seed SQL.
- Frontend: Next.js (pages + components) with Tailwind CSS.
- A simple proxy endpoint in Next.js to fetch AI suggestions from backend.

Quick start (Linux / macOS):
1. Ensure Node.js and PostgreSQL are installed.
2. Create database:
   createdb raildb
   psql -d raildb -f backend/src/seed.sql

3. Start backend:
   cd backend
   npm install
   npm start

4. Start frontend:
   cd frontend
   npm install
   # optionally build tailwind (if installed), then:
   npm run dev

Backend default connection string: postgres://postgres:password@localhost:5432/raildb
You can change by setting DATABASE_URL environment variable.

Notes:
- This is a mocked prototype for demo/UX. Replace AI logic and DB with production systems for real use.
