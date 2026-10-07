---
title: FracFeedExtractor
start: "2025-09"
end: "2026-06"
summary: Pipeline that screens ecology PDFs and extracts predator diet data with XGBoost and a local LLM.
metric: 94% classifier accuracy on a 234-paper held-out test set
tags: [Python, XGBoost, scikit-learn, Ollama, Pydantic, PyMuPDF, Tesseract OCR, GitHub Actions]
github: https://github.com/NovakLabOSU/FracFeedExtractor
order: 1
---

Screens folders of ecological research PDFs with a TF-IDF and XGBoost classifier. Relevant papers go to a locally run LLM through Ollama, which extracts stomach counts and covariates into JSON and CSV with confidence and provenance. Built for the OSU Novak Lab to validate the fraction of feeding individuals metric without hand-harvesting a century of diet surveys. Senior capstone (CS 461/462/463), team of four. The XGBoost classifier and its accuracy result are team work.

- Owned data processing and testing: the text cleaning and section filtering stage, Google Drive ingestion, parallel extraction with page-level provenance and the GitHub Actions CI.
- Key decision: CI streams a small fixed sample of PDFs from Google Drive without saving them, and full training runs as a separate job instead of processing the whole corpus in CI. This kept runs reproducible and separated CI from training.
