# IBM Role-Fit Resume Analyser (DEMO-RESUME-001)

> **Demonstration Environment.** All data is synthetic. No real client data or PII is used. Role profiles are illustrative, not real IBM job postings. Resumes are processed in memory and never stored.

IBM employees upload a text-based resume (PDF, DOCX, TXT and similar; no images or screenshots), pick an interested role (filtered by category: Technical, Sales, Consulting, Product & Design, Corporate), and get an **advisory** 0-100 fit score, a verdict (Suitable / Partially suitable / Not yet), and the matched and missing skills.

Built with IBM watsonx. Default model: `meta-llama/llama-4-maverick-17b-128e-instruct-fp8`.

```
# DEPLOY_TARGET: openshift   (default when containerized; UBI 9 required)
# BUILD_ARCH: arm64          (Apple Silicon: build with --platform linux/amd64)
```

## Quick start (local, mock mode, zero credentials)

```bash
cd demos/new-demo
./scripts/setup.sh                                   # venv + npm install + .env
cd backend  && .venv/bin/uvicorn main:app --port 8000
cd frontend && npm run dev                           # http://localhost:5173
```

If port 8000 is busy: `uvicorn main:app --port 8010` and `BACKEND_URL=http://localhost:8010 npm run dev`.

Presenter flow: choose **Sample resume** (auto-selects a suggested role), then **Analyse fit**. No typing or file upload needed.

## Modes

| | Mock (default) | Live |
|---|---|---|
| Set | `DEMO_MODE=mock` | `DEMO_MODE=live` + `WATSONX_API_KEY` + exactly one of `WATSONX_PROJECT_ID` / `WATSONX_SPACE_ID` |
| Engine | Deterministic keyword matcher with skill aliases | watsonx.ai `ModelInference.chat()` (JSON output, validated) |
| Images | Rejected with a clear message | Rejected with a clear message |
| Failure | n/a | Auto-falls back to mock with a visible note |

For live mode: `pip install "ibm-watsonx-ai>=1.5"` (uncomment in `requirements.txt`; use Python 3.10-3.12). The model id is checked against the live catalog at startup of the first call. Confirm its lifecycle status in your region before presenting.

## Supported resume formats

PDF, DOCX, ODT, PPTX, XLSX, RTF, HTML/XML, TXT/MD/CSV and any other text, and legacy `.doc` (best-effort). **Image files (PNG/JPG/WEBP/GIF, screenshots) are not supported**: the uploader blocks them and the API returns a 422 with a clear message. Unknown extensions are sniffed by content. Limit: 10 MB (`MAX_UPLOAD_MB`). Scanned PDFs without a text layer are rejected with guidance (upload a text-based copy).

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | status + mode + disclaimer |
| `GET /api/data/categories`, `/roles?category=`, `/roles/{id}`, `/samples` | catalog + samples |
| `POST /api/ai/analyze` | multipart: `role_id` + (`file` or `sample_id`) |
| `GET /api/ai/models`, `/api/demo/config` | model options, connection status |

## Responsible-AI design

- **Advisory only.** The result is a career-planning aid, not a hiring decision. No endpoint issues a binding determination, and the UI says so.
- **Nothing stored.** No database; resumes live only in request memory.
- **Untrusted input.** Resume text is placed only in the delimited user message, never in the system prompt. Model output is schema-validated: skills are intersected with the role's real skills, the score is clamped, and the verdict is derived server-side.
- **Fairness.** The live prompt forbids using protected attributes. A formal bias evaluation is a pilot task (see `PILOT_PLAN.md`).

## Verify

```bash
./scripts/verify-demo.sh        # backend endpoints + npm build + dev server smoke test
./scripts/check-compliance.sh   # compliance gate
cd scripts/e2e && npm install && URL=http://localhost:5173 OUT=../../docs/screenshots node e2e.js
```

## Containerizing later

Not yet built (local-first). When ready, the target is OpenShift: UBI 9 images (`ubi9/nodejs-20`, `ubi9/nginx-124`, `ubi9/python-311`), runtime pinned to amd64. On Apple Silicon build with:

```bash
docker build --platform linux/amd64 -t role-fit-frontend -f Dockerfile.frontend .
podman build --platform linux/amd64 -t role-fit-backend  -f Dockerfile.backend .
```

## Carbon note

The Carbon MCP was not authorized (no token), so Carbon component props were verified against the installed `@carbon/react` 1.120 TypeScript definitions and the Sass setup against its package source, not via the MCP. Charts are not used.

## Securing credentials

Never commit `.env`. Add a `.gitignore` excluding `.env`, `.venv/`, `node_modules/`, `dist/` (the build tooling could not create one automatically).
