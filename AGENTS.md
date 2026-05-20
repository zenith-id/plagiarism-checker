# AGENTS.md

## Perintah (Commands)

### Backend (Hono.js + Bun)

Dijalankan di dalam direktori `/backend`:

- `bun run dev` - Menjalankan dev server Hono dengan fitur native auto-restart (hot reload) bawaan Bun.
- `bun start` - Menjalankan server Hono dalam mode produksi.

### Frontend (Next.js + Bun)

Dijalankan di dalam direktori `/frontend`:

- `bun run dev` - Menjalankan dev server Next.js.
- `bun run build` - Membuat build produksi Next.js.
- `bun start` - Menjalankan server Next.js siap produksi.

---

## Arsitektur

### Backend (`/backend`)

- **Runtime:** Bun (Native ESM).
- **Entry Point:** `src/index.ts` (Hono.js, berjalan di port `3001` atau via environment variable).
- **API Routes:** `src/routes/api.ts` (Menggunakan routing modular Hono).
- **Utils:**
  - `src/utils/parser.ts` - Parsing file dokumen memanfaatkan `ArrayBuffer` dan `Buffer` native Bun.
  - `src/utils/similarity.ts` - Komputasi algoritma kemiripan teks teks (TF-IDF, Cosine Similarity, N-Gram, LCS).
- **Pustaka Pendukung Backend (Bun Ecosystem):**
  - `hono` - Framework web utama yang super cepat.
  - `pdf-parse` atau `pdfjs-dist` - Untuk ekstraksi teks dari file `.pdf`.
  - `mammoth` - Untuk ekstraksi teks bersih dari file `.docx`.
  - `tesseract.js` - Menggantikan _scribe.js-ocr_ agar kompatibel penuh dengan lingkungan ESM/Bun untuk kebutuhan OCR (menggunakan data bahasa `eng` dan `ind`).

### Frontend (`/frontend`)

- **Framework:** Next.js (App Router, TypeScript).
- **Styling & UI:** Tailwind CSS + Shadcn UI / Radix Primitives untuk komponen antarmuka yang modern.
- **State & Data Fetching:**
  - `TanStack Query (React Query)` - Untuk manajemen caching, state pengunggahan file, dan fetching data dari API Hono.
  - `lucide-react` - Untuk kebutuhan ikon UI.
- **Pustaka Pendukung Frontend:**
  - `axios` atau `Fetch API` bawaan Next.js untuk komunikasi data.

### Penyimpanan (Storage)

- **State Server:** _In-memory storage_ (semua data pengaturan dan riwayat pengecekan akan hilang jika server backend restart).
- **State Client:** Pengaturan ambang batas kemiripan (_threshold preferences_) disimpan secara persisten di browser menggunakan `localStorage`.

---

## Batasan Utama (Key Constraints)

- Batas maksimal unggahan: **200 file per batch**, dengan ukuran maksimal **10MB per file**.
- Format yang didukung: `.txt`, `.docx`, `.pdf`.
- Direktori sementara `/uploads` (jika digunakan untuk buffer OCR) akan otomatis dibersihkan setiap kali server backend dinyalakan atau setelah proses parsing selesai.
- File OCR menggunakan data pelatihan bahasa `eng.traineddata` dan `ind.traineddata` yang diletakkan pada root repositori backend.
- Seluruh antarmuka pengguna (UI) dan pesan notifikasi menggunakan **Bahasa Indonesia**.

---

## Algoritma Kemiripan (Similarity Algorithms)

- **Normal:** Pembobotan nilai menggunakan kombinasi **TF-IDF Cosine Similarity (70%)** + **5-Gram Overlap (30%)**.
- **Strict:** Menggunakan algoritma yang sama dengan mode _Normal_, namun setelah melakukan pembersihan teks (_preprocessing_) secara ketat dengan menghapus bagian _header_, daftar nama, NIM mahasiswa, serta istilah-istilah template tugas/jurnal.
- **Word Overlap:** Pencocokan kata secara eksak (_exact-match_) memanfaatkan metode **LCS (Longest Common Subsequence)**.
- Deteksi arah plagiarisme (siapa menyalin siapa) bersifat heuristik (dugaan kuat berdasarkan struktur/waktu) dan bukan merupakan bukti mutlak.

---

## Catatan Penting Pengembang

- **Native TypeScript:** Baik frontend maupun backend sekarang menggunakan TypeScript secara _native_. Tidak memerlukan konfigurasi _bundler_ eksternal tambahan karena sudah ditangani langsung oleh Bun dan Next.js.
- **Ekstraksi Metadata DOCX:** Metadata diambil dengan membaca struktur XML internal `.docx` menggunakan pendekatan berbasis _buffer_ di Bun tanpa perlu menulis file ke disk terlebih dahulu.
- **Tanpa Database:** Aplikasi ini tidak memiliki sistem autentikasi, database, maupun riwayat pengecekan yang persisten di sisi server.
