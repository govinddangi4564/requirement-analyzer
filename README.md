# Requirement Analyzer

A full-stack web application that turns unstructured client conversations and requirement documents into a practical project brief.

Paste meeting notes, email threads, or chat transcripts—or upload a PDF, DOCX, or TXT file—and receive a structured analysis that is ready to review, share, export, or use as the starting point for a proposal.

## What it does

The application extracts and organizes the information a delivery team needs before starting a project:

| Output | What it helps with |
| --- | --- |
| **Objectives** | Defines the outcomes the client wants to achieve. |
| **Features** | Lists requested capabilities with a MoSCoW priority: Must, Should, Could, or Won't. |
| **Source quotes** | Connects every feature to the exact client statement that supports it. |
| **Technical requirements** | Captures constraints, integrations, platforms, or other implementation needs. |
| **Suggested stack** | Recommends an appropriate technology direction from the supplied requirements. |
| **Milestones** | Breaks the work into practical delivery phases. |
| **Clarifications** | Flags missing decisions before development begins. |

Each completed brief is saved to MongoDB. Users can revisit recent briefs, download a Markdown version, print or save the report as a PDF, and delete work that is no longer needed.

## How it works

```text
Client text or document
          ↓
Text extraction (PDF / DOCX / TXT)
          ↓
Gemini generates a structured project brief
          ↓
Zod validates the response structure
          ↓
Feature quotes are checked against the original source
          ↓
Validated brief is saved in MongoDB and shown in the UI
```

The analysis service uses a low-temperature JSON response and up to three attempts to produce a valid result. If the response is malformed or a feature quote cannot be found in the supplied source, it asks the model to correct the problem rather than saving an unverified analysis.

## Features

- Paste plain-text client conversations, requirement notes, or meeting summaries.
- Upload **PDF**, **DOCX**, or **TXT** documents up to **4 MB**.
- Prioritize features with the MoSCoW method.
- Preserve a client source quote for each proposed feature.
- Review recent analyses in a polished, responsive workspace.
- Export briefs as Markdown or print/save them as PDF.
- Validate model output and retry incomplete or ungrounded responses.
- Store analyses in MongoDB Atlas through Mongoose.
- Deploy the client and API together on Vercel.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Document parsing | `pdf-parse`, `mammoth` |
| Analysis | Google Gemini via `@google/genai` |
| Validation | Zod |
| Testing | Node.js test runner |
| Hosting | Vercel serverless functions + static site |

## Project structure

```text
requirement-analyzer/
├── api/[...path].js              # Vercel serverless entry point
├── client/
│   └── src/
│       ├── components/           # Analysis report UI
│       └── pages/                # Home and analysis-detail pages
├── server/
│   ├── src/
│   │   ├── config/db.js          # Cached MongoDB connection
│   │   ├── models/Analysis.js    # Stored analysis model
│   │   ├── routes/analyses.js    # REST API endpoints
│   │   ├── schemas/analysis.js   # Zod result schema
│   │   └── services/             # Analysis, verification, ingest, export
│   └── tests/                    # Unit tests; no DB or API keys required
├── .env.example                  # Environment-variable template
├── package.json
└── vercel.json
```

## Getting started

### Prerequisites

- Node.js **22 or newer**
- A MongoDB Atlas connection string
- A Google Gemini API key

### 1. Install dependencies

```bash
npm install
npm install --prefix client
```

### 2. Configure environment variables

Copy the template:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Then update `.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.example.mongodb.net/requirement-analyzer
GEMINI_API_KEY=your-gemini-api-key

# Optional: override the configured default Gemini model
GEMINI_MODEL=gemini-2.5-flash
```

Never commit `.env`. It is already excluded by `.gitignore`.

### 3. Start the application

Run these commands in separate terminals:

```bash
npm run dev:server
```

```bash
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server forwards `/api` calls to the Express API at `http://localhost:3001`.

### 4. Create a brief

