# LGM LabVoice AI

**LGM LabVoice AI** ialah aplikasi pembantu penyelidikan digital yang membolehkan Pegawai Penyelidik dan staf makmal Lembaga Getah Malaysia (LGM) mencari, menyemak, dan mengekstrak rekod ujian kimia getah serta imej instrumen (seperti kromatogram dan spektrum) menggunakan pertanyaan suara dwibahasa (Bahasa Melayu dan Bahasa Inggeris).

---

## Masalah yang Diselesaikan

Dalam aktiviti harian pembangunan standard ujian kimia getah, staf makmal memuat naik pelbagai keputusan analisis ke dalam folder simpanan digital (SharePoint yang diselaraskan ke Google Drive). Fail-fail ini wujud dalam pelbagai format seperti lembaran kerja Excel (`.xlsx`), laporan teknikal Word (`.docx`), dan imej output perisian instrumen makmal (`.png`, `.jpg`).

Sebelum ini, apabila Pegawai Penyelidik perlu menyemak bacaan tertentu—seperti kandungan kotoran (*dirt content*) getah SMR 20 atau mengesahkan kehadiran pemecut vulkanisasi dalam kromatogram HPTLC—mereka terpaksa membuka folder dan fail satu demi satu secara manual. Proses ini mengambil masa beberapa minit bagi setiap semakan dan menyukarkan rujukan pantas ketika berada di makmal.

**LGM LabVoice AI** memendekkan masa carian kepada bawah 10 saat: penyelidik hanya perlu bertanya menggunakan suara dan sistem akan terus memaparkan jawapan berasaskan fakta, pratonton kromatogram atau jadual data, serta pautan muat turun fail format asal.

---

## Untuk Siapa?

1. **Pegawai Penyelidik (Leader / Admin):**
   - Membuat carian pantas melalui suara semasa di makmal atau meja kerja.
   - Menyemak graf kromatogram beresolusi tinggi dan data ujian standard.
   - Mengurus tetapan sambungan folder repositori dan kebenaran staf (*Role-Based Access Control* / RBAC).
2. **Staf Makmal & Pembantu Penyelidik (RO / RA):**
   - Menyemak data ujian harian sebelum menyediakan laporan.
   - Memuat naik fail hasil kerja baharu ke dalam sistem pengindeksan.
3. **Juruaudit Kualiti & Pematuhan Standard (MS 35 & ISO 2004):**
   - Menjejaki rekod asal ujian kimia getah bagi tujuan verifikasi pensijilan.

---

## Apa yang Boleh Dibuat?

- **Carian Suara Dwibahasa (*Speech-to-Text*):** Bertanya dalam Bahasa Melayu bercampur istilah saintifik Bahasa Inggeris (*code-switching*, contohnya: *"Tunjukkan kromatogram SMR 20 dan pemecut TBBS"*).
- **Pembersihan Suara Pintar (*Wispr Flow & Voice Sanitizer*):** Menapis perkataan perbualan secara automatik (seperti *"Cakap. Okey, saya nak tengok..."*) agar enjin carian mengekstrak kata kunci saintifik yang tepat.
- **Jawapan Berasaskan Fakta Dokumen (*Zero-Hallucination Grounded AI*):** Sistem dilarang mereka-reka nombor ujian; setiap fakta disertakan nombor rujukan sumber (seperti `[1]`, `[2]`).
- **Bacaan Suara Jawapan (*Text-to-Speech*) & Penganalisis Audio Visual (*Audio Analyzer*):** Membacakan ringkasan jawapan melalui suara untuk kegunaan bebas tangan (*hands-free*), lengkap dengan visualizer gelombang audio (*waveform*) dan bar kemajuan masa nyata.
- **Pratonton Visual Kromatogram & Pengesan Puncak (*Peak Inspector*):** Memaparkan imej kromatogram HPTLC, spektrum FTIR, GC-MS, dan graf lengkung pemvulkanan reometer MDR dengan fungsi zum masuk/keluar serta senarai masa retensi (*retention time* / Rf).
- **Pratonton Jadual Lembaran Excel:** Memaparkan data jadual terus pada skrin (contoh: Dirt Content, Ash Content, Plasticity, PRI).
- **Pengekalan Format Asal (*Exact Format Download*):** Fail asal dimuat turun mengikut format sebenar (`.xlsx` kekal `.xlsx`, `.png` kekal `.png`, `.docx` kekal `.docx`) tanpa pemampatan atau pertukaran ke PDF.
- **Pencarian Pantas Repositori (*Live Filter*):** Tapis senarai fail makmal secara langsung mengikut nama fail, jenis getah, atau jenis ujian.
- **Keselamatan Emel Rasmi LGM & Kawalan Peranan (RBAC):** Akses dihadkan kepada emel rasmi organisasi (`@lgm.gov.my`), dengan pengasingan menu tetapan pentadbir bagi akaun Admin.

---

## Contoh Cara Penggunaan

1. **Buka Aplikasi:** Pengguna log masuk menggunakan akaun rasmi LGM (contohnya: `kartinia@lgm.gov.my`).
2. **Buat Pertanyaan Suara:** Klik butang mikrofon dan sebutkan:
   > *"Tunjukkan kromatogram HPTLC dan keputusan ujian untuk sampel SMR 20."*
3. **Semak Jawapan AI:** Sistem mentranskripsikan suara, menganalisis indeks dokumen makmal, dan menjana ringkasan padat bersitasi `[1]`.
4. **Dengar Audio & Lihat Waveform:** TTS membacakan jawapan secara automatik sambil penganalisis audio visual memaparkan denyutan frekuensi suara.
5. **Teliti Pratonton:** Di panel sebelah kanan, imej kromatogram dipaparkan. Gunakan butang zum untuk memeriksa kedudukan puncak pemecut TBBS dan CBS, atau tukar ke tab Jadual Excel untuk melihat peratusan kotoran dan abu.
6. **Muat Turun Fail:** Klik butang muat turun untuk menyimpan salinan fail asal ke komputer anda.

