# Changes

## [Unreleased]

---

### Refactoring

#### Backend Feature-Based Architecture

- **Date:** 2026-06-11
- **Commits:** `418f66d`, `2e3ebab`, `028983b`, `9315f6c`, `2e1a20f`, `49a2227`, `14e5506`, `8c06ecb`
- Split backend bootstrap into app, config, and shared layers
- Split backend features into route, handler, service, repository, schema, and types
- Remove legacy backend utils after feature-based migration

---

### Features

#### Frontend Next.js App

- **Date:** 2026-05-20
- **Commits:** `56dd1bf`, `0166524`, `7f2a583`
- Add main page with file upload, summary, ranking, and graph sections
- Add settings page for threshold and exclusion management
- Add detail page with side-by-side comparison and sync highlight
- Add results page with heatmap and pair listing
- Implement API client, Zustand store, and Zod schemas

#### Backend Hono.js API Server

- **Date:** 2026-05-20
- **Commits:** `a862e7f`, `4b631e0`
- Add Hono.js backend with file upload, analysis, and PDF export
- Implement TF-IDF + Cosine Similarity + N-Gram algorithms
- Add DOCX/PDF/TXT parsing with OCR fallback
- Add metadata extraction and plagiarism direction detection

---

### Documentation

#### Project Documentation

- **Date:** 2026-05-20
- **Commits:** `f6e30f1`, `8171b5c`, `236fcc4`, `0974207`
- Add README.md with setup instructions and API reference
- Add PRD.md with product requirements
- Add DESIGN.md with design system guidelines
- Add AGENTS.md with developer guidelines
- Add CHANGELOG.md placeholder
- Update CHANGES.md with all commit hashes

---

### Chores

#### Project Initialization

- **Date:** 2026-05-20
- **Commits:** `f4c9c34`, `f22f21e`, `1d16fd4`, `df4310f`, `1463964`, `9caa480`
- Add root package.json with workspace config and concurrently
- Add frontend Next.js app config and dependencies
- Add docs templates for commits and changelog
- Add public assets and favicon
- Remove duplicate README file

---
