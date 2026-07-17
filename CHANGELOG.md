# Changelog

All notable changes to this project will be documented in this file.

See `CHANGES.md` for detailed change tracking.

---

## [Unreleased]

### [Bug Fixes]

#### Perbaiki komponen promo & marketing (batch akhir)

- **Date:** 2026-07-17
- **Commits:** `d297ba6`, `7f4570e`, `f16a997`, `3d8cc1a`, `9a40859`, `6059720`, `ed1b0ed`, `06ed611`, `f6d52e1`, `3a611f7`, `0437055`, `b51a50c`, `02c0362`, `55095dc`, `3beaf45`, `524bafa`, `65ea733`, `816be40`, `a932790`, `6bd3630`, `8dba221`, `2daed74`, `1d15e3b`, `8e1374d`
- Perbaikan iteratif frame promo (value, stats, features, cta, hook): layout responsif, caption, transisi, count-up, scope gsap ke root, kicker terpusat, tiles putih, cursor center.

#### Perbaiki tag container stray di layout

- **Date:** 2026-07-16
- **Commits:** `8b3f1c6`
- Koreksi tag container yang salah pada layout aplikasi.

#### Perbaiki a11y tombol ikon

- **Date:** 2026-07-16
- **Commits:** `728aaa7`
- Tambah reduced-motion guard dan aria-label pada tombol ikon.

#### Perbaiki state halaman hasil

- **Date:** 2026-05-21
- **Commits:** `94a75ec`
- Hapus graf dan bersihkan state hasil.

### [Features]

#### Promo video project (6 frame)

- **Date:** 2026-07-17
- **Commits:** `a9c3b4b`, `2d98422`, `908b15c`, `728b525`, `ab2f076`, `d1be45f`, `e234e8d`, `bc38d28`, `667a473`, `6d988fa`
- Inisiasi proyek promo, brand tokens, storyboard, build 6 frame dengan transisi, komponen promo video, dan wiring ke landing page.

#### Halaman landing marketing

- **Date:** 2026-07-16
- **Commits:** `a782b90`, `758ea00`, `56e6d95`, `60a74e7`
- Nav, footer, hero, features, how-it-works, cta, dan landing layout/page.

#### Komponen UI fitur & primitives

- **Date:** 2026-07-16
- **Commits:** `f3f9ade`, `ed59652`, `d543e65`, `1483490`, `1f06a14`, `ab03d63`, `54d9826`, `6d136e1`
- Atoms ui (cn/button/card/badge/input/spinner), layout primitives, fitur upload/results/detail/settings, message banner, upload actions, diff viewer, score cards.

#### App shell & halaman frontend

- **Date:** 2026-05-20
- **Commits:** `295e629`, `3abcf28`, `0166524`, `56dd1bf`, `7f2a583`, `f22f21e`
- App shell layout + nav, pemindahan home ke (app)/dashboard, settings/detail/results pages, main page upload+results, api client/store/schemas, next.js config.

#### Backend API & algoritma

- **Date:** 2026-05-20
- **Commits:** `4b631e0`, `a862e7f`
- Konfigurasi server Hono.js dan endpoint API + algoritma similarity.

### [Refactoring]

#### Pemangkasan halaman app via fitur

- **Date:** 2026-07-16
- **Commits:** `1f7e078`, `03d8dc3`, `d3b4c9b`, `db876d9`
- Slim home/detail/results/settings pages untuk menyusun fitur.

#### Ekstraksi helper lib & core engine

- **Date:** 2026-07-16
- **Commits:** `2c34c91`, `5cd6285`, `1ed2737`, `6f4ad4a`
- Ekstrak scoring/ranking/highlight helpers, text cleaner, shared types, document parsers, dan similarity algorithms ke core engine.

#### Restrukturisasi modul backend

- **Date:** 2026-06-11
- **Commits:** `8c06ecb`, `2e3ebab`, `028983b`, `9315f6c`, `2e1a20f`, `49a2227`, `14e5506`, `6a8c30d`, `f0767ef`, `abd322b`
- Pemisahan layer modules (files/upload, settings, health, analysis, reports, shared), rename features, pembaruan imports, pemindahan state.

#### Pembersihan file app usang

- **Date:** 2026-07-16
- **Commits:** `23a15e2`, `c27169c`
- Drop old app http/routes untuk entry app.ts, hapus server/config/utils lama.

### [Documentation]

#### Changelog & changes log

- **Date:** 2026-07-17
- **Commits:** `d04092a`, `8e5b6cc`, `236fcc4`, `0974207`, `afe6979`
- Log commit refactor backend, pembaruan changes log, placeholder changelog, dan dokumentasi changelog.

#### Dokumentasi README & proyek

- **Date:** 2026-05-20
- **Commits:** `f6e30f1`, `8171b5c`, `0fac36e`, `d934a24`
- Dokumentasi proyek + PRD, readme/env backend, diagram mermaid arsitektur.

### [Chores]

#### Pembersihan repo & konfigurasi

- **Date:** 2026-07-17
- **Commits:** `c4b72aa`, `26e6d56`, `fee7f93`, `5cbb8fb`, `9caa480`, `1463964`, `df4310f`, `1d16fd4`, `f4c9c34`
- Hapus PRD.md/build-promo.cjs usang, abaikan agent/.claude, sync skills-lock, gitignore md/assets, lockfile workspace, config/lint frontend, init root config.

#### Skrip test backend

- **Date:** 2026-07-16
- **Commits:** `a883cfb`
- Tambah test scripts ke package.json.

### [Style]

#### Format komponen PromoVideo

- **Date:** 2026-07-17
- **Commits:** `715aabd`
- Reformat `PromoVideo.tsx` tanpa perubahan logika.

### [Tests]

#### Test backend (parser, pipeline, services, algorithms)

- **Date:** 2026-07-16
- **Commits:** `213d402`, `4acfdb9`, `7fac0ae`
- Unit test tf-idf/n-gram/lcs, test cleaner & analysis service, test parser fixture & pipeline.

### [Build]

#### Tooling, hooks, & bootstrap

- **Date:** 2026-05-20 / 2026-07-16
- **Commits:** `cebe3ca`, `8730d00`, `418f66d`
- Tambah husky/commitlint/standard-version, commitlint pre-commit hook, app bootstrap + env config backend.

### [Chores]

#### First commit

- **Date:** 2026-05-20
- **Commits:** `b39ae2b`
- Commit awal repositori.
