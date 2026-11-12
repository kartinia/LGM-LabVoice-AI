# Panduan Pengguna — LGM LabVoice AI

Panduan ini menerangkan cara menggunakan sistem **LGM LabVoice AI** langkah demi langkah untuk Pegawai Penyelidik dan staf makmal Lembaga Getah Malaysia (LGM).

---

## 1. Log Masuk & Kawalan Peranan Pengguna (RBAC)

Aplikasi ini dilindungi oleh kawalan keselamatan berasaskan domain rasmi Lembaga Getah Malaysia.

### Langkah Log Masuk:
1. Klik pada **lencana profil pengguna** di bahagian atas kanan skrin.
2. Masukkan alamat emel rasmi anda yang berakhir dengan `@lgm.gov.my` (contohnya: `kartinia@lgm.gov.my`).
3. Pilih peranan anda:
   - **Pegawai Penyelidik (Admin):** Mempunyai akses penuh termasuk carian, muat turun, muat naik, dan tetapan folder Google Drive.
   - **Staf Makmal (Staff / RO / RA):** Mempunyai akses carian, semakan data, dan muat naik fail makmal.
4. Klik **Log Masuk**.

> **Nota Keselamatan:** Sebarang percubaan log masuk menggunakan emel peribadi luar (seperti `@gmail.com` atau `@yahoo.com`) akan ditolak secara automatik dengan mesej amaran akses.

---

## 2. Cara Membuat Carian Suara (Voice Search)

Sistem menyokong pertanyaan dwibahasa (Bahasa Melayu bercampur istilah saintifik Bahasa Inggeris).

### Langkah Carian:
1. Klik butang **mikrofon hijau** di sebelah kanan kotak carian (atau pada dok terapung mikrofon di telefon pintar).
2. Apabila butang bertukar menjadi **merah** dan gelombang audio berdenyut, sebutkan pertanyaan anda dengan jelas (sehingga maksimum 60 saat).
3. Anda boleh bertutur secara santai:
   - *"Tunjukkan kromatogram SMR 20 dan bacaan pemecut TBBS."*
   - *"Berapa peratusan kotoran (dirt content) dan abu bagi sampel getah SMR 20 Lot B44?"*
   - *"Cari spektrum FTIR bagi getah Epoxidised NR (ENR-50)."*
   - *"Apakah keputusan ujian lateks pekat mengikut ISO 2004?"*
   - *"Tunjukkan graf reometer MDR lengkung pemvulkanan sebatian tayar."*
4. Klik butang mikrofon sekali lagi (atau tunggu anda selesai bercakap) untuk menamatkan rakaman.
5. Teks transkripsi akan dipaparkan dalam kotak carian. Anda boleh membetulkan atau menambah teks secara manual sekiranya perlu, kemudian tekan kekunci **Enter** atau klik **Cari Dokumen**.

### Sokongan Alat Dikte Suara Tambahan (Contoh: Wispr Flow):
Sekiranya anda menggunakan perisian dikte luaran seperti **Wispr Flow**, sistem secara automatik membersihkan kata pembuka percakapan (seperti *"Cakap. Okey, saya dah try cari..."*) dan terus memadankan kata kunci saintifik makmal yang tepat.

---

## 3. Memahami Kad Jawapan Pintar AI & Audio Visualizer

Sebaik sahaja carian selesai:

1. **Ringkasan Jawapan Berasaskan Fakta (*Grounded Answer*):**
   - AI hanya mengekstrak maklumat sebenar daripada dokumen rujukan makmal.
   - Tiada nombor bacaan yang direka-reka (*Zero-Hallucination Guarantee*).
2. **Sitasi Bernombor (`[1]`, `[2]`):**
   - Setiap fakta dipautkan kepada fail dokumen sumber asal. Anda boleh mengklik mana-mana kad rujukan untuk membuka pratonton dokumen tersebut secara langsung.
3. **Penganalisis Audio Visual (*Visual Audio Analyzer*) & Text-to-Speech (TTS):**
   - Sistem akan membacakan ringkasan jawapan melalui suara.
   - Semasa suara dimainkan, satu **audio equalizer 32-bar** yang berdenyut serta **bar kemajuan masa nyata** (*waveform progress bar*) akan dipaparkan di bawah kotak carian.
   - Anda boleh menekan butang **Henti** bila-bila masa sekiranya ingin menghentikan audio.

---

## 4. Meneliti Pratonton Visual Kromatogram & Jadual Data

Di panel sebelah kanan (atau di bawah skrin pada telefon mudah alih), terdapat 3 tab pratonton:

### Tab 1: Kromatogram / Graf Spektrum
- **Pratonton Resolusi Tinggi:** Memaparkan visual kromatogram HPTLC, spektrum FTIR, GC-MS, atau graf reometer MDR.
- **Kawalan Zum (Zoom):**
  - Butang **`+` (Zoom In):** Membesarkan graf sehingga 250% untuk memeriksa perincian puncak kromatogram yang halus.
  - Butang **`-` (Zoom Out):** Mengecilkan paparan graf.
  - Butang **Putar Semula (Reset):** Mengembalikan paparan ke saiz 100% asal.
