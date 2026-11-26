# AI Client Requirement Analyzer (MERN)

Paste a client conversation or upload a requirements document (PDF, DOCX or TXT). The app returns objectives, features with MoSCoW priority, technical requirements, a suggested stack, milestones, and the clarification questions to send back to the client. Results are saved to MongoDB.

## Stack

- **MongoDB Atlas** with Mongoose (storage)
- **Express** (API)
- **React + Vite** (UI, React Router)
- **Google Gemini** via `@google/genai` (analysis, JSON output)
- **Zod** (schema validation and retries)
- **Vercel** (hosting: static site plus the API as a serverless function)

## Project layout

```
requirement-analyzer/
├── api/[...path].js        # Vercel serverless entry (wraps the Express app)
├── server/src/
│   ├── app.js              # Express app (routes, errors)
│   ├── server.js           # Local dev server on port 3001
│   ├── config/db.js        # MongoDB connection with caching
│   ├── models/Analysis.js  # Mongoose model
│   ├── routes/analyses.js  # REST endpoints
│   ├── schemas/analysis.js # Zod schema
│   └── services/           # llm.js, verify.js, ingest.js, export.js
├── server/tests/           # Node test runner tests (no API or DB calls)
├── client/                 # React + Vite app
├── vercel.json
├── .env.example
└── package.json
```

## Local setup

Requires Node.js 22 or newer.

```bash
npm install
npm install --prefix client
cp .env.example .env        # then fill in MONGODB_URI and GEMINI_API_KEY
```

Run the API and the UI in two terminals:

```bash
npm run dev:server          # API on http://localhost:3001
npm run dev:client          # UI on http://localhost:5173 (proxies /api to 3001)
```

Run the tests (no key or database needed):

```bash
npm test
```

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/analyses` | Create from JSON `{ "text": "..." }` or multipart `file` |
| GET | `/api/analyses` | List the 50 most recent |
| GET | `/api/analyses/:id` | Get one analysis |
| GET | `/api/analyses/:id/export.md` | Download as Markdown |
| DELETE | `/api/analyses/:id` | Delete |

## Deploy to Vercel

1. **Create a MongoDB Atlas cluster** (free tier works). Under Database Access, create a user. Under Network Access, allow `0.0.0.0/0` so Vercel can connect. Copy the connection string.
2. **Get a Gemini API key** from Google AI Studio.
3. **Push this folder to GitHub.**
4. **Import the repo in Vercel.** Framework preset can be "Other". The `vercel.json` file already sets the install, build, and output settings.
5. **Add environment variables** in Project Settings, then Environment Variables: `MONGODB_URI`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL`.
6. **Deploy.** Every push to the main branch redeploys.

Notes on Vercel:
- Analyses can take 20 to 40 seconds. `vercel.json` requests a 60-second function limit. Hobby accounts may have a lower limit depending on current Vercel plan settings. If you see timeouts, check your plan's limit or reduce `MAX_ATTEMPTS` in `server/src/services/llm.js`.
- Uploads are capped at 4 MB, and requests are capped by Vercel's body size limit.

## Evaluation

The original Python version had an evaluation harness. Porting it to this stack (a golden set plus a script that calls `analyze()` and reports recall) is a natural next step, and it is the best way to show measured quality in your portfolio.
