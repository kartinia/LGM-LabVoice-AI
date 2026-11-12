# Keperluan Produk & Spesifikasi Sistem — LGM LabVoice AI

Dokumen ini merangkumkan keperluan produk rasmi berasaskan dokumen **Product Requirements Document (PRD v1.0, 12 November 2026)** untuk sistem **LGM LabVoice AI** Lembaga Getah Malaysia.

---

## 1. Tujuan Produk & Sasaran Pengguna

- **Tujuan Produk:** Menyediakan pembantu penyelidikan digital berasaskan suara dwibahasa dan pemprosesan dokumen multimodal bagi mempercepat capaian terhadap rekod ujian kimia dan pembangunan standard makmal getah.
- **Sasaran Pengguna:**
  1. **Pegawai Penyelidik (Leader / Admin):** Ketua projek pembangunan standard ujian kimia yang memerlukan semakan data pantas di pejabat atau makmal, pengesahan kromatogram, dan pengurusan tetapan sistem.
  2. **Staf Makmal (RO / RA):** Pegawai Penyelidik dan Pembantu Penyelidik yang menjalankan ujian analisis getah harian dan mengemas kini repositori fail.

---

## 2. Skop MVP (Fasa 1 — Binaan Utama)

Berdasarkan Seksyen 6 PRD, skop Fasa 1 yang disahkan merangkumi:

1. **Pengesahan Pengguna & Kawalan Akses (RBAC):** Log masuk dengan pengesahan emel rasmi organisasi (`@lgm.gov.my`) dan pengasingan peranan Admin (Pegawai Penyelidik) vs Staff (RO/RA).
2. **Penyambungan & Pengindeksan Fail Multimodal:** Pengindeksan dokumen Microsoft Office (`.xlsx`, `.docx`, `.pptx`, `.pdf`, `.csv`) serta imej instrumen (`.png`, `.jpg`, `.svg`) daripada folder Google Drive (diselaraskan daripada SharePoint) dan fungsi muat naik terus (*direct upload*).
3. **Enjin Carian Suara Dwibahasa (*Speech-to-Text*):** Pengecaman suara dwibahasa (Bahasa Melayu + istilah teknikal Bahasa Inggeris), kotak carian teks manual, dan panel tapisan metadata.
4. **Penjanaan Jawapan Multimodal Berasaskan Sumber (*Grounded AI*):** Jawapan fakta ringkas disintesis oleh model AI berpandukan dokumen sebenar dengan sitasi bernombor `[1]`, `[2]` tanpa sebarang rekaan nombor ujian (*zero-hallucination*).
5. **Bacaan Suara Jawapan (*Text-to-Speech*) & Penganalisis Audio Visual:** Menjana suara jawapan berserta penganalisis frekuensi audio visual (*equalizer waveform*) dan bar kemajuan masa nyata.
6. **Pratonton Visual/Jadual & Muat Turun Format Asal:** Pratonton imej kromatogram dengan keupayaan zum, jadual data Excel, dan butang muat turun format asal.
7. **Antaramuka Responsif Hibrid:** Mod *Research Dashboard* (3 panel) pada skrin desktop/komputer riba, dan mod *Minimalist Voice-First* dengan butang mikrofon besar (≥56px) pada telefon mudah alih.

### Skop Fasa Seterusnya (Fasa 2 — Dirancang):
- Sambungan langsung ke Microsoft SharePoint melalui Microsoft Graph API.
- Perbandingan automatik dua atau lebih kromatogram secara bersebelahan (*side-by-side overlay*).
- Penjanaan draf laporan ringkas automatik daripada beberapa fail ujian terpilih.

### Di Luar Skop (*Out of Scope*):
- Penyuntingan langsung kandungan fail Excel/Word di dalam aplikasi web.
- Kawalan perkakasan instrumen makmal secara masa nyata (*real-time instrument hardware control*).

---

## 3. Alur Kerja Pengguna Utama (User Journeys)

### Journey 1: Carian Data Ujian & Kromatogram Melalui Suara (Pegawai Penyelidik)
1. Pengguna membuka aplikasi pada komputer atau telefon pintar dan disahkan peranan aksesnya.
2. Pengguna menekan butang mikrofon dan bercakap secara natural: *"Cari keputusan HPTLC dan kromatogram untuk sampel SMR 20 yang diuji minggu lepas."*
3. Sistem mentranskripsikan suara ke dalam bar carian, membersihkan perkataan perbualan, dan memadankan dokumen terindeks.
4. Sistem memaparkan ringkasan jawapan teks di skrin dan membacakan ringkasan tersebut melalui suara dengan penganalisis audio visual.
5. Sistem memaparkan imej kromatogram sepadan bersama petikan lajur data Excel di panel pratonton.
6. Penyelidik boleh menekan butang **Muat Turun Fail Asal** atau **Buka di Drive** untuk semakan lanjut.

