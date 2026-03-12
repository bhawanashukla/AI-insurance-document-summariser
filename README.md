# AI Insurance Document Summariser

This repository contains a minimal Angular frontend and a Node backend service that use OpenAI to summarise and extract fields from insurance documents (PDF/JPG).

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
# AI-insurance-document-summariser