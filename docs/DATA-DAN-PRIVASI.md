# Data, Privasi & Keselamatan — LGM LabVoice AI

Dokumen ini menjelaskan pengendalian data, aliran maklumat, dan langkah keselamatan yang dilaksanakan dalam sistem **LGM LabVoice AI** berasaskan kod aplikasi sebenar.

---

## 1. Data yang Dikumpulkan oleh Aplikasi

Aplikasi mengendalikan tiga kategori maklumat utama:

1. **Profil Pengguna (*UserProfile*):**
   - Alamat emel rasmi (contoh: `kartinia@lgm.gov.my`).
   - Nama penuh pengguna.
   - Peranan akses (*Admin* atau *Staff*).
   - Bahagian / Unit penyelidikan.
   - Cap masa log masuk terakhir (*last_login timestamp*).
2. **Metadata & Kandungan Rekod Makmal (*DocumentRecord*):**
   - Nama fail dan ekstensi (contoh: `.xlsx`, `.docx`, `.png`).
   - Laluan folder asal di repositori Google Drive / SharePoint.
   - Jenis getah yang diuji (SMR 20, SMR CV60, Lateks, ENR, Compound).
   - Jenis ujian kimia/fizikal yang dijalankan.
   - Nama pegawai penyelidik yang menguji/memuat naik.
   - Petikan jadual data berstruktur dan bacaan puncak kromatogram (*retention time / Rf*).
3. **Data Pertanyaan & Sesi Carian (*Search Query & Audio*):**
   - Teks pertanyaan yang dimasukkan melalui suara atau teks.
   - Mod input (*Voice* atau *Text*).
   - Parameter tapisan aktif semasa carian dibuat.
   - *Nota mengenai audio suara:* Audio suara diproses oleh enjin pengecaman suara (*Web Speech API*) pada peranti pelayar pengguna; fail rakaman audio mentah tidak disimpan secara kekal dalam pangkalan data pelayan.

---

## 2. Di Mana Data Disimpan?

- **Penyimpanan Fail Makmal:**
  - Fail fizikal yang dimuat naik atau diselaraskan disimpan di dalam direktori selamat pelayan belakang (`data/lab_files/`).
  - Metadata rekod disimpan dalam struktur indeks data pelayan.
- **Tiada Pendedahan Kunci Rahsia:**
  - Kunci capaian perkhidmatan (seperti `GEMINI_API_KEY`) disimpan sebagai pembolehubah persekitaran (*environment variables*) di bahagian pelayan sahaja. Kod klien di pelayar web tidak mempunyai akses kepada sebarang kunci rahsia.

---

## 3. Komunikasi dengan Perkhidmatan Luar & Model AI

1. **Model Kecerdasan Buatan (Google Gemini API):**
   - Apabila pengguna membuat pertanyaan carian, hanya teks soalan dan segmen teks dokumen makmal yang berkaitan dihantar ke endpoint pelayan Google Gemini API (`gemini-3.8-flash`) untuk penjanaan jawapan berpandukan rujukan (*grounded response*).
   - Penghantaran data dilakukan melalui sambungan selamat HTTPS dengan pengenalpasti `User-Agent: aistudio-build`.
   - Tiada fail instrumen asal yang dimuat naik secara terbuka ke pelayan luar tanpa kawalan.
2. **Web Speech API & Text-to-Speech:**
   - Pertukaran suara kepada teks (*Speech-to-Text*) dan bacaan suara (*Text-to-Speech*) diproses menggunakan perkhidmatan pertuturan standard pelayar web pengguna.

---

## 4. Kawalan Akses & Keselamatan Peranan (RBAC)

- **Sekatan Domain Rasmi:**
  - Sistem hanya membenarkan pengesahan pengguna yang menggunakan domain emel rasmi `@lgm.gov.my`.
  - Sebarang percubaan akses menggunakan emel awam luar ditolak serta-merta oleh pengesah pelayan (*server-side authorization guard*).
- **Pengasingan Peranan Admin vs Staff:**
  - **Pegawai Penyelidik (Admin):** Mempunyai kebenaran mengubah ID folder Google Drive yang terpaut, menyelaraskan fail, dan mengurus senarai staf.
  - **Staf Makmal (Staff / RO / RA):** Hanya dibenarkan membuat carian, menyemak keputusan, memuat turun fail format asal, dan memuat naik rekod baharu ke repositori. Menu pengurusan sistem disembunyikan sepenuhnya.

---

## 5. Pengekalan Data & Pemadaman

- **Pengekalan Format Asal:** Sistem tidak memampatkan, mengubah kandungan, atau menukar format fail semasa proses carian atau muat turun.
- **Pemadaman Rekod:** Pemadaman fail makmal dikawal di peringkat repositori folder Google Drive induk oleh pentadbir makmal yang diberi kuasa.

---

## 6. Batasan & Status Pematuhan

- Aplikasi ini dibangunkan sebagai sistem penyelidikan dalaman (MVP).
- Pengauditan keselamatan siber bebas dan pematuhan rasmi Akta Perlindungan Data Peribadi (PDPA) atau piawaian keselamatan ICT agensi kerajaan perlu diselaraskan bersama bahagian teknologi maklumat organisasi sebelum pelaksanaan berskala nasional.