### Journey 2: Penyelarasan & Pengemaskinian Fail Hasil Kerja Makmal (Staf Makmal)
1. Staf makmal selesai menjalankan analisis sampel dan menyimpan fail ke dalam folder kongsi.
2. Staf atau Admin menekan butang **Sync / Refresh Index** pada papan pemuka (atau menggunakan fungsi **Muat Naik Fail Terus**).
3. Sistem mengindeks fail baharu dan mengesahkan ia sedia untuk carian suara multimodal.

---

## 4. Peraturan Bisnes & Keselamatan (Business Rules)

1. **Pengekalan Format Asal (Rule 13):** Sistem dilarang menukar atau memampatkan fail asal semasa muat turun. Fail Excel kekal `.xlsx`, Word kekal `.docx`, dan imej kekal dalam resolusi asalnya.
2. **Pengendalian Campuran Bahasa (*Code-Switching*):** Enjin carian memadankan sinonim istilah makmal tempatan dan antarabangsa (contoh: *"getah kering"* = *"dry rubber"*, *"kromatogram"* = *"chromatogram"*, *"pemecut"* = *"accelerator"*, *"kotoran"* = *"dirt content"*, *"abu"* = *"ash content"*).
3. **Pengendalian Versi & Fail Baharu:** Jika fail dimuat naik dengan nama sama atau tarikh lebih baharu, indeks dikemas kini kepada versi terkini dengan catatan tarikh kemas kini.
4. **Kegagalan Mikrofon atau Rangkaian:** Jika sambungan terganggu atau mikrofon disekat, mesej notifikasi yang jelas dipaparkan dan kotak carian teks manual dikekalkan agar kerja makmal tidak tergendala.
5. **Keselamatan Rahsia Pelayan:** Semua kunci API (seperti Gemini API Key) disimpan di bahagian pelayan (*server-side environment variables*) dan tidak boleh didedahkan pada kod pelayar web.

---

## 5. Senarai Kriteria Penerimaan (Acceptance Criteria)

| ID Ujian | Rujukan FR | Kriteria Pengesahan yang Boleh Diuji | Status Semasa |
| :--- | :--- | :--- | :--- |
| **AC-01** | FR-001 | Pengguna dengan emel rasmi `@lgm.gov.my` berjaya log masuk dan melihat menu mengikut peranan (Admin atau Staff); emel tidak dibenarkan disekat. | **Telah Disahkan** |
| **AC-02** | FR-002 | Pertanyaan suara campuran BM dan English (*code-switching*) ditranskripsikan dengan tepat ke dalam kotak carian. | **Telah Disahkan** |
| **AC-03** | FR-003 | Sistem berjaya membaca dan mengindeks data daripada fail `.xlsx`, `.docx`, dan imej `.png`/`.svg` dari folder sumber. | **Telah Disahkan** |
| **AC-04** | FR-004 | Pemilihan filter *Jenis Getah* dan *Julat Tarikh/Format/Staf* menyaring hasil carian dan boleh dikosongkan dengan butang *Reset*. | **Telah Disahkan** |
| **AC-05** | FR-005 | Jawapan AI menyertakan rujukan nama fail sumber `[1]`, `[2]`, tiada data direka (*zero-hallucination*), dan suara TTS membacakan jawapan. | **Telah Disahkan** |
| **AC-06** | FR-006 | Imej kromatogram dipaparkan di panel pratonton dengan kawalan zum, dan muat turun menghasilkan fail format asal. | **Telah Disahkan** |
| **AC-07** | Seksyen 9 | Susun atur bertukar secara automatik daripada 3-panel Dashboard (desktop) kepada paparan butang mikrofon utama (mudah alih). | **Telah Disahkan** |

---

## 6. Rujukan Dokumen Asal

- **Fail PRD Asal:** `LGM_LabVoice_AI_-_Product_Requirements_Document__PRD___1__eb99a7cf.pdf` (Tersimpan dalam repositori di `/public/assets/aistudio/LGM_LabVoice_AI_-_Product_Requirements_Document__PRD___1__eb99a7cf.pdf`).
- **Versi PRD:** v1.0 (Disahkan, 12 November 2026).
