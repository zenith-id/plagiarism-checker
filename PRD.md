# Product Requirements Document

## Product Name

Plagiarism Checker for Student Assignments

## Background

Dosen atau pemeriksa tugas sering harus membandingkan banyak file mahasiswa satu per satu. Proses manual ini lambat, melelahkan, dan sulit ketika jumlah file besar. Produk ini membantu melakukan analisis kemiripan secara massal untuk menemukan file dengan indikasi plagiarisme tertinggi, terendah, dan relasi antar file.

## Goal

Mempercepat proses pemeriksaan plagiarisme tugas mahasiswa melalui upload banyak file sekaligus dan hasil analisis yang mudah dibaca.

## Primary Users

- Dosen
- Asisten dosen
- Tim akademik

## Core Problems

- Pemeriksaan file dilakukan satu per satu.
- Sulit mengetahui file mana yang paling tinggi tingkat kemiripannya.
- Sulit mengidentifikasi pasangan file yang saling mirip.
- Sulit melihat indikasi siapa meniru siapa dalam satu batch dokumen.

## Product Scope

Web app internal berbasis Node.js + Express untuk:

- Upload banyak file sekaligus.
- Parsing file `.txt`, `.docx`, `.pdf`.
- Menghitung similarity antar semua pasangan file.
- Menghitung `word overlap` exact-match antar pasangan file.
- Menyediakan mode `strict` untuk mengurangi pengaruh header identitas dan template umum.
- Menampilkan ranking file berdasarkan persentase similarity tertinggi.
- Menampilkan detail pasangan file, highlight sinkron, klasifikasi template vs inti, dan status metadata dokumen.
- Export hasil ke CSV dan PDF.

## Functional Requirements

1. User dapat upload minimal 2 file dan maksimal 200 file per batch.
2. Sistem mendukung format `.txt`, `.docx`, dan `.pdf`.
3. Sistem mengekstrak text dari setiap file.
4. Sistem melakukan preprocessing text sebelum analisis.
5. Sistem menghitung similarity semua pasangan file.
6. Sistem menghitung `word overlap` exact-match untuk setiap pasangan file.
7. Sistem menyediakan mode `normal` dan `strict` untuk pembacaan similarity.
8. Sistem menampilkan ranking dokumen dengan similarity tertinggi.
9. Sistem menampilkan daftar pasangan file dengan persen similarity, strict similarity, dan word overlap.
10. Sistem menampilkan indikasi relasi siapa meniru siapa.
11. Sistem menampilkan detail pasangan file dan highlight teks yang sama di kedua sisi.
12. Sistem memungkinkan user mengatur template/kata pengecualian per mata kuliah untuk mode strict.
13. Sistem mengekstrak metadata `.docx` dan `.pdf` bila tersedia, seperti author, last saved by, created, dan modified.
14. Sistem menampilkan section `Status Dokumen` dan `Summary Kesimpulan` pada detail pair.
15. Sistem memungkinkan export hasil analisis ke CSV dan PDF.
16. Sistem memungkinkan reset data upload dan hasil analisis.
17. Sistem menghapus file fisik upload setelah parsing selesai.

## Non-Functional Requirements

- Tampilan harus dapat digunakan di desktop dan mobile.
- Analisis disimpan sementara di memory.
- Maksimum ukuran file per dokumen adalah 10MB.
- Waktu respons harus tetap masuk akal untuk batch ukuran sedang.
- File upload tidak disimpan permanen di server setelah parsing selesai.

## Success Metrics

- Waktu pemeriksaan manual berkurang signifikan.
- User dapat langsung melihat file paling bermasalah dalam satu halaman.
- User dapat mengetahui pasangan dokumen paling mirip tanpa cek manual satu per satu.

## Current Technical Approach

- Backend: Node.js + Express
- File upload: Multer
- DOCX parsing: Mammoth
- PDF parsing: pdf-parse
- OCR fallback untuk PDF scan-like: scribe.js-ocr
- Similarity: TF-IDF + Cosine Similarity + N-gram overlap + exact word overlap
- PDF report generation: PDFKit
- Storage: In-memory

## Known Limitations

- Belum ada database atau histori analisis lintas restart.
- Belum ada autentikasi user.
- Indikasi siapa meniru siapa masih heuristik, bukan bukti final.
- OCR fallback belum menjamin hasil bagus untuk scan berkualitas rendah.
- Pengaturan mata kuliah dan template pengecualian masih bersifat sementara dan hilang saat server restart.
- Metadata `.pdf` tidak selalu tersedia atau stabil, tergantung bagaimana file PDF dibuat.
- Tidak ada test suite otomatis.
- UI menggunakan bahasa Indonesia, belum ada dukungan multi-bahasa.

## Future Enhancements

1. Simpan histori analisis dan pengaturan mata kuliah ke database.
2. Tambahkan preset template pengecualian per mata kuliah.
3. Tambahkan filter hasil berdasarkan minimum similarity atau minimum word overlap.
4. Tambahkan autentikasi dan role user.
5. Tingkatkan OCR untuk PDF scan berkualitas rendah.
6. Tambahkan workflow review/approval hasil analisis.
7. Tambahkan dukungan untuk format file tambahan (`.py`, `.java`, `.cpp`, dll).
8. Tambahkan visualisasi statistik batch (distribusi similarity, trend, dll).
9. Tambahkan notifikasi email saat analisis selesai untuk batch besar.
10. Tambahkan dukungan multi-batch dan perbandingan lintas batch.