1. Paste client notes in the source field, or select a supported document.
2. Choose **Create project brief**.
3. Wait for the analysis to complete (typically 20–40 seconds).
4. Review objectives, prioritized features, technical needs, stack suggestions, milestones, and clarifying questions.
5. Download Markdown or print the report when it is ready to share.

## API reference

All API responses are JSON unless noted otherwise.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check; returns `{ "ok": true }`. |
| `POST` | `/api/analyses` | Creates and saves an analysis from text or an uploaded file. |
| `GET` | `/api/analyses` | Returns the 50 newest saved analyses. |
| `GET` | `/api/analyses/:id` | Returns one saved analysis. |
| `GET` | `/api/analyses/:id/export.md` | Downloads an analysis as a Markdown file. |
| `DELETE` | `/api/analyses/:id` | Deletes an analysis. |

### Create from text

```bash
curl -X POST http://localhost:3001/api/analyses \
  -H "Content-Type: application/json" \
  -d '{"text":"The client needs a mobile-friendly appointment booking portal with email reminders."}'
```

### Create from a document

```bash
curl -X POST http://localhost:3001/api/analyses \
  -F "file=@requirements.pdf"
```

### Limits and validation

- Pasted text is limited to **60,000 characters**.
- Uploads are limited to **4 MB**.
- Supported uploads: `.pdf`, `.docx`, and `.txt`.
- Empty or unreadable files are rejected with a helpful error message.
- Each returned feature must include a quote that is present in the original input.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:server` | Starts the Express API with file watching on port 3001. |
| `npm run dev:client` | Starts the Vite frontend on port 5173. |
| `npm run build` | Produces a production frontend build in `client/dist`. |
| `npm test` | Runs backend unit tests without Gemini or MongoDB credentials. |

## Deploying to Vercel

1. Create a MongoDB Atlas cluster and database user. Configure network access so Vercel can connect.
2. Create a Gemini API key in Google AI Studio.
3. Push this project to GitHub.
4. Import the repository in Vercel. Use the **Other** framework preset if prompted.
5. In **Project Settings → Environment Variables**, add:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional)
6. Deploy.

`vercel.json` installs both packages, builds the Vite frontend, serves `client/dist`, and exposes the Express API through the serverless entry point. It requests a 60-second function duration because analyses can take 20–40 seconds.

> Vercel plan limits can vary. If analysis requests time out in production, check the current function-duration limit for your plan or reduce the number of attempts in `server/src/services/llm.js`.

## Testing

Run the automated test suite:

```bash
npm test
```

Tests cover API errors, file ingestion, Markdown export, schema normalization, analysis retries, and quote grounding. They do not call Gemini or MongoDB.

## Planned improvements

The following additions would make the product more useful for real delivery teams:

- **User accounts and workspaces** — keep analyses private and organize work by client, project, or team.
- **Rate limiting and usage controls** — protect the API from abuse and manage model usage costs.
- **Editable briefs** — allow users to revise generated objectives, features, priorities, and milestones before sharing.
- **PDF and DOCX exports** — create presentation-ready deliverables in addition to the current Markdown export.
- **Shareable links** — let users send a read-only project brief to clients or collaborators.
- **Requirements comparison** — compare a new client document with an earlier brief to identify changes in scope.
- **Custom analysis templates** — tailor the output for discovery calls, software proposals, agency handoffs, or internal tickets.
- **Project-management integrations** — send approved requirements to tools such as Jira, Linear, Trello, or Notion.
- **Evaluation dashboard** — measure output quality against a curated set of requirements examples over time.
- **Role-based access and audit history** — support larger teams that need controlled access and change tracking.

## Security and data notes

- Keep `MONGODB_URI` and `GEMINI_API_KEY` in environment variables only.
- Do not paste secrets, passwords, access tokens, or sensitive personal information into an analysis source.
- Uploaded documents are processed in memory by the API; the extracted text and completed result are saved with the analysis record.

## License

This repository does not currently specify a license. Add one before distributing or accepting outside contributions.
