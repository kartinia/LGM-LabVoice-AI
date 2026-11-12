# Status Projek & Pelan Pembangunan (Roadmap) — LGM LabVoice AI

Dokumen ini merekodkan status sebenar pelaksanaan sistem **LGM LabVoice AI**, fungsi yang telah dibina dan diuji, isu-isu yang diketahui, serta perancangan penambahbaikan pada fasa seterusnya.

---

## 1. Status Komponen Semasa

### A. Sudah Dibina dan Telah Diuji (Built & Verified):
- **Enjin Carian Suara Dwibahasa (*Speech-to-Text*):**
  - Menggunakan Web Speech API pelayar dengan pilihan bahasa `ms-MY` dan `en-US`.
  - Dilengkapi modul pembersihan input suara percakapan (*Wispr Flow & Voice Sanitizer*) yang menapis perkataan seperti *"Cakap"*, *"Okey"*, dan *"Saya nak cari"*.
- **Penganalisis Audio Visual & Bar Kemajuan TTS (*Waveform Analyzer*):**
  - Visualizer 32-bar audio equalizer dengan simulasi harmonik pertuturan.
  - Bar kemajuan masa nyata (*real-time progress bar*) dan penjejak perkataan (*word boundary ticker*).
  - Butang henti dan kawalan segera audio.
- **Enjin Jawapan AI Berpandukan Dokumen (*Grounded AI Engine*):**
  - Pemprosesan di bahagian pelayan (*server-side*) menggunakan model Google Gemini 3.8 Flash (`@google/genai`).
  - Dilengkapi sistem sitasi bernombor `[1]`, `[2]` terus ke fail sumber rujukan.
  - Jaminan sifar halusinasi (*Zero-Hallucination*)—jika maklumat tiada dalam dokumen, sistem menyatakan secara jelas bahawa data tidak ditemui.
- **Pratonton Resolusi Tinggi Kromatogram & Graf Makmal:**
  - Kromatogram HPTLC pemecut getah SMR 20 (TBBS, CBS, 6PPD).
  - Spektrum FTIR Epoxidised Natural Rubber (ENR-50).
  - Kromatogram GC-MS komponen meruap SMR CV60.
  - Graf lengkung pemvulkanan reometer MDR 2000 sebatian tayar NR/BR.
  - Kawalan zum interaktif (Zoom In sehingga 250%, Zoom Out, Reset).
  - Jadual pengesan puncak (*Peak Inspector*) memaparkan masa retensi dan luas puncak.
- **Pratonton Jadual Lembaran Excel:**
  - Paparan jadual data fizikal/kimia (kandungan kotoran, abu, bahan meruap, keplastikan P0, PRI, dan status standard MS 35 / ISO 2004).
- **Muat Turun Fail Format Asal Sebenar:**
  - Endpoint pelayan `/api/documents/:id/download` mengalirkan fail fizikal sebenar (`.xlsx`, `.docx`, `.png`, `.svg`) tanpa pemampatan atau pertukaran format ke PDF.
- **Pencarian Pantas Repositori (*Search-as-you-type File Explorer*):**
  - Penapisan langsung senarai fail makmal mengikut kata kunci aksara demi aksara.
- **Pengesahan Domain Emel & Kawalan Capaian (RBAC):**
  - Memerlukan domain `@lgm.gov.my`.
  - Pengasingan peranan Admin (Pegawai Penyelidik) dan Staff (RO/RA).
  - Panel tetapan pentadbir disembunyikan secara automatik daripada pengguna bertaraf Staff.
- **Antaramuka Responsif Hibrid:**
  - 3-panel Research Dashboard pada paparan desktop (lebar skrin ≥ 1024px).
  - Susun atur menegak dengan butang mikrofon terapung besar (56px × 56px) pada telefon mudah alih (lebar skrin < 1024px).

---

### B. Sudah Dibina Tetapi Belum Disahkan di Makmal Sebenar (Pending Live Lab Validation):
- **Pengecaman Suara dalam Persekitaran Kebuk Wasap Sebenar (*Live Fume Hood Noise*):**
  - Telah diuji dengan audio simulasi bunyi bising; belum diuji di hadapan kebuk wasap makmal kimia yang sedang beroperasi pada kapasiti penuh.
- **Penyelarasan Folder Google Drive Bersaiz Besar:**
  - Mekanisme penyelarasan disahkan berfungsi untuk set fail rujukan semasa; prestasi pengindeksan untuk ribuan fail serentak perlu disahkan apabila kapasiti storan bertambah.

---

### C. Isu Diketahui & Batasan Semasa (Known Issues & Limitations):
1. **Sokongan Pelayar Web Speech API:**
   - Web Speech API bergantung kepada sokongan pelayar web. Pelayar Google Chrome dan Microsoft Edge memberikan ketepatan tertinggi; sesetengah versi lama Safari memerlukan pengguna memberikan kebenaran mikrofon secara manual pada setiap sesi.
2. **Kualiti Mikrofon Peranti:**
   - Mikrofon terbina pada komputer riba pejabat kadangkala menangkap gema bilik; penggunaan fon kepala atau perisian penapis bunyi (*noise cancelling*) amat disyorkan.
3. **Penyelarasan SharePoint:**
   - Pada Fasa 1, fail daripada Microsoft SharePoint diselaraskan ke Google Drive melalui klien penyelarasan luaran (contohnya Google Drive for Desktop atau Power Automate).

---

## 2. Perancangan Pembangunan (Roadmap Fasa Seterusnya)

*Nota: Pelaksanaan fasa seterusnya bergantung kepada kelulusan pentadbiran dan keperluan operasi makmal.*

### Fasa 2 — Integrasi Terus & Analisis Lanjutan:
- **Integrasi Terus Microsoft SharePoint (Microsoft Graph API):**
  - Menghubungkan aplikasi terus ke pustaka dokumen SharePoint organisasi tanpa memerlukan folder perantara Google Drive.
- **Perbandingan Kromatogram Bersebelahan (*Side-by-Side Overlay Comparison*):**
  - Membolehkan Pegawai Penyelidik memilih dua atau lebih fail kromatogram dan menindih graf (*overlay*) untuk membandingkan anjakan masa retensi atau degradasi sampel.
- **Penjanaan Draf Laporan Ujian Automatik:**
  - Menyusun beberapa keputusan ujian terpilih (contoh: kromatogram + ujian fizikal) menjadi satu draf laporan teknikal ringkas sedia cetak.

### Fasa 3 — Peningkatan Mobiliti & Integrasi Instrumen:
- **Mod Luar Talian Terhad (*Offline Cache*):**
  - Membolehkan semakan rekod yang telah diindeks tanpa sambungan internet aktif di zon makmal terlindung.
- **Eksport Data ke LIMS (Laboratory Information Management System):**
  - Pautan API untuk mengeksport bacaan yang disahkan terus ke pangkalan data pusat pengurusan makmal LGM.