---

## Cara Mencuba

Aplikasi ini boleh dicuba melalui pelayar web moden (Google Chrome, Microsoft Edge, atau Safari):

- **Pautan Aplikasi (Preview):** [Buka LGM LabVoice AI Preview](https://ais-pre-i2votkjpzuv7fxj5sm2alr-995611296018.asia-southeast1.run.app)
- **Pautan Pembangunan (Dev):** [Buka LGM LabVoice AI Dev](https://ais-dev-i2votkjpzuv7fxj5sm2alr-995611296018.asia-southeast1.run.app)

*(Nota: Untuk menggunakan carian suara, sila berikan kebenaran capaian mikrofon pada pelayar anda apabila diminta).*

---

## Status Projek Semasa

| Komponen / Ciri | Status | Catatan |
| :--- | :--- | :--- |
| Antaramuka Responsif (Desktop & Mobile) | **Siap & Telah Diuji** | Susun atur 3-panel pada desktop dan dok mikrofon mudah alih 56px. |
| Enjin Carian Suara & Pembersihan Teks | **Siap & Telah Diuji** | Menyokong Web Speech API, Wispr Flow, dan carian teks manual. |
| Grounded AI Answer (Gemini 3.8 Flash) | **Siap & Telah Diuji** | Berfungsi di pelayan (*server-side*) dengan sitasi `[1]`, `[2]`. |
| Penganalisis Audio Visual & Bar Kemajuan TTS | **Siap & Telah Diuji** | Waveform 32-bar, penjejak perkataan (*word ticker*), dan pemasa masa nyata. |
| Pratonton Kromatogram & Jadual Excel | **Siap & Telah Diuji** | Disertakan zum, pengesan puncak, dan pemapar jadual data. |
| Muat Turun Format Asal (.xlsx, .png, .docx) | **Siap & Telah Diuji** | Format asal dipelihara tanpa penukaran fail. |
| Pengesahan Domain Emel & RBAC | **Siap & Telah Diuji** | Domain `@lgm.gov.my` disahkan; akaun luar ditolak dengan status 403. |
| Integrasi Google Drive Sebenar (API / OAuth) | **Siap Disambungkan (Mirror Mode)** | Repositori menggunakan penyelarasan folder setempat; OAuth sedia disambungkan. |
| Integrasi Langsung Microsoft SharePoint Graph | **Dirancang (Fasa 2)** | Memerlukan kelulusan pentadbir IT organisasi LGM pada masa hadapan. |
| Perbandingan Kromatogram Bersebelahan (Overlay) | **Dirancang (Fasa 2)** | Ciri perbandingan visual dwi-kromatogram untuk versi akan datang. |

---

## Panduan Lanjut

Sila rujuk dokumen terperinci di dalam folder `docs/`:

- [Panduan Pengguna Langkah demi Langkah](docs/PANDUAN-PENGGUNA.md) — Panduan bergambar cara guna, carian suara, dan tips soalan makmal.
- [Keperluan Produk & Spesifikasi PRD](docs/KEPERLUAN-PRODUK.md) — Huraian keperluan fungsian, business rules, dan kriteria penerimaan.
- [Status dan Perancangan (Roadmap)](docs/STATUS-DAN-ROADMAP.md) — Perincian apa yang sudah siap, isu diketahui, dan pelan Fasa 2.
- [Data, Privasi dan Keselamatan](docs/DATA-DAN-PRIVASI.md) — Bagaimana data ujian getah dikendalikan, disimpan, dan dilindungi.
- [Panduan Setup & Penyelenggaraan Teknikal](docs/SETUP-DAN-PENYELENGGARAAN.md) — Arahan menjalankan kod sumber, pembolehubah persekitaran (*environment variables*), dan build.
- [Rekod Perubahan (Changelog)](CHANGELOG.md) — Sejarah kemas kini dan versi aplikasi.

---

## Ringkasan Teknologi yang Digunakan

Aplikasi ini dibina berasaskan teknologi web moden:

- **React 19:** Digunakan untuk membina paparan antaramuka pengguna yang responsif dan interaktif.
- **TypeScript:** Menjamin ketepatan jenis data (*type safety*) dan mengurangkan ralat pengaturcaraan.
- **Tailwind CSS:** Digunakan untuk reka bentuk visual profesional dengan palet warna saintifik (*teal & slate*).
- **Node.js & Express:** Menyediakan pelayan belakang (*backend server*) untuk memproses carian, mengurus fail, dan melindungi kunci API.
- **Google Gemini 3.8 Flash (`@google/genai`):** Model kecerdasan buatan multimodal di bahagian pelayan untuk memahami soalan bahasa tabii dan mengekstrak fakta daripada dokumen makmal.
- **Web Speech API & Web Audio API:** Mengendalikan pengecaman suara (*Speech-to-Text*) pada pelayar dan animasi penganalisis frekuensi suara (*audio analyzer*).
- **Multer:** Mengendalikan muat naik fail ujian makmal secara terus ke dalam pelayan.

---

## Maklum Balas & Bantuan

Sekiranya anda menemui sebarang masalah atau mempunyai cadangan penambahbaikan, anda boleh:
1. Membuka isu baharu di tab **Issues** pada repository GitHub ini.
2. Menghubungi pasukan penyelidikan Unit Pembangunan Standard Ujian Kimia Makmal LGM.

---

*Hak Cipta © 2026 Lembaga Getah Malaysia (LGM). Disediakan untuk kegunaan penyelidikan rasmi.*
