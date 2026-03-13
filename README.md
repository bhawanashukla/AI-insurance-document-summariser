# AI Insurance Document Summariser

Small project that demonstrates an upload UI (Angular) and a Node/Express backend which extracts text from insurance documents (PDF/images), calls OpenAI to extract structured fields and produces a short summary.

Quick start

1. Set your OpenAI key in environment for the backend:

```powershell
cd server
npm install
$env:OPENAI_API_KEY = "your_api_key_here"
npm start
```

2. Start the frontend (from `frontend` folder):

```powershell
cd frontend
npm install
npm start
```

Notes
- The backend listens on port 3000 by default. The frontend upload form posts to `http://localhost:3000/api/extract`.
- Place real sample documents in `frontend/public/` if desired. A minimal `sample-insurance.pdf` is included.
- For OCR on images the server uses `tesseract.js` (pure JS but may be slower). For PDFs it uses `pdf-parse`.
- Ensure `OPENAI_API_KEY` is set for the backend.
# AI Insurance Document Summariser

Why this project
- Quickly prototype automated extraction of common insurance fields (policy number, insurer, policyholder, dates, coverages, premium, claim contact, vehicle details) from documents.
- Useful as a starting point for internal tools, claims intake automation, or as a demo of combining OCR/PDF parsing with LLM-based extraction.

Tech stack
- Frontend: Angular (standalone component), Bootstrap for quick styling
- Backend: Node.js + Express, `multer` for uploads
- Extraction: `pdf-parse` (PDF text), `tesseract.js` (image OCR)
- LLM: OpenAI (via official `openai` npm package)

Prerequisites
- Node.js (recommended >= 18) and `npm` available on your PATH
- An OpenAI API key (set as `OPENAI_API_KEY` for the backend)

Repository layout (important files)
- `frontend/` — Angular app
	- `src/app/upload.component.*` — upload UI and logic
	- `src/assets/sample-insurance.pdf` — included sample document used by the demo
- `server/` — Node/Express backend
	- `index.js` — API routes (`/api/extract` and `/sample`)
	- `utils.js` — extraction logic and OpenAI wrapper

Quick start (development)

1. Clone the repo

```bash
git clone <repo-url>
cd AI-insurance-document-summariser
```

2. Backend: install and start

PowerShell (temporary env var for current session):
```powershell
cd server
npm install
$env:OPENAI_API_KEY = "sk_your_key_here"
npm start
```

Or create a `.env` file in `server/` with:
```
OPENAI_API_KEY=sk_your_key_here
```
and then run:
```bash
cd server
npm install
npm start
```

3. Frontend: install and start

```bash
cd frontend
npm install
npm start
```

Open the app in the browser at: http://localhost:4200

How to use
- Upload a PDF or image (jpg/png) or click "Use Sample Document" to upload the included sample.
- The frontend posts the file to the backend `/api/extract` endpoint which returns structured JSON and a short summary.
- There is also a backend route `/sample` that serves the sample PDF (used to avoid static-file interception by local proxies).

Configuration
- Frontend posts to `http://localhost:3000/api/extract` by default. You can override it in runtime by setting `window.__env_api_url` before the app loads.

Setting the `OPENAI_API_KEY`
---------------------------------
You must provide an OpenAI API key for the backend. Here are common ways to set it.

Temporary (current terminal session only):

- PowerShell:
```powershell
$env:OPENAI_API_KEY = "sk_your_key_here"
cd server
npm start
```

- Windows cmd:
```cmd
set OPENAI_API_KEY=sk_your_key_here
cd server
npm start
```

- macOS / Linux (bash/zsh):
```bash
export OPENAI_API_KEY="sk_your_key_here"
cd server
npm start
```

Persist for your user (recommended for local dev):

- PowerShell (sets for current Windows user):
```powershell
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY","sk_your_key_here","User")
# Restart your terminal for the value to take effect
```

- Windows (cmd) persistent set:
```cmd
setx OPENAI_API_KEY "sk_your_key_here"
# Open a new terminal to see the value
```

- macOS / Linux (add to shell rc):
```bash
echo 'export OPENAI_API_KEY="sk_your_key_here"' >> ~/.bashrc && source ~/.bashrc
# or for zsh: ~/.zshrc
```

Using a `.env` file (recommended for local development - do NOT commit):

Create `server/.env` with the contents:
```
OPENAI_API_KEY=sk_your_key_here
```
The server uses `dotenv` so `npm start` will load this automatically.

Verify the key in Node:
```bash
node -e "console.log(process.env.OPENAI_API_KEY ? 'OK' : 'MISSING')"
```

Common troubleshooting
- "OPENAI_API_KEY is not set": set the env var (see Quick start). The server uses `dotenv` so a `server/.env` file works.
- 204 / IDM interception when fetching `/assets/...`: some local IDM/proxy tools intercept and return 204. Use the backend `/sample` endpoint (the app tries that first), or whitelist localhost in your IDM.
- 429 quota error from OpenAI: check your OpenAI billing and usage. Errors show: "You exceeded your current quota...". You can either upgrade plan, wait for reset, or add retry/backoff in `server/utils.js`.
- `npm` not found: ensure Node.js + npm are installed and on PATH. On Windows, a PowerShell restart may be required after install.

Development notes
- `server/index.js` enforces a 10MB file size limit via `multer`.
- Extraction logic lives in `server/utils.js` — it chooses `pdf-parse` for PDFs and `tesseract.js` for images, then formats a prompt for the OpenAI Chat API.
- The frontend includes a small embedded fallback PDF so the "Use Sample Document" button works even when static assets or backend are blocked by local tooling.

Security & deployment
- Do not commit your `OPENAI_API_KEY` or `.env` to git. Add `server/.env` to `.gitignore`.
- For production, store secrets in a secure secrets manager and run the server behind HTTPS.

Repository housekeeping
- A project-level `.gitignore` and `.gitattributes` are included to avoid noisy tracked files and normalize line endings.

Further improvements (ideas)
- Add retry-with-backoff for transient OpenAI rate errors.
- Add unit/e2e tests for parsing logic and UI.
- Add authentication and request quotas for the backend in multi-user deployments.

If you want, I can also add a `server/.env.example` and expand the README with exact `npm` versions and a Dockerfile for local development.

---
Edited: concise developer onboarding and run instructions.
# AI-insurance-document-summariser