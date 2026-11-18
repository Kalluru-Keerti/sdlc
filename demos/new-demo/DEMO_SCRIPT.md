# Demo Script - Role-Fit Resume Analyser (about 10 minutes)

## Pre-demo checklist

- [ ] Backend running (`uvicorn main:app --port 8000`) and frontend (`npm run dev`)
- [ ] Browser at `http://localhost:5173`, 1920x1080, dark theme
- [ ] Banner reads "Demonstration Environment". Say that all data is synthetic.
- [ ] Backup: screenshots in `docs/screenshots/`

## Opening (2 min)

"Finding the right internal role usually means reading job descriptions and guessing. Employees want to know: am I a fit, and what should I build?" Show the page, then **Role catalog** (25 roles across 5 categories).

## Problem (1 min)

Skills are buried in resumes, role requirements are scattered, and feedback takes days. Employees lose time or never apply.

## Solution (5 min)

1. Open **Role-fit analyser**. Show the **category** filter, then pick **Technical**, then **Site Reliability Engineer (SRE)**.
2. Select **Sample resume: Jordan Ellis** (the role auto-selects). Click **Analyse fit**.
3. Result: **88, Suitable.** Walk through matched core skills, preferred skills, and gaps (Instana, Chaos Engineering).
4. Contrast: choose **Sam Okafor** (AI Engineer): low score, with missing RAG, REST APIs and Vector Databases listed as what to build.
5. Show **Priya Nair** against Data Scientist: **70, Partially suitable.**
6. Mention any-format upload: drag in a PDF or DOCX if you have a safe sample.

## Trust and governance (1 min)

Advisory only, nothing stored, resume treated as untrusted input, verdict computed by code rather than by the model, hallucinated skills dropped.

## Close (1 min)

"We can have a working pilot in 3-4 weeks with Client Engineering: real role profiles, live watsonx.ai, bias testing, SSO."

## FAQ

| Question | Answer |
|---|---|
| Is this a hiring decision? | No. It is advisory career guidance, and a human decides. |
| Is the resume stored? | No. It is processed in memory and discarded. |
| Which model? | Llama 4 Maverick on watsonx.ai (live mode). The demo runs in mock mode. |
| Does it handle scanned resumes? | Not images or screenshots. Upload a text-based PDF, DOCX or TXT. |
| Are these real IBM roles? | No. They are synthetic, illustrative profiles. |
| How is bias handled? | Protected attributes are excluded from the prompt. A formal fairness test is in the pilot. |
| Why is the score the same each time in the demo? | Mock mode is deterministic so the demo is repeatable. |
