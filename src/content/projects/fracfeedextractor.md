---
title: FracFeedExtractor
start: "2025-09"
end: "2026-06"
context: capstone
contextDetail: CS 461/462/463
teamSize: 4
teamNote: Four students plus a faculty client, Mark Novak (Project Lead)
role: Data Processing & Testing, plus LLM extraction, Google Drive ingestion and CI
summary: Pipeline that screens ecology PDFs and extracts predator diet data with XGBoost and a local LLM.
metric: "Team result: 94% accuracy screening papers as useful or not useful on a 234-paper held-out set"
tags: [Python, XGBoost, scikit-learn, Ollama, Pydantic, PyMuPDF, Tesseract OCR, GitHub Actions]
github: https://github.com/NovakLabOSU/FracFeedExtractor
image:
  src: ../../assets/projects/fracfeedextractor-architecture.png
  alt: "System flow diagram. A researcher runs the pipeline on a local machine: a Google Drive script downloads PDFs, a text extraction module falls back to Tesseract OCR, a TF-IDF and XGBoost classifier flags useful papers, an LLM extracts key fields to JSON and CSV and every stage logs to a metrics store."
status: in-progress
order: 10
---

Screens folders of ecological research PDFs with a TF-IDF and XGBoost classifier. Relevant papers go to a locally run LLM through Ollama, which extracts stomach counts and covariates into JSON and CSV with confidence and provenance. Built for Mark Novak's lab to validate the fraction of feeding individuals metric without hand-harvesting a century of diet surveys. Running the LLM on-device keeps unpublished manuscripts in the researcher's environment.

- Built the text cleaning and section filtering stage and its tests. It strips DOIs, figure captions and numbered references, drops weak paragraphs by score and keeps section headers.
- Added Google Drive ingestion and the pipeline scripts: a service-account Drive streamer with shared-drive support, `.env` secret loading, a fixed-sample CI pipeline and a full pipeline with API and local modes.
- Set up CI by adding tests and coverage to the GitHub Actions workflow, then restructured it into staged preprocessing checks. Wrote CONTRIBUTING.md sections and README docs.
- Added parallel extraction with a `--workers N` flag and switched the default model from llama3.1:8b to qwen2.5:7b. Added null-response retries, a larger context limit, a one-time spell checker load, GPU XGBoost training and an OCR bypass for parallel runs.
- Added page-level provenance: each page is tagged `[PAGE N]` during extraction and every extracted metric records its source pages.

**Key decision.** CI streams a small fixed sample of PDFs from Google Drive without saving them, and full training runs as a separate job. The alternative was processing the whole corpus in CI. Splitting them kept runs reproducible, made scaling easier and kept CI separate from full training. Local Ollama mode also stayed the default over API mode because it was much faster.

Teammates built the XGBoost classifier and its 94% result, the Pydantic data models and the PyMuPDF and OCR extraction.
