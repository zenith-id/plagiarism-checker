# Changelog

All notable changes to this project will be documented in this file.

See `CHANGES.md` for detailed change tracking.

---

### [Style]

#### Rapikan format PromoVideo

- **Date:** 2026-07-17
- **Commits:** `715aabd`
- Reformat komponen `PromoVideo.tsx` (tanpa perubahan logika)

---

### [Chores]

#### Bersihkan konfigurasi & berkas usang

- **Date:** 2026-07-17
- **Commits:** `26e6d56`, `c4b72aa`
- Abaikan `agent/` dan `.claude` di gitignore, sinkron `skills-lock.json`
- Hapus `PRD.md` dan `build-promo.cjs` yang usang

---

### [Bug Fixes]

#### Perbaiki frame promo value, stats, dan features

- **Date:** 2026-07-17
- **Commits:** `d297ba6`
- Frame value: kicker+caption jadi header atas, ring terpusat (tidak tumpang tindih)
- Frame stats: perbaiki literal JS `-5cqw` invalid, count-up 0→200 ke timeline seek
- Frame features: perbaiki literal JS `-5cqw` yang mematikan animasi masuk
