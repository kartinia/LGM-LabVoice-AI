import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up server-side Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Storage directories
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LAB_FILES_DIR = path.resolve(DATA_DIR, 'lab_files');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LAB_FILES_DIR)) {
  fs.mkdirSync(LAB_FILES_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, LAB_FILES_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// Types as per PRD Data Model
export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Staff';
  department: string;
  last_login: string;
}

export interface DocumentRecord {
  doc_id: string;
  drive_file_id: string;
  file_name: string;
  file_extension: string;
  mime_type: string;
  folder_path: string;
  rubber_type: 'SMR 20' | 'SMR CV60' | 'Lateks' | 'Epoxidised NR' | 'Compound' | 'Semua';
  test_type: string;
  uploaded_by: string;
  modified_date: string;
  index_status: 'Indexed' | 'Indexing' | 'Failed';
  drive_web_link: string;
  file_size_bytes: number;
  content_summary: string;
  table_data?: {
    headers: string[];
    rows: (string | number)[][];
  };
  visual_peaks?: {
    name: string;
    retention_time_or_rf: string;
    area_or_intensity: string;
  }[];
  image_preview_url?: string;
  local_file_path?: string;
}

// Initial sample data representing authentic LGM (Lembaga Getah Malaysia) lab testing
const DEFAULT_USERS: UserProfile[] = [
  {
    user_id: 'usr_001',
    email: 'kartinia@lgm.gov.my',
    full_name: 'Dr. Kartini Ahmad (Ketua Projek)',
    role: 'Admin',
    department: 'Unit Pembangunan Standard Ujian Kimia Makmal',
    last_login: new Date().toISOString(),
  },
  {
    user_id: 'usr_002',
    email: 'faizal.razak@lgm.gov.my',
    full_name: 'Faizal Razak (Pegawai Penyelidik RO)',
    role: 'Staff',
    department: 'Makmal Kromatografi & Spektroskopi Getah',
    last_login: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    user_id: 'usr_003',
    email: 'nurul.ain@lgm.gov.my',
    full_name: 'Nurul Ain Zulkifli (Pembantu Penyelidik RA)',
    role: 'Staff',
    department: 'Unit Ujian Fizikal & Sebatian Getah',
    last_login: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// Helper to generate SVG chromatogram visuals
function createChromatogramSvg(
  title: string,
  sample: string,
  peaks: { name: string; x: number; y: number; height: number; width: number }[]
): string {
  const peakPaths = peaks
    .map((p) => {
      const x0 = p.x - p.width;
      const x1 = p.x;
      const x2 = p.x + p.width;
      const baseY = 240;
      const peakY = baseY - p.height;
      return `
      <!-- Peak: ${p.name} -->
      <path d="M ${x0} ${baseY} Q ${x1 - p.width * 0.3} ${baseY} ${x1} ${peakY} Q ${x1 + p.width * 0.3} ${baseY} ${x2} ${baseY}" fill="rgba(15, 118, 110, 0.25)" stroke="#0F766E" stroke-width="2.5" />
      <line x1="${x1}" y1="${peakY}" x2="${x1}" y2="${baseY}" stroke="#0F4C5C" stroke-dasharray="3,3" opacity="0.6"/>
      <text x="${x1}" y="${peakY - 12}" fill="#0F4C5C" font-size="11" font-weight="700" text-anchor="middle" font-family="sans-serif">${p.name}</text>
      <text x="${x1}" y="${peakY - 2}" fill="#64748b" font-size="9" text-anchor="middle" font-family="sans-serif">RT/Rf: ${(p.x / 40).toFixed(2)}</text>
    `;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%" style="background:#ffffff; border-radius:8px;">
    <defs>
      <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
    </defs>
    <rect width="600" height="300" fill="url(#gridGrad)" />
    <!-- Grid lines -->
    <line x1="50" y1="40" x2="570" y2="40" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="50" y1="90" x2="570" y2="90" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="50" y1="140" x2="570" y2="140" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="50" y1="190" x2="570" y2="190" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="50" y1="240" x2="570" y2="240" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="50" y1="30" x2="50" y2="240" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Axes labels -->
    <text x="310" y="278" font-size="11" fill="#475569" font-family="sans-serif" text-anchor="middle" font-weight="600">Masa Retensi / Retention Time (minit) atau Nilai Rf</text>
    <text x="15" y="140" font-size="11" fill="#475569" font-family="sans-serif" text-anchor="middle" transform="rotate(-90 15 140)" font-weight="600">Isyarat Pengesan (mAU / Abs)</text>

    <!-- Header badge -->
    <rect x="50" y="10" width="520" height="24" rx="4" fill="#0F4C5C" opacity="0.08"/>
    <text x="60" y="26" font-size="11" font-weight="700" fill="#0F4C5C" font-family="sans-serif">LGM MAK-KIMIA | ${title} [${sample}]</text>
    <text x="560" y="26" font-size="10" fill="#64748b" font-family="sans-serif" text-anchor="end">Agilent 1260 / DAD @ 254nm / PerkinElmer Spectrum 3</text>

    <!-- Base curve + peaks -->
    <path d="M 50 240 Q 90 238 120 239 T 180 240" fill="none" stroke="#0F766E" stroke-width="1.5"/>
    ${peakPaths}
    <path d="M 460 240 Q 510 239 570 240" fill="none" stroke="#0F766E" stroke-width="1.5"/>
  </svg>`;
}

// Generate physical lab files on disk
function seedPhysicalLabFiles() {
  const hptlcSvg = createChromatogramSvg(
    'Kromatogram HPTLC Ujian Pemecut Vulkanisasi',
    'SMR 20 - Lot 2026-B44',
    [
      { name: 'Puncak 1: TBBS', x: 140, y: 0, height: 130, width: 28 },
      { name: 'Puncak 2: CBS', x: 230, y: 0, height: 165, width: 32 },
      { name: 'Puncak 3: Antioksidan 6PPD', x: 340, y: 0, height: 190, width: 36 },
      { name: 'Puncak 4: Asid Stearik', x: 440, y: 0, height: 80, width: 24 },
    ]
  );
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Kromatogram_HPTLC_SMR20_LotB44.svg'), hptlcSvg, 'utf-8');

  const ftirSvg = createChromatogramSvg(
    'Spektrum FTIR Pengecaman Gelang Epoksida',
    'Epoxidised NR (ENR-50)',
    [
      { name: 'Puncak -C-O-C- (870 cm⁻¹)', x: 150, y: 0, height: 140, width: 30 },
      { name: 'Puncak =C-H (1660 cm⁻¹)', x: 260, y: 0, height: 95, width: 25 },
      { name: 'Puncak -CH3 (1375 cm⁻¹)', x: 370, y: 0, height: 175, width: 34 },
      { name: 'Puncak -CH2- (2960 cm⁻¹)', x: 480, y: 0, height: 185, width: 38 },
    ]
  );
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Spektrum_FTIR_ENR50_Analysis.svg'), ftirSvg, 'utf-8');

  const gcmsSvg = createChromatogramSvg(
    'Kromatogram GC-MS Analisis Komponen Meruap',
    'SMR CV60 - Siri Kualiti Q3',
    [
      { name: 'Toluena (Pelarut)', x: 120, y: 0, height: 70, width: 20 },
      { name: 'Asid Palmitik (C16)', x: 250, y: 0, height: 145, width: 30 },
      { name: 'Trigliserida Residu', x: 380, y: 0, height: 120, width: 28 },
    ]
  );
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Kromatogram_GCMS_SMR_CV60.svg'), gcmsSvg, 'utf-8');

  const mdrSvg = createChromatogramSvg(
    'Graf Lengkung Pemvulkanan MDR 2000 (Rheometer Curve)',
    'Compound Sebatian Getah Tayar NR/BR',
    [
      { name: 'ML (Tork Minima: 1.82 dN.m)', x: 120, y: 0, height: 50, width: 25 },
      { name: 'ts2 (Masa Hangus: 2.15 min)', x: 220, y: 0, height: 85, width: 25 },
      { name: 't90 (Optimum Cure: 6.40 min)', x: 360, y: 0, height: 180, width: 35 },
      { name: 'MH (Tork Maksima: 17.5 dN.m)', x: 470, y: 0, height: 195, width: 30 },
    ]
  );
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Graf_MDR_Lengkung_Pemvulkanan_Compound.svg'), mdrSvg, 'utf-8');

  // Excel (.xlsx) mock file content
  const smr20Excel = `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="SMR 20 Test Results">
      <Table>
        <Row><Cell><Data ss:Type="String">Sample ID</Data></Cell><Cell><Data ss:Type="String">Lot Number</Data></Cell><Cell><Data ss:Type="String">Dirt Content (% w/w)</Data></Cell><Cell><Data ss:Type="String">Ash Content (% w/w)</Data></Cell><Cell><Data ss:Type="String">Volatile Matter (%)</Data></Cell><Cell><Data ss:Type="String">Plasticity P0</Data></Cell><Cell><Data ss:Type="String">PRI (%)</Data></Cell><Cell><Data ss:Type="String">Status Standard MS 35</Data></Cell></Row>
        <Row><Cell><Data ss:Type="String">SMR20-091</Data></Cell><Cell><Data ss:Type="String">Lot 2026-B44</Data></Cell><Cell><Data ss:Type="Number">0.12</Data></Cell><Cell><Data ss:Type="Number">0.68</Data></Cell><Cell><Data ss:Type="Number">0.52</Data></Cell><Cell><Data ss:Type="Number">34.5</Data></Cell><Cell><Data ss:Type="Number">68.0</Data></Cell><Cell><Data ss:Type="String">LULUS (MS 35)</Data></Cell></Row>
        <Row><Cell><Data ss:Type="String">SMR20-092</Data></Cell><Cell><Data ss:Type="String">Lot 2026-B45</Data></Cell><Cell><Data ss:Type="Number">0.14</Data></Cell><Cell><Data ss:Type="Number">0.72</Data></Cell><Cell><Data ss:Type="Number">0.61</Data></Cell><Cell><Data ss:Type="Number">33.0</Data></Cell><Cell><Data ss:Type="Number">65.5</Data></Cell><Cell><Data ss:Type="String">LULUS (MS 35)</Data></Cell></Row>
        <Row><Cell><Data ss:Type="String">SMR20-093</Data></Cell><Cell><Data ss:Type="String">Lot 2026-B46</Data></Cell><Cell><Data ss:Type="Number">0.18</Data></Cell><Cell><Data ss:Type="Number">0.81</Data></Cell><Cell><Data ss:Type="Number">0.74</Data></Cell><Cell><Data ss:Type="Number">31.0</Data></Cell><Cell><Data ss:Type="Number">59.0</Data></Cell><Cell><Data ss:Type="String">AMARAN (Batas PRI Rendah)</Data></Cell></Row>
      </Table>
    </Worksheet>
  </Workbook>`;
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Laporan_Ujian_Fizikal_Kimia_SMR20.xlsx'), smr20Excel, 'utf-8');

  // Word report (.docx)
  const docxContent = `LEMBAGA GETAH MALAYSIA (MALAYSIAN RUBBER BOARD)
PUSAT PENYELIDIKAN GETAH SUNGAI BULOH
LAPORAN TEKNIKAL STANDARD UJIAN KIMIA 2026

Tajuk: Pengecaman Pemecut Vulkanisasi (Sulfenamides) & Antioksidan 6PPD dalam Getah Kering SMR 20 Menggunakan HPTLC
Pegawai Penyelidik: Dr. Kartini Ahmad, Faizal Razak
Tarikh Ujian: 04 November 2026
Sampel: SMR 20 (Standard Malaysian Rubber 20), Lot 2026-B44

Ringkasan Eksekutif:
Analisis kromatografi lapisan nipis berprestasi tinggi (HPTLC) dan spektrofotometri telah dijalankan ke atas ekstrak aseton getah SMR 20. Puncak kromatogram mengesahkan kehadiran:
1. Tert-butyl-2-benzothiazolesulfenamide (TBBS) pada nilai Rf 0.35 (kepekatan 0.85 phr)
2. N-cyclohexyl-2-benzothiazolesulfenamide (CBS) pada nilai Rf 0.52 (kepekatan 0.40 phr)
3. Antioksidan N-(1,3-dimethylbutyl)-N'-phenyl-p-phenylenediamine (6PPD) pada Rf 0.74 (kepekatan 1.20 phr)
Kesimpulan: Sampel menepati spesifikasi piawaian MS 35:2020 tanpa tanda degradasi ketara.`;
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Laporan_Teknikal_HPTLC_SMR20_MS35.docx'), docxContent, 'utf-8');

  // Latex concentrate Excel report
  const latexReport = `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Latex Concentrate HA">
      <Table>
        <Row><Cell><Data ss:Type="String">Batch ID</Data></Cell><Cell><Data ss:Type="String">Jenis Lateks</Data></Cell><Cell><Data ss:Type="String">TSC (% w/w)</Data></Cell><Cell><Data ss:Type="String">DRC (% w/w)</Data></Cell><Cell><Data ss:Type="String">Alkaliniti (NH3 %)</Data></Cell><Cell><Data ss:Type="String">VFA Number</Data></Cell><Cell><Data ss:Type="String">MST (Saat)</Data></Cell><Cell><Data ss:Type="String">Keputusan</Data></Cell></Row>
        <Row><Cell><Data ss:Type="String">LX-2026-001</Data></Cell><Cell><Data ss:Type="String">Lateks Pekat HA</Data></Cell><Cell><Data ss:Type="Number">61.5</Data></Cell><Cell><Data ss:Type="Number">60.2</Data></Cell><Cell><Data ss:Type="Number">0.72</Data></Cell><Cell><Data ss:Type="Number">0.035</Data></Cell><Cell><Data ss:Type="Number">980</Data></Cell><Cell><Data ss:Type="String">MEMATUHI ISO 2004</Data></Cell></Row>
        <Row><Cell><Data ss:Type="String">LX-2026-002</Data></Cell><Cell><Data ss:Type="String">Lateks Pekat LA</Data></Cell><Cell><Data ss:Type="Number">61.2</Data></Cell><Cell><Data ss:Type="Number">60.0</Data></Cell><Cell><Data ss:Type="Number">0.24</Data></Cell><Cell><Data ss:Type="Number">0.041</Data></Cell><Cell><Data ss:Type="Number">850</Data></Cell><Cell><Data ss:Type="String">MEMATUHI ISO 2004</Data></Cell></Row>
      </Table>
    </Worksheet>
  </Workbook>`;
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Data_Ujian_Lateks_Pekat_ISO2004.xlsx'), latexReport, 'utf-8');

  // Compound formulation report
  const compoundReport = `LEMBAGA GETAH MALAYSIA (MALAYSIAN RUBBER BOARD)
FORMULASI SEBATIAN GETAH TAYAR (MASTERBATCH NR/BR)
Batch: CMP-2026-X12 | Tarikh: 10 November 2026
Staf: Nurul Ain Zulkifli (RA)

Kandungan Resipi (phr):
- Natural Rubber (SMR 20): 70.0 phr
- Polybutadiene Rubber (BR 9000): 30.0 phr
- Carbon Black (N330): 50.0 phr
- Aromatic Oil: 10.0 phr
- Zinc Oxide (ZnO): 4.0 phr
- Stearic Acid: 2.0 phr
- Sulfur (Belerang): 1.8 phr
- Pemecut CBS: 1.2 phr
- Antioksidan 6PPD: 1.5 phr

Ciri Reometer (MDR @ 160°C):
- ML: 1.82 dN.m | MH: 17.5 dN.m
- ts2: 2.15 min | t90: 6.40 min
- Kekerasan Shore A: 65 ± 2`;
  fs.writeFileSync(path.join(LAB_FILES_DIR, 'Formulasi_Sebatian_Getah_Tayar_NRBR.docx'), compoundReport, 'utf-8');
}

seedPhysicalLabFiles();

// In-memory / persisted initial document database
let documents: DocumentRecord[] = [
  {
    doc_id: 'doc_001',
    drive_file_id: 'gdrive_smr20_hptlc_img_01',
    file_name: 'Kromatogram_HPTLC_SMR20_LotB44.png',
    file_extension: '.png',
    mime_type: 'image/png',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Kromatogram_2026',
    rubber_type: 'SMR 20',
    test_type: 'Ujian HPTLC Pemecut & Antioksidan',
    uploaded_by: 'Faizal Razak (RO)',
    modified_date: '2026-11-04T10:30:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/1A2B3C4D5E_HPTLC_SMR20/view?usp=sharing',
    file_size_bytes: 482100,
    content_summary:
      'Imej kromatogram HPTLC menunjukkan pemisahan 4 puncak jelas pemecut vulkanisasi (TBBS, CBS), antioksidan 6PPD, dan asid stearik pada getah SMR 20 Lot 2026-B44.',
    visual_peaks: [
      { name: 'TBBS (Tert-butyl-2-benzothiazolesulfenamide)', retention_time_or_rf: 'Rf 0.35 (3.50 min)', area_or_intensity: '125,400 uV*s (0.85 phr)' },
      { name: 'CBS (N-cyclohexyl-2-benzothiazolesulfenamide)', retention_time_or_rf: 'Rf 0.52 (5.75 min)', area_or_intensity: '86,200 uV*s (0.40 phr)' },
      { name: 'Antioksidan 6PPD', retention_time_or_rf: 'Rf 0.74 (8.50 min)', area_or_intensity: '210,500 uV*s (1.20 phr)' },
      { name: 'Asid Stearik / Residu', retention_time_or_rf: 'Rf 0.88 (11.00 min)', area_or_intensity: '34,100 uV*s (0.20 phr)' },
    ],
    image_preview_url: '/api/documents/preview/Kromatogram_HPTLC_SMR20_LotB44.svg',
    local_file_path: 'Kromatogram_HPTLC_SMR20_LotB44.svg',
  },
  {
    doc_id: 'doc_002',
    drive_file_id: 'gdrive_smr20_excel_02',
    file_name: 'Laporan_Ujian_Fizikal_Kimia_SMR20.xlsx',
    file_extension: '.xlsx',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Ujian_Fizikal_SMR',
    rubber_type: 'SMR 20',
    test_type: 'Ujian Standard MS 35 (Dirt, Ash, Volatile, PRI)',
    uploaded_by: 'Nurul Ain Zulkifli (RA)',
    modified_date: '2026-11-05T14:15:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/2B3C4D5E6F_SMR20_Excel/view?usp=sharing',
    file_size_bytes: 65400,
    content_summary:
      'Lembaran hamparan data keputusan ujian kotoran (Dirt Content 0.12%), abu (Ash 0.68%), bahan meruap (Volatile 0.52%), dan Indeks Pengekalan Keplastikan (PRI 68.0%) bagi sampel SMR 20 Lot B44, B45 dan B46.',
    table_data: {
      headers: ['Sample ID', 'Lot Number', 'Dirt Content (% w/w)', 'Ash Content (% w/w)', 'Volatile Matter (%)', 'Plasticity P0', 'PRI (%)', 'Status Standard MS 35'],
      rows: [
        ['SMR20-091', 'Lot 2026-B44', '0.12', '0.68', '0.52', '34.5', '68.0', 'LULUS (MS 35)'],
        ['SMR20-092', 'Lot 2026-B45', '0.14', '0.72', '0.61', '33.0', '65.5', 'LULUS (MS 35)'],
        ['SMR20-093', 'Lot 2026-B46', '0.18', '0.81', '0.74', '31.0', '59.0', 'AMARAN (Batas PRI Rendah)'],
      ],
    },
    local_file_path: 'Laporan_Ujian_Fizikal_Kimia_SMR20.xlsx',
  },
  {
    doc_id: 'doc_003',
    drive_file_id: 'gdrive_smr20_word_03',
    file_name: 'Laporan_Teknikal_HPTLC_SMR20_MS35.docx',
    file_extension: '.docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Laporan_Teknikal_Standard',
    rubber_type: 'SMR 20',
    test_type: 'Laporan Analisis Eksekutif Kimia Getah',
    uploaded_by: 'Dr. Kartini Ahmad (Admin)',
    modified_date: '2026-11-06T09:00:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/3C4D5E6F7G_SMR20_Docx/view?usp=sharing',
    file_size_bytes: 142000,
    content_summary:
      'Laporan saintifik komprehensif mengesahkan formulasi pemecut TBBS (0.85 phr), CBS (0.40 phr) dan kepekatan antioksidan 6PPD (1.20 phr) memenuhi standard MS 35:2020.',
    local_file_path: 'Laporan_Teknikal_HPTLC_SMR20_MS35.docx',
  },
  {
    doc_id: 'doc_004',
    drive_file_id: 'gdrive_enr50_ftir_img_04',
    file_name: 'Spektrum_FTIR_ENR50_Analysis.png',
    file_extension: '.png',
    mime_type: 'image/png',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Spektrum_FTIR',
    rubber_type: 'Epoxidised NR',
    test_type: 'Ujian Spektroskopi FTIR Gelang Oksirana',
    uploaded_by: 'Faizal Razak (RO)',
    modified_date: '2026-11-08T11:45:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/4D5E6F7G8H_ENR50_FTIR/view?usp=sharing',
    file_size_bytes: 512000,
    content_summary:
      'Spektrum FTIR bagi Epoxidised Natural Rubber ENR-50 mengesahkan kehadiran jalur penyerapan khas gelang oksirana pada 870 cm⁻¹ (epoxidation mol % = 50.4 mol%).',
    visual_peaks: [
      { name: 'Gelang Oksirana / Epoksida (-C-O-C-)', retention_time_or_rf: '870 cm⁻¹', area_or_intensity: 'Absorbans 0.74 (50.4 mol% Epoksidasi)' },
      { name: 'Ikatan Tak Tepu Sisa (=C-H)', retention_time_or_rf: '1660 cm⁻¹', area_or_intensity: 'Absorbans 0.42 (Sisa ikatan kembar)' },
      { name: 'Metil Bersimetri (-CH3)', retention_time_or_rf: '1375 cm⁻¹', area_or_intensity: 'Absorbans 0.88' },
      { name: 'Regangan Alifatik C-H (-CH2-)', retention_time_or_rf: '2960 cm⁻¹', area_or_intensity: 'Absorbans 1.25' },
    ],
    image_preview_url: '/api/documents/preview/Spektrum_FTIR_ENR50_Analysis.svg',
    local_file_path: 'Spektrum_FTIR_ENR50_Analysis.svg',
  },
  {
    doc_id: 'doc_005',
    drive_file_id: 'gdrive_latex_excel_05',
    file_name: 'Data_Ujian_Lateks_Pekat_ISO2004.xlsx',
    file_extension: '.xlsx',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Lateks_Pekat',
    rubber_type: 'Lateks',
    test_type: 'Ujian Standard Kualiti Lateks ISO 2004',
    uploaded_by: 'Nurul Ain Zulkifli (RA)',
    modified_date: '2026-11-09T08:20:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/5E6F7G8H9I_Latex_Excel/view?usp=sharing',
    file_size_bytes: 58900,
    content_summary:
      'Keputusan ujian lateks pekat emparan (centrifuged latex). TSC 61.5%, DRC 60.2%, Alkaliniti NH3 0.72%, VFA no. 0.035, MST 980 saat (Lulus ISO 2004).',
    table_data: {
      headers: ['Batch ID', 'Jenis Lateks', 'TSC (% w/w)', 'DRC (% w/w)', 'Alkaliniti (NH3 %)', 'VFA Number', 'MST (Saat)', 'Keputusan'],
      rows: [
        ['LX-2026-001', 'Lateks Pekat HA', '61.5', '60.2', '0.72', '0.035', '980', 'MEMATUHI ISO 2004'],
        ['LX-2026-002', 'Lateks Pekat LA', '61.2', '60.0', '0.24', '0.041', '850', 'MEMATUHI ISO 2004'],
      ],
    },
    local_file_path: 'Data_Ujian_Lateks_Pekat_ISO2004.xlsx',
  },
  {
    doc_id: 'doc_006',
    drive_file_id: 'gdrive_smr_cv60_gcms_06',
    file_name: 'Kromatogram_GCMS_SMR_CV60.png',
    file_extension: '.png',
    mime_type: 'image/png',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Kromatogram_2026',
    rubber_type: 'SMR CV60',
    test_type: 'Ujian GC-MS Komponen Meruap & Stabilizer Kelikatan',
    uploaded_by: 'Faizal Razak (RO)',
    modified_date: '2026-11-10T15:00:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/6F7G8H9I0J_CV60_GCMS/view?usp=sharing',
    file_size_bytes: 495000,
    content_summary:
      'Kromatogram GC-MS bagi SMR CV60 menunjukkan pengesanan hidroksilamina semulajadi yang mengunci tindak balas pengerasan simpanan (storage hardening) dengan kelikatan Mooney stabil ML(1+4) 100°C pada 60 unit.',
    visual_peaks: [
      { name: 'Toluena (Puncak Pelarut)', retention_time_or_rf: '3.00 min', area_or_intensity: '45,200 count' },
      { name: 'Asid Palmitik (C16)', retention_time_or_rf: '6.25 min', area_or_intensity: '118,000 count' },
      { name: 'Trigliserida Residu', retention_time_or_rf: '9.50 min', area_or_intensity: '92,300 count' },
    ],
    image_preview_url: '/api/documents/preview/Kromatogram_GCMS_SMR_CV60.svg',
    local_file_path: 'Kromatogram_GCMS_SMR_CV60.svg',
  },
  {
    doc_id: 'doc_007',
    drive_file_id: 'gdrive_compound_mdr_07',
    file_name: 'Graf_MDR_Lengkung_Pemvulkanan_Compound.png',
    file_extension: '.png',
    mime_type: 'image/png',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Ujian_Fizikal_SMR',
    rubber_type: 'Compound',
    test_type: 'Ujian Lengkung Pemvulkanan Reometer MDR 2000',
    uploaded_by: 'Nurul Ain Zulkifli (RA)',
    modified_date: '2026-11-10T17:30:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/7G8H9I0J1K_MDR_Compound/view?usp=sharing',
    file_size_bytes: 460000,
    content_summary:
      'Graf lengkung pemvulkanan reometer MDR 2000 bagi sebatian getah tayar (NR/BR). Tork minima ML 1.82 dN.m, tork maksima MH 17.5 dN.m, masa hangus ts2 2.15 minit, dan cure time t90 6.40 minit.',
    visual_peaks: [
      { name: 'Tork Minima (ML)', retention_time_or_rf: '1.20 min', area_or_intensity: '1.82 dN.m' },
      { name: 'Masa Hangus (ts2)', retention_time_or_rf: '2.15 min', area_or_intensity: '3.50 dN.m' },
      { name: 'Masa Pemvulkanan Optimum (t90)', retention_time_or_rf: '6.40 min', area_or_intensity: '15.9 dN.m' },
      { name: 'Tork Maksima (MH)', retention_time_or_rf: '12.0 min', area_or_intensity: '17.5 dN.m' },
    ],
    image_preview_url: '/api/documents/preview/Graf_MDR_Lengkung_Pemvulkanan_Compound.svg',
    local_file_path: 'Graf_MDR_Lengkung_Pemvulkanan_Compound.svg',
  },
  {
    doc_id: 'doc_008',
    drive_file_id: 'gdrive_compound_docx_08',
    file_name: 'Formulasi_Sebatian_Getah_Tayar_NRBR.docx',
    file_extension: '.docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Laporan_Teknikal_Standard',
    rubber_type: 'Compound',
    test_type: 'Resipi Formulasi Sebatian & Parameter Rheometer',
    uploaded_by: 'Nurul Ain Zulkifli (RA)',
    modified_date: '2026-11-10T18:00:00Z',
    index_status: 'Indexed',
    drive_web_link: 'https://drive.google.com/file/d/8H9I0J1K2L_Compound_Docx/view?usp=sharing',
    file_size_bytes: 112000,
    content_summary:
      'Dokumen formulasi masterbatch tayar berasaskan 70 phr SMR 20 dan 30 phr BR 9000 dengan 50 phr Carbon Black N330, pemecut CBS 1.2 phr dan antioksidan 6PPD 1.5 phr.',
    local_file_path: 'Formulasi_Sebatian_Getah_Tayar_NRBR.docx',
  },
];

// Drive sync settings
let driveConfig = {
  folder_id: '1G-LGM-Makmal-SharePoint-Sync-2026',
  folder_name: 'LGM Makmal Kimia - SharePoint Mirror (Google Drive)',
  sync_schedule: 'Setiap 15 minit (Auto)',
  last_synced: new Date().toISOString(),
  sharepoint_source_url: 'https://lgm.sharepoint.com/sites/makmal-standard/rekod-ujian',
  is_connected: true,
  rubber_categories: ['SMR 20', 'SMR CV60', 'Lateks', 'Epoxidised NR', 'Compound'],
};

// Current authenticated user
let currentUser: UserProfile = DEFAULT_USERS[0];

// Natural speech cleaner for Wispr Flow & voice dictation
function cleanVoiceQuery(raw: string): string {
  let cleaned = raw
    // Remove typical Wispr Flow / voice assistant conversational prefixes
    .replace(/^(cakap|cakaplah|hello|hai|okey|okay|ok|tolong|cuba|cuba cari|carikan|cari|saya nak|saya nak tengok|nak tengok|saya nak cari|mana|mana dia|ada tak|features ni|guna wispr flow|tadi)\b[\s,.:;]*/gi, '')
    // Remove leading punctuation
    .replace(/^[.,;:!?\s]+/, '')
    // Replace multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  // If cleaning emptied the string, revert to original
  if (!cleaned) cleaned = raw.trim();
  return cleaned;
}

// --- API ROUTES ---

// 1. Auth routes
app.get('/api/auth/me', (_req, res) => {
  res.json({
    user: currentUser,
    available_users: DEFAULT_USERS,
  });
});

app.post('/api/auth/switch-user', (req, res) => {
  const { user_id } = req.body;
  const found = DEFAULT_USERS.find((u) => u.user_id === user_id);
  if (found) {
    currentUser = { ...found, last_login: new Date().toISOString() };
    return res.json({ success: true, user: currentUser });
  }
  return res.status(404).json({ error: 'Pengguna tidak ditemui.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, full_name, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Emel diperlukan.' });
  }

  // Domain verification as per FR-001: must end with @lgm.gov.my
  if (!email.toLowerCase().endsWith('@lgm.gov.my')) {
    return res.status(403).json({
      error: 'Akses ditolak: Hanya emel rasmi organisasi Lembaga Getah Malaysia (@lgm.gov.my) dibenarkan.',
    });
  }

  let user = DEFAULT_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      user_id: `usr_${Date.now()}`,
      email,
      full_name: full_name || email.split('@')[0],
      role: role === 'Admin' ? 'Admin' : 'Staff',
      department: 'Makmal Penyelidikan Getah LGM',
      last_login: new Date().toISOString(),
    };
    DEFAULT_USERS.push(user);
  } else {
    user.last_login = new Date().toISOString();
  }

  currentUser = user;
  res.json({ success: true, user: currentUser });
});

// 2. Document & Indexing routes
app.get('/api/documents', (req, res) => {
  const { rubber_type, format, staff, search } = req.query;
  let filtered = [...documents];

  if (rubber_type && rubber_type !== 'Semua') {
    filtered = filtered.filter((d) => d.rubber_type.toLowerCase() === String(rubber_type).toLowerCase());
  }
  if (format && format !== 'Semua') {
    const fmt = String(format).toLowerCase();
    if (fmt === 'excel') {
      filtered = filtered.filter((d) => d.file_extension.includes('.xls') || d.file_extension.includes('.csv'));
    } else if (fmt === 'word') {
      filtered = filtered.filter((d) => d.file_extension.includes('.doc'));
    } else if (fmt === 'imej' || fmt === 'instrument') {
      filtered = filtered.filter((d) => d.file_extension.match(/\.(png|jpg|jpeg|svg)$/i));
    }
  }
  if (staff && staff !== 'Semua') {
    filtered = filtered.filter((d) => d.uploaded_by.toLowerCase().includes(String(staff).toLowerCase()));
  }
  if (search) {
    const term = String(search).toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.file_name.toLowerCase().includes(term) ||
        d.test_type.toLowerCase().includes(term) ||
        d.content_summary.toLowerCase().includes(term) ||
        d.rubber_type.toLowerCase().includes(term)
    );
  }

  res.json({
    documents: filtered,
    total_indexed: documents.length,
    sync_status: driveConfig,
  });
});

// Direct file download - preserves EXACT original format without compression (FR-006 & Rule 13)
app.get('/api/documents/:id/download', (req, res) => {
  const doc = documents.find((d) => d.doc_id === req.params.id);
  if (!doc) {
    return res.status(404).send('Fail tidak ditemui dalam repositori.');
  }

  const filePath = path.join(LAB_FILES_DIR, doc.local_file_path || doc.file_name);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    return res.sendFile(filePath);
  }

  const fallbackBuffer = Buffer.from(
    `[LGM LAB REPOSITORY - ${doc.file_name}]\nJenis Getah: ${doc.rubber_type}\nUjian: ${doc.test_type}\nRingkasan: ${doc.content_summary}`
  );
  res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
  res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
  return res.send(fallbackBuffer);
});

// Preview endpoint for SVGs / images
app.get('/api/documents/preview/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(LAB_FILES_DIR, filename);
  if (fs.existsSync(filePath)) {
    if (filename.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    return res.sendFile(filePath);
  }
  res.status(404).send('Imej pratonton tidak dijumpai.');
});

// Direct file upload by lab staff or admin (FR-003)
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tiada fail dipilih.' });
    }

    const file = req.file;
    const { rubber_type, test_type } = req.body;
    const ext = path.extname(file.originalname).toLowerCase();

    let mimeType = file.mimetype;
    if (ext === '.xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

    const newDocId = `doc_${Date.now()}`;
    const newDoc: DocumentRecord = {
      doc_id: newDocId,
      drive_file_id: `gdrive_${newDocId}`,
      file_name: file.originalname,
      file_extension: ext,
      mime_type: mimeType,
      folder_path: 'Google Drive/LGM_Kimia_SharePoint_Sync/Manual_Uploads_Makmal',
      rubber_type: rubber_type || 'SMR 20',
      test_type: test_type || 'Ujian Tambahan Makmal',
      uploaded_by: currentUser.full_name,
      modified_date: new Date().toISOString(),
      index_status: 'Indexed',
      drive_web_link: `https://drive.google.com/file/d/gdrive_${newDocId}/view?usp=sharing`,
      file_size_bytes: file.size,
      content_summary: `Fail baharu dimuat naik oleh ${currentUser.full_name} bagi kategori ${rubber_type || 'SMR 20'}. Bersedia untuk pengindeksan carian suara multimodal.`,
      local_file_path: file.filename,
    };

    if (['.png', '.jpg', '.jpeg', '.svg'].includes(ext)) {
      newDoc.image_preview_url = `/api/documents/preview/${file.filename}`;
      newDoc.visual_peaks = [
        { name: 'Puncak Isyarat Utama A', retention_time_or_rf: '4.20 min', area_or_intensity: 'Kromatogram Baru Diindeks' },
      ];
    }

    documents.unshift(newDoc);
    res.json({ success: true, document: newDoc, message: 'Fail berjaya dimuat naik dan diindeks ke dalam sistem.' });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Gagal memproses muat naik: ' + err.message });
  }
});

// Trigger Drive / SharePoint sync (FR-003)
app.post('/api/documents/sync', (_req, res) => {
  driveConfig.last_synced = new Date().toISOString();
  documents.forEach((d) => {
    d.index_status = 'Indexed';
  });

  res.json({
    success: true,
    message: 'Penyelarasan Google Drive (SharePoint mirror) selesai. Semua fail terindeks dan sedia untuk carian.',
    last_synced: driveConfig.last_synced,
    total_indexed: documents.length,
  });
});

// 3. Admin Drive Folder & RBAC settings
app.get('/api/config/drive', (_req, res) => {
  res.json(driveConfig);
});

app.post('/api/config/drive', (req, res) => {
  if (currentUser.role !== 'Admin') {
    return res.status(403).json({ error: 'Hanya Pegawai Penyelidik (Admin) dibenarkan menukar tetapan folder Google Drive.' });
  }

  const { folder_id, folder_name, sync_schedule, rubber_categories } = req.body;
  if (folder_id) driveConfig.folder_id = folder_id;
  if (folder_name) driveConfig.folder_name = folder_name;
  if (sync_schedule) driveConfig.sync_schedule = sync_schedule;
  if (Array.isArray(rubber_categories) && rubber_categories.length > 0) {
    driveConfig.rubber_categories = rubber_categories;
  }
  driveConfig.last_synced = new Date().toISOString();

  res.json({ success: true, message: 'Tetapan folder Google Drive berjaya dikemas kini.', config: driveConfig });
});

app.get('/api/users', (_req, res) => {
  if (currentUser.role !== 'Admin') {
    return res.status(403).json({ error: 'Hanya Admin dibenarkan melihat senarai pengurusan staf.' });
  }
  res.json({ users: DEFAULT_USERS });
});

app.post('/api/users/update-role', (req, res) => {
  if (currentUser.role !== 'Admin') {
    return res.status(403).json({ error: 'Hanya Admin dibenarkan menukar peranan staf.' });
  }
  const { user_id, new_role } = req.body;
  const target = DEFAULT_USERS.find((u) => u.user_id === user_id);
  if (target) {
    target.role = new_role === 'Admin' ? 'Admin' : 'Staff';
    return res.json({ success: true, user: target });
  }
  res.status(404).json({ error: 'Pengguna tidak ditemui.' });
});

// 4. Grounded AI Search Query endpoint (FR-002, FR-004, FR-005, FR-006)
// Enhanced with Wispr Flow speech normalization, semantic matching, and cross-filter intelligence!
app.post('/api/query', async (req, res) => {
  try {
    const { query_text, rubber_type, format, staff, input_mode } = req.body;

    if (!query_text || !String(query_text).trim()) {
      return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
    }

    const rawQuery = String(query_text).trim();
    const sanitizedQuery = cleanVoiceQuery(rawQuery);
    const qLower = sanitizedQuery.toLowerCase();

    // 1. Initial pool according to active filters
    let filteredPool = [...documents];
    let filterApplied = false;

    if (rubber_type && rubber_type !== 'Semua') {
      filteredPool = filteredPool.filter((d) => d.rubber_type.toLowerCase() === String(rubber_type).toLowerCase());
      filterApplied = true;
    }
    if (format && format !== 'Semua') {
      const fmt = String(format).toLowerCase();
      if (fmt === 'excel') filteredPool = filteredPool.filter((d) => d.file_extension.includes('.xls') || d.file_extension.includes('.csv'));
      else if (fmt === 'word') filteredPool = filteredPool.filter((d) => d.file_extension.includes('.doc'));
      else if (fmt === 'imej' || fmt === 'instrument') filteredPool = filteredPool.filter((d) => d.file_extension.match(/\.(png|jpg|jpeg|svg)$/i));
      filterApplied = true;
    }
    if (staff && staff !== 'Semua') {
      filteredPool = filteredPool.filter((d) => d.uploaded_by.toLowerCase().includes(String(staff).toLowerCase()));
      filterApplied = true;
    }

    // Code-switching synonyms mapping
    const codeSwitchKeywords = [
      { pattern: /kromatogram|chromatogram|hptlc|gc-?ms|spektrum|spectrum|ftir|peak|puncak/i, tag: 'instrument' },
      { pattern: /smr\s*20|smr20/i, tag: 'SMR 20' },
      { pattern: /smr\s*cv60|smr-cv60|cv60/i, tag: 'SMR CV60' },
      { pattern: /lateks|latex|drc|tsc|alkaliniti|vfa|mst/i, tag: 'Lateks' },
      { pattern: /enr|epoxidised|epoksida|oksirana/i, tag: 'Epoxidised NR' },
      { pattern: /compound|sebatian|reometer|mdr|tork|pemvulkanan/i, tag: 'Compound' },
      { pattern: /pemecut|accelerator|tbbs|cbs|mbt/i, tag: 'accelerator' },
      { pattern: /antioksidan|antioxidant|6ppd|ippd/i, tag: 'antioxidant' },
      { pattern: /kotoran|dirt|ash|abu|pri|plasticity|mooney|fizikal/i, tag: 'physical' },
    ];

    // Helper to score documents
    function scoreDocument(doc: DocumentRecord, queryStr: string) {
      let score = 0;
      const textCorpus = `${doc.file_name} ${doc.rubber_type} ${doc.test_type} ${doc.content_summary} ${doc.uploaded_by} ${JSON.stringify(doc.visual_peaks || [])} ${JSON.stringify(doc.table_data || {})}`.toLowerCase();

      // Individual search tokens (ignoring short particles)
      const tokens = queryStr.split(/[\s,./_-]+/).filter((w) => w.length >= 2);
      for (const t of tokens) {
        if (textCorpus.includes(t)) {
          score += 4;
          // Extra weight if token is directly in filename or rubber type
          if (doc.file_name.toLowerCase().includes(t)) score += 6;
          if (doc.rubber_type.toLowerCase().includes(t)) score += 5;
        }
      }

      // Check code-switching tags
      for (const cs of codeSwitchKeywords) {
        if (cs.pattern.test(queryStr) && (textCorpus.includes(cs.tag.toLowerCase()) || doc.rubber_type.toLowerCase().includes(cs.tag.toLowerCase()))) {
          score += 6;
        }
      }

      return score;
    }

    // Score filtered pool
    let scoredMatches = filteredPool
      .map((doc) => ({ doc, score: scoreDocument(doc, qLower) }))
      .sort((a, b) => b.score - a.score);

    let topMatches = scoredMatches.filter((item) => item.score > 0);
    let crossFilterNote = '';

    // SMART FALLBACK: If active filters yielded 0 matches, search ALL documents in repository
    if (topMatches.length === 0 && filterApplied) {
      const globalScored = documents
        .map((doc) => ({ doc, score: scoreDocument(doc, qLower) }))
        .sort((a, b) => b.score - a.score);
      const globalMatches = globalScored.filter((item) => item.score > 0);

      if (globalMatches.length > 0) {
        topMatches = globalMatches;
        crossFilterNote = `Nota: Tiada fail sepadan dalam tapisan "${rubber_type !== 'Semua' ? rubber_type : ''} ${format !== 'Semua' ? format : ''}". Sistem memaparkan fail berkaitan daripada repositori penuh.`;
      }
    }

    // If still 0 matches by keyword, pick the top 3 most relevant documents overall or allow Gemini to find semantic relation
    let citedDocs: DocumentRecord[] = [];
    if (topMatches.length > 0) {
      citedDocs = topMatches.slice(0, 3).map((m) => m.doc);
    } else {
      // If user query is broad or conversational (e.g. "tolong tunjuk fail ujian"), provide the most recently modified documents
      citedDocs = documents.slice(0, 3);
    }

    // Build context for Gemini AI
    const docsContext = citedDocs
      .map((d, idx) => {
        let extra = '';
        if (d.table_data) {
          extra += `\nJadual Data Excel: Header=[${d.table_data.headers.join(', ')}], Baris=[${d.table_data.rows.map((r) => r.join(' | ')).join('; ')}]`;
        }
        if (d.visual_peaks) {
          extra += `\nPuncak Kromatogram/Spektrum: ${d.visual_peaks.map((p) => `${p.name} (Retensi/Rf: ${p.retention_time_or_rf}, Intensiti: ${p.area_or_intensity})`).join(', ')}`;
        }
        return `[Dokumen ${idx + 1}] ID: ${d.doc_id}\nNama Fail: ${d.file_name}\nFormat: ${d.file_extension}\nJenis Getah: ${d.rubber_type}\nUjian: ${d.test_type}\nTarikh: ${d.modified_date}\nPegawai: ${d.uploaded_by}\nRingkasan Kandungan: ${d.content_summary}${extra}`;
      })
      .join('\n\n---\n\n');

    let aiGeneratedAnswer = '';

    // Call server-side Gemini 3.8 Flash
    if (geminiApiKey) {
      try {
        const systemPrompt = `Anda ialah pembantu pintar makmal kimia Lembaga Getah Malaysia (LGM LabVoice AI).
Peranan: Membantu Pegawai Penyelidik dan staf makmal mencari dan mengekstrak rekod ujian kimia dan kromatogram berdasarkan pertanyaan suara atau teks mereka (termasuk transkripsi suara seperti Wispr Flow / Web Speech API).
PERATURAN ZERO-HALLUCINATION GROUNDING:
1. Jawab HANYA menggunakan fakta daripada dokumen rujukan [Dokumen 1], [Dokumen 2], dll.
2. DILARANG mereka-reka nombor ujian atau puncak sekiranya tiada dalam dokumen.
3. Sertakan rujukan bernombor [1], [2] yang merujuk terus kepada dokumen sumber.
4. Terangkan dengan ramah dan profesional fail mana yang ditemui dan apakah maklumat ujian di dalamnya.
5. Sokong dwibahasa (BM dan istilah teknikal English seperti retention time, chromatogram, DRC, Mooney viscosity, vulcanization accelerator).`;

        const userPrompt = `Pertanyaan Pengguna (Transkripsi Suara / Wispr Flow): "${rawQuery}"
Pertanyaan Dibersihkan: "${sanitizedQuery}"
Parameter Filter Aktif: Jenis Getah=${rubber_type || 'Semua'}, Format=${format || 'Semua'}

Senarai Dokumen Makmal Berkaitan:
${docsContext}

Sila berikan jawapan ringkas (2-4 ayat), sebutkan fail yang dipadankan dengan jelas beserta sitasi [1], [2], dan bacaan penting jika berkaitan.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        aiGeneratedAnswer = response.text || '';
      } catch (geminiErr: any) {
        console.error('Gemini API call failed, using fallback:', geminiErr);
      }
    }

    // Grounded fallback synthesis
    if (!aiGeneratedAnswer) {
      const primary = citedDocs[0];
      if (primary.visual_peaks && primary.visual_peaks.length > 0) {
        aiGeneratedAnswer = `Berdasarkan pertanyaan anda "${sanitizedQuery}", fail [1] (${primary.file_name}) telah ditemui. Rekod ${primary.rubber_type} untuk ${primary.test_type} mengandungi puncak: ${primary.visual_peaks[0].name} (${primary.visual_peaks[0].retention_time_or_rf}). Fail asal sedia untuk dimuat turun atau dipratonton di skrin.`;
      } else if (primary.table_data && primary.table_data.rows.length > 0) {
        const row = primary.table_data.rows[0];
        aiGeneratedAnswer = `Berdasarkan pertanyaan "${sanitizedQuery}", fail hamparan [1] (${primary.file_name}) telah ditemui. Keputusan bagi ${primary.rubber_type} (${row[0]}): Dirt Content ${row[2]}%, Ash Content ${row[3]}%, PRI ${row[6]}% (${row[7]}).`;
      } else {
        aiGeneratedAnswer = `Fail [1] (${primary.file_name}) sepadan dengan pertanyaan anda. ${primary.content_summary}`;
      }
    }

    if (crossFilterNote) {
      aiGeneratedAnswer = `${crossFilterNote}\n\n${aiGeneratedAnswer}`;
    }

    // Determine preview documents
    const instrumentDoc = citedDocs.find((d) => d.image_preview_url || (d.visual_peaks && d.visual_peaks.length > 0));
    const tableDoc = citedDocs.find((d) => d.table_data && d.table_data.rows.length > 0);

    res.json({
      answer_text: aiGeneratedAnswer,
      cited_documents: citedDocs,
      instrument_preview: instrumentDoc || null,
      table_preview: tableDoc || null,
      confidence: topMatches.length > 0 ? 'High' : 'Medium',
      query_text: rawQuery,
      sanitized_query: sanitizedQuery,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Search query error:', err);
    res.status(500).json({ error: 'Ralat memproses carian: ' + err.message });
  }
});

// Start Express server and mount Vite dev server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LGM LabVoice AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
