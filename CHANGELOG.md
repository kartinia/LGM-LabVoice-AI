# Rekod Perubahan (Changelog) — LGM LabVoice AI

Semua perubahan dan peningkatan utama pada projek **LGM LabVoice AI** direkodkan dalam dokumen ini mengikut susunan versi.

---

## [v1.0.0] — 12 November 2026

### Ditambah (Added):
- **Binaan Teras MVP Berasaskan PRD v1.0:**
  - Pembangunan penuh aplikasi web penyelidikan berasaskan React 19, TypeScript, Tailwind CSS, dan pelayan Express.
- **Enjin Carian Suara Dwibahasa (*Speech-to-Text*):**
  - Sokongan dwi-bahasa (Bahasa Melayu `ms-MY` dan Bahasa Inggeris `en-US`).
  - Sokongan *code-switching* istilah saintifik kimia getah (seperti *chromatogram*, *accelerator*, *6PPD*, *retention time*, *Mooney viscosity*).
  - Modul pembersih pertuturan (*Wispr Flow & Voice Sanitizer*) untuk menyingkirkan perkataan perbualan secara automatik.
- **Penganalisis Audio Visual & Waveform Progress Bar:**
  - Visualizer 32-bar audio equalizer dengan simulasi harmonik pertuturan.
  - Bar kemajuan masa nyata (*waveform progress glow*) yang berhubung dengan acara `speechSynthesis.onboundary` untuk penjejakan perkataan semasa (*word ticker*).
  - Butang henti dan kawalan audio segera.
- **Enjin Jawapan AI Berpandukan Dokumen (*Grounded AI with Gemini 3.8 Flash*):**
  - Pelaksanaan panggilan model AI di bahagian pelayan (*server-side*) bagi melindungi kunci API.
  - Sistem sitasi bernombor `[1]`, `[2]` yang memaut terus ke rekod rujukan makmal.
  - Jaminan sifar halusinasi (*Zero-Hallucination Grounding*).
- **Pratonton Visual Kromatogram & Pengesan Puncak (*Peak Inspector*):**
  - Pratonton resolusi tinggi kromatogram HPTLC SMR 20 Lot B44, spektrum FTIR ENR-50, GC-MS SMR CV60, dan graf reometer MDR 2000.
  - Kawalan zum interaktif (Zoom In sehingga 250%, Zoom Out, Reset).
  - Jadual masa retensi dan luas puncak kimia.
- **Pratonton Jadual Lembaran Excel:**
  - Paparan jadual data fizikal/kimia (kandungan kotoran, abu, bahan meruap, dan nilai PRI).
- **Pengekalan Format Asal (*Exact Format Download*):**
  - Endpoint muat turun fail mengalirkan format asal `.xlsx`, `.docx`, dan `.png` tanpa penukaran format atau pemampatan.
- **Pencarian Pantas Repositori (*Search-as-you-type File Explorer*):**
  - Kotak penapis langsung pada senarai fail makmal untuk capaian pantas tanpa pertanyaan suara penuh.
- **Kawalan Keselamatan & Peranan Pengguna (RBAC):**
  - Sekatan domain rasmi organisasi `@lgm.gov.my`.
  - Pengasingan peranan Pegawai Penyelidik (Admin) vs Staf Makmal (Staff / RO / RA).
  - Penyembunyian menu pentadbir bagi pengguna bertaraf Staff.
- **Dokumentasi Lengkap Projek:**
  - `README.md` utama, `PANDUAN-PENGGUNA.md`, `KEPERLUAN-PRODUK.md`, `STATUS-DAN-ROADMAP.md`, `DATA-DAN-PRIVASI.md`, dan `SETUP-DAN-PENYELENGGARAAN.md`.
