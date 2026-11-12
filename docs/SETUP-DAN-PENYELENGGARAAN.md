# Panduan Setup & Penyelenggaraan Teknikal — LGM LabVoice AI

Dokumen ini menyediakan arahan teknikal langkah demi langkah untuk menjalankan, menguji, membina, dan menyelenggara aplikasi **LGM LabVoice AI** dalam persekitaran pembangunan tempatan (*local environment*) atau pelayan awan.

---

## 1. Keperluan Sistem

Sebelum memulakan, pastikan persekitaran komputer anda mempunyai:

- **Node.js:** Versi `18.x` atau lebih baharu (disyorkan `Node.js 20 LTS` atau `22`).
- **npm:** Versi `9.x` atau lebih baharu.
- **Pelayar Web Moden:** Google Chrome, Microsoft Edge, atau Safari dengan sokongan Web Speech API dan Web Audio.
- **Kunci API Gemini:** Kunci API daripada Google AI Studio untuk pemprosesan jawapan berpandukan dokumen (*grounded AI*).

---

## 2. Struktur Projek

```
├── .env.example             # Contoh pembolehubah persekitaran
├── .gitignore               # Senarai fail diabaikan oleh Git
├── CHANGELOG.md             # Rekod versi dan kemas kini
├── index.html               # Titik masuk HTML aplikasi
├── metadata.json            # Konfigurasi metadata AI Studio
├── package.json             # Pengisytiharan pakej dan skrip arahan
├── tsconfig.json            # Konfigurasi pengkompil TypeScript
├── vite.config.ts           # Konfigurasi bundler Vite & Tailwind CSS
├── server.ts                # Pelayan belakang Express & integrasi Gemini API
├── src/
│   ├── App.tsx              # Komponen utama React & antaramuka responsif
│   ├── index.css            # Penggayaan global Tailwind CSS & animasi audio
│   └── main.tsx             # Titik masuk pemulaan React (DOM Mount)
└── docs/
    ├── PANDUAN-PENGGUNA.md           # Panduan penggunaan untuk staf makmal
    ├── KEPERLUAN-PRODUK.md          # Spesifikasi PRD v1.0
    ├── STATUS-DAN-ROADMAP.md        # Status binaan dan perancangan Fasa 2
    ├── DATA-DAN-PRIVASI.md          # Polisi data, keselamatan & RBAC
    └── SETUP-DAN-PENYELENGGARAAN.md # Dokumen teknikal ini
```

---

## 3. Langkah Pemasangan & Menjalankan Aplikasi

### Langkah 1: Klon atau Buka Direktori Projek
```bash
git clone <URL_REPOSITORY_ANDA>
cd lgm-labvoice-ai
```

### Langkah 2: Pasang Pakej Ketergantungan (*Dependencies*)
Jalankan arahan npm install untuk memuat turun pakej yang diperlukan:
```bash
npm install
```

### Langkah 3: Konfigurasi Pembolehubah Persekitaran (*Environment Variables*)
Salin fail `.env.example` kepada `.env`:
```bash
cp .env.example .env
```

Buka fail `.env` dan masukkan kunci API anda:
```env
# Kunci API Gemini (Wajib untuk carian pintar dan grounded answer)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# URL Hos Aplikasi
APP_URL="http://localhost:3000"

# Port Pelayan (Pilihan, lalai: 3000)
PORT=3000
```

> **PENTING:** Jangan sekali-kali melakukan *commit* fail `.env` ke dalam GitHub untuk melindungi kunci rahsia anda. Fail `.gitignore` telah dikonfigurasi untuk mengabaikannya secara automatik.

### Langkah 4: Mulakan Pelayan Pembangunan (*Development Server*)
```bash
npm run dev
```

Aplikasi akan dimulakan pada mod tindanan penuh (*full-stack*):
- Pelayan Express mengendalikan endpoint `/api/*`.
- Vite dev server middleware mengendalikan paparan antaramuka React secara lancar.
- Akses aplikasi pada pelayar web melalui: `http://localhost:3000`

---

## 4. Arahan Pengesahan & Pembinaan (*Build & Lint*)

### Menyemak Ralat Sintaks & TypeScript:
```bash
npm run lint
```
Arahan ini menjalankan `tsc --noEmit` untuk mengesahkan tiada ralat jenis (*type error*) dalam kod TypeScript.

### Membina Kod untuk Pengeluaran (*Production Build*):
```bash
npm run build
```
Fail produksi yang dioptimumkan akan dijana ke dalam direktori `dist/`.

### Menjalankan Pelayan Mod Pengeluaran:
```bash
npm run start
```
Menjalankan pelayan Express menggunakan fail yang telah dibina.

---

## 5. Konfigurasi Repositori Google Drive & SharePoint

Sistem menggunakan konsep *Mirror Mode* daripada SharePoint ke Google Drive:

1. **Folder ID Google Drive:**
   - Folder lalai yang dikonfigurasikan ialah `1G-LGM-Makmal-SharePoint-Sync-2026`.
   - Untuk menukar folder ini, log masuk sebagai **Dr. Kartini Ahmad (Admin)**, klik ikon **Settings** di bar navigasi atas, dan kemas kini ID folder mengikut ID sebenar di Google Drive organisasi anda.
2. **Penyelarasan Fail:**
   - Staf makmal boleh memuat naik fail harian terus ke folder SharePoint yang diselaraskan (melalui *Google Drive for Desktop* atau *Power Automate*).
   - Menekan butang **Sync / Refresh Index** pada aplikasi akan mencetuskan pengindeksan semula fail dalam repositori.

---

## 6. Penyelesaian Masalah Teknikal (Troubleshooting)

### A. Ralat "Port 3000 already in use"
Sekiranya port 3000 sedang digunakan oleh aplikasi lain:
```bash
# Untuk Linux / macOS:
lsof -ti:3000 | xargs kill -9

# Atau ubah PORT dalam .env:
PORT=3005
```

### B. Kunci API Gemini Tidak Dikesan / Ralat 400 atau 403
- Pastikan pembolehubah `GEMINI_API_KEY` telah ditetapkan dalam fail `.env` pelayan.
- Dalam AI Studio, pastikan kunci API telah dipilih melalui panel **Settings > Secrets**.
- Sekiranya kunci API tiada, sistem secara pintar akan menggunakan *grounded fallback generator* berasaskan fail rujukan tempatan agar aplikasi tidak tergendala.

### C. Ralat Pemasangan Pakej
Sekiranya terdapat konflik dependensi atau cache yang korup:
```bash
rm -rf node_modules package-lock.json
npm install
```