- **Jadual Pengesan Puncak (*Peak Inspector Table*):** Memaparkan senarai nama sebatian kimia (cth: TBBS, CBS, Antioksidan 6PPD, Gelang Oksirana), nilai retensi (*Retention Time / Rf*), serta luas puncak / kepekatan (*phr*).

### Tab 2: Jadual Excel
- Memaparkan petikan baris dan lajur hamparan Excel sebenar lengkap dengan nombor sampel, nombor lot, serta status standard (*LULUS* atau *AMARAN*).

### Tab 3: Metadata Dokumen
- Memaparkan saiz fail dalam bait/kilobait, tarikh kemas kini terkini, nama staf penguji, dan laluan folder asal di Google Drive / SharePoint.

---

## 5. Memuat Turun Fail Format Asal

Untuk menyemak atau memproses fail menggunakan perisian makmal anda:
1. Klik butang **ikon muat turun** pada mana-mana kad fail.
2. Fail akan dimuat turun **mengikut format asal sepenuhnya**:
   - Lembaran kerja dimuat turun sebagai `.xlsx`.
   - Laporan teknikal dimuat turun sebagai `.docx`.
   - Imej instrumen dimuat turun sebagai `.png` atau `.svg` resolusi penuh.
3. Format asal tidak dimampatkan atau ditukar kepada PDF.

---

## 6. Menggunakan Penapis Pantas & Pencarian Fail Langsung

### Tapisan Makmal (Bar Sisi Kiri / Laci Mudah Alih):
- **Jenis Getah:** SMR 20, SMR CV60, Lateks Pekat, Epoxidised NR, atau Compound.
- **Format Fail:** Imej Instrumen, Hamparan Excel, atau Laporan Word.
- **Pegawai Penyelidik:** Tapis mengikut nama staf yang menjalankan ujian.
- **Butang Reset:** Mengosongkan semula semua penapis aktif.

### Kotak Tapis Segera Senarai Fail (*Search-as-you-type File Explorer*):
Di dalam kad **Repositori Fail Makmal**, terdapat kotak carian pantas. Taipkan sebarang huruf (cth: `b44`, `dirt`, `lateks`, `ftir`, `mdr`) dan senarai fail akan ditapis secara langsung tanpa memerlukan kitaran pertanyaan suara penuh.

---

## 7. Penyelarasan Repositori & Muat Naik Fail Baharu

### Penyelarasan Segera (*Sync / Refresh Index*):
- Klik butang **Sync / Refresh Index** untuk mengarahkan sistem menyemak folder Google Drive (yang diselaraskan daripada SharePoint) dan mengindeks fail baharu.

### Muat Naik Fail Terus (*Direct Upload*):
1. Klik butang **Muat Naik Fail** di bar navigasi atas.
2. Pilih fail makmal daripada komputer anda (`.xlsx`, `.docx`, `.png`, `.jpg`, `.pdf`).
3. Pilih kategori Jenis Getah dan masukkan keterangan ujian.
4. Klik **Muat Naik & Indeks**. Fail baharu tersebut akan serta-merta tersedia untuk carian suara dan pratonton.

---

## 8. Maksud Status & Label Penting

| Label / Status | Maksud |
| :--- | :--- |
| **Zero-Hallucination** | Jaminan bahawa jawapan AI disintesis secara ketat daripada dokumen makmal sebenar, bukan rekaan model bahasa. |
| **LULUS (MS 35)** | Sampel getah SMR 20 mematuhi spesifikasi piawaian Malaysia MS 35:2020 bagi kandungan kotoran, abu, bahan meruap, dan PRI. |
| **AMARAN (Batas PRI Rendah)** | Sampel getah mempunyai Indeks Pengekalan Keplastikan (*Plasticity Retention Index*) yang mendekati atau berada di bawah paras minimum piawaian. |
| **MEMATUHI ISO 2004** | Sampel lateks pekat emparan mematuhi piawaian antarabangsa bagi kestabilan mekanikal (MST), alkaliniti, dan nombor VFA. |
| **Indexed** | Fail telah berjaya diekstrak kandungannya dan sedia untuk dicari. |

---

## 9. Penyelesaian Masalah Biasa (Troubleshooting)

### A. Mikrofon Tidak Berfungsi atau Disekat
- **Punca:** Pelayar web menyekat kebenaran mikrofon pada URL aplikasi.
- **Penyelesaian:** Klik ikon mangga/kunci pada bar alamat pelayar web anda, pilih **Permissions**, dan tetapkan **Microphone** kepada **Allow**. Anda juga boleh menggunakan kotak carian teks manual sekiranya mikrofon tidak tersedia.

### B. Bunyi Bising Persekitaran Makmal (cth: Fume Hood / Peralatan Mesin)
- **Punca:** Bunyi deruan kipas kebuk wasap boleh mengganggu kejelasan rakaman.
- **Penyelesaian:** Gunakan fon kepala dengan mikrofon, atau semak teks yang terhasil dalam bar carian dan sunting ejaan perkataan sebelum menekan butang carian.

### C. Emel Ditolak Semasa Log Masuk
- **Punca:** Menggunakan alamat emel luar selain daripada `@lgm.gov.my`.
- **Penyelesaian:** Gunakan emel rasmi organisasi Lembaga Getah Malaysia anda atau pilih salah satu profil staf ujian yang disediakan pada skrin log masuk.
