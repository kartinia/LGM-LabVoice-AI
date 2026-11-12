/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  Volume2,
  VolumeX,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UploadCloud,
  Settings,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  User,
  FlaskConical,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Radio,
  Clock,
  Layers,
  Database,
  Info
} from 'lucide-react';

// Types matching backend models
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

export interface DriveConfig {
  folder_id: string;
  folder_name: string;
  sync_schedule: string;
  last_synced: string;
  sharepoint_source_url: string;
  is_connected: boolean;
  rubber_categories: string[];
}

export interface SearchResult {
  answer_text: string;
  cited_documents: DocumentRecord[];
  instrument_preview: DocumentRecord | null;
  table_preview: DocumentRecord | null;
  confidence: 'High' | 'Medium' | 'Low';
  query_text: string;
  timestamp?: string;
}

export default function App() {
  // Authentication & RBAC state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<'Admin' | 'Staff'>('Admin');
  const [loginError, setLoginError] = useState('');

  // Main search & voice state
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'ms-MY' | 'en-US'>('ms-MY');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    'Cari keputusan HPTLC dan kromatogram untuk sampel SMR 20 yang diuji minggu lepas',
    'Berapa nilai kotoran dan abu untuk getah SMR 20 Lot B44?',
    'Tunjukkan spektrum FTIR bagi getah Epoxidised NR (ENR-50)',
    'Apakah keputusan ujian lateks pekat ISO 2004?'
  ]);

  // Filters state
  const [filterRubber, setFilterRubber] = useState<string>('Semua');
  const [filterFormat, setFilterFormat] = useState<string>('Semua');
  const [filterStaff, setFilterStaff] = useState<string>('Semua');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Documents and Drive sync state
  const [allDocuments, setAllDocuments] = useState<DocumentRecord[]>([]);
  const [driveConfig, setDriveConfig] = useState<DriveConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [fileSearchKeyword, setFileSearchKeyword] = useState<string>('');

  // Selected document for preview panel
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [previewTab, setPreviewTab] = useState<'instrument' | 'table' | 'info'>('instrument');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  // TTS (Text-to-Speech) Audio state & Visual Analyzer
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsMuted, setTtsMuted] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0); // 0 to 100
  const [ttsCurrentWord, setTtsCurrentWord] = useState('');
  const [ttsElapsedSeconds, setTtsElapsedSeconds] = useState(0);
  const [ttsEstimatedDuration, setTtsEstimatedDuration] = useState(0);
  const [ttsUtteranceText, setTtsUtteranceText] = useState('');
  const ttsTimerRef = useRef<any>(null);

  // Admin & Upload Modals
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRubber, setUploadRubber] = useState('SMR 20');
  const [uploadTestType, setUploadTestType] = useState('Ujian Kromatografi Makmal');
  const [isUploading, setIsUploading] = useState(false);

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  // Fetch initial profile & documents
  useEffect(() => {
    fetchAuth();
    fetchDocuments();
    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const fetchAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setAvailableUsers(data.available_users || []);
      }
    } catch (err) {
      console.error('Failed to fetch auth', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/documents?rubber_type=${filterRubber}&format=${filterFormat}&staff=${filterStaff}`);
      const data = await res.json();
      setAllDocuments(data.documents || []);
      setDriveConfig(data.sync_status || null);
      if (!selectedDoc && data.documents && data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  // Re-fetch documents whenever filters change
  useEffect(() => {
    fetchDocuments();
  }, [filterRubber, filterFormat, filterStaff]);

  // Speech recognition initialization (Web Speech API supporting ms-MY and en-US)
  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopListening();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text) {
        setSearchQuery(text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      clearInterval(recordingTimerRef.current);
      if (event.error === 'not-allowed') {
        setSpeechError('Kebenaran mikrofon disekat oleh pelayar. Sila benarkan akses mikrofon atau taip secara manual.');
      } else if (event.error === 'no-speech') {
        setSpeechError('Tiada suara dikesan. Sila cuba lagi atau gunakan carian teks.');
      } else {
        setSpeechError(`Ralat pengecaman suara: ${event.error}. Anda boleh menaip secara manual.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearInterval(recordingTimerRef.current);
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (!speechSupported) {
      setSpeechError('Pelayar anda tidak menyokong Web Speech API. Sila gunakan carian teks manual.');
      return;
    }
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = speechLanguage;
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn('Recognition start issue:', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    clearInterval(recordingTimerRef.current);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Switch voice language
  const handleLanguageChange = (lang: 'ms-MY' | 'en-US') => {
    setSpeechLanguage(lang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  };

  // Perform grounded search
  const handleSearch = async (textToSearch?: string) => {
    const query = (textToSearch !== undefined ? textToSearch : searchQuery).trim();
    if (!query) return;

    setIsSearching(true);
    setSpeechError(null);

    // Stop speaking if currently running
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_text: query,
          rubber_type: filterRubber,
          format: filterFormat,
          staff: filterStaff,
          input_mode: isListening ? 'Voice' : 'Text',
        }),
      });

      const data: SearchResult = await res.json();
      setSearchResult(data);

      // Add to recent queries
      if (!recentQueries.includes(query)) {
        setRecentQueries((prev) => [query, ...prev.slice(0, 4)]);
      }

      // Automatically select the best instrument preview or first cited doc
      if (data.instrument_preview) {
        setSelectedDoc(data.instrument_preview);
        setPreviewTab('instrument');
      } else if (data.table_preview) {
        setSelectedDoc(data.table_preview);
        setPreviewTab('table');
      } else if (data.cited_documents && data.cited_documents.length > 0) {
        setSelectedDoc(data.cited_documents[0]);
      }

      // Automatically read out answer via TTS if not muted
      if (!ttsMuted && data.answer_text) {
        speakText(data.answer_text);
      }
    } catch (err: any) {
      console.error('Search failed', err);
      setSpeechError('Gagal menjalankan carian: ' + (err.message || 'Ralat sambungan'));
    } finally {
      setIsSearching(false);
    }
  };

  // Text-To-Speech (TTS) handling with live audio analyzer progress tracking
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);

    // Clean markdown brackets like [1], [2] for smoother speech
    const cleanSpeech = text.replace(/\[\d+\]/g, '').replace(/[*_#]/g, '').trim();
    if (!cleanSpeech) return;

    setTtsUtteranceText(cleanSpeech);
    setTtsProgress(0);
    setTtsElapsedSeconds(0);
    setTtsCurrentWord('');

    // Estimate total speech duration (approx 2.5 words per second)
    const wordsCount = cleanSpeech.split(/\s+/).length;
    const estimatedSecs = Math.max(Math.round(wordsCount / 2.5), 3);
    setTtsEstimatedDuration(estimatedSecs);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = speechLanguage === 'ms-MY' ? 'id-ID' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const startTime = Date.now();

    utterance.onstart = () => {
      setIsSpeaking(true);
      ttsTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTtsElapsedSeconds(Math.floor(elapsed));
        setTtsProgress((prev) => {
          const timeProgress = (elapsed / estimatedSecs) * 100;
          return Math.min(Math.max(prev, timeProgress), 98);
        });
      }, 150);
    };

    utterance.onboundary = (event: any) => {
      if (event.name === 'word' || event.charIndex !== undefined) {
        const charIndex = event.charIndex;
        const progress = Math.min((charIndex / cleanSpeech.length) * 100, 99);
        setTtsProgress(progress);

        // Find current spoken word
        const nextSpace = cleanSpeech.indexOf(' ', charIndex);
        const currentWord = cleanSpeech.substring(charIndex, nextSpace === -1 ? cleanSpeech.length : nextSpace);
        if (currentWord) {
          setTtsCurrentWord(currentWord);
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTtsProgress(100);
      if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
      setTimeout(() => {
        setTtsProgress(0);
        setTtsCurrentWord('');
      }, 800);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setTtsProgress(0);
    setTtsCurrentWord('');
    if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
  };

  // Sync Google Drive
  const handleSyncDrive = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/documents/sync', { method: 'POST' });
      const data = await res.json();
      setSyncToast(data.message || 'Penyelarasan berjaya.');
      fetchDocuments();
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      console.error('Sync failed', err);
      setSyncToast('Gagal menyelaraskan fail Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Direct upload handler (FR-003)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('rubber_type', uploadRubber);
    formData.append('test_type', uploadTestType);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setSyncToast('Fail berjaya dimuat naik & diindeks ke dalam repositori.');
        fetchDocuments();
        if (data.document) {
          setSelectedDoc(data.document);
        }
      } else {
        alert(data.error || 'Ralat muat naik fail.');
      }
    } catch (err: any) {
      alert('Gagal memuat naik: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Switch authenticated user (for demoing Admin vs Staff RBAC)
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setShowLoginModal(false);
      }
    } catch (err) {
      console.error('Failed to switch user', err);
    }
  };

  // Official email login handler
  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          role: loginRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setShowLoginModal(false);
        setLoginEmail('');
      } else {
        setLoginError(data.error || 'Log masuk gagal.');
      }
    } catch (err: any) {
      setLoginError('Ralat sambungan pelayan: ' + err.message);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterRubber('Semua');
    setFilterFormat('Semua');
    setFilterStaff('Semua');
  };

  // Format file size
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Notification Toast */}
      {syncToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0F4C5C] text-white px-4 py-3 rounded-lg shadow-xl text-sm border border-teal-500/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Scientific Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F4C5C] to-[#0F766E] flex items-center justify-center text-white shadow-md shadow-teal-900/10">
              <FlaskConical className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#0F4C5C] tracking-tight">LGM LabVoice AI</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v1.0 Disahkan
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Lembaga Getah Malaysia • Sistem Carian Pintar Makmal Kimia
              </p>
            </div>
          </div>

          {/* Center Drive Sync Badge */}
          <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">Google Drive Mirror:</span>
            <span className="text-slate-800 font-semibold">{driveConfig?.folder_name || 'LGM Makmal Sync'}</span>
            <button
              onClick={handleSyncDrive}
              disabled={isSyncing}
              title="Penyelarasan Segera"
              className="text-[#0F766E] hover:text-[#0F4C5C] flex items-center gap-1 font-semibold pl-1 border-l border-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyegerak...' : 'Sync'}</span>
            </button>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Upload button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition"
            >
              <UploadCloud className="w-4 h-4 text-[#0F766E]" />
              <span>Muat Naik Fail</span>
            </button>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Buka Tapisan"
            >
              <Filter className="w-4 h-4 text-[#0F4C5C]" />
            </button>

            {/* User RBAC Badge */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-left"
              title="Tukar Pengguna atau Log Keluar"
            >
              <div className="w-7 h-7 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.full_name?.split(' ')[0] || 'Pengguna'}
                </div>
                <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                  {currentUser?.role === 'Admin' ? 'Pegawai Penyelidik (Admin)' : 'Staf Makmal (Staff)'}
                </div>
              </div>
            </button>

            {/* Admin Settings (Only visible to Admin) */}
            {currentUser?.role === 'Admin' && (
              <button
                onClick={() => setShowAdminModal(true)}
                className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-[#0F4C5C] hover:bg-teal-100 transition"
                title="Tetapan Sistem & Folder Drive (Admin Sahaja)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout (Hybrid Responsive Design) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ======================================================== */}
          {/* LEFT PANEL: Navigation & Filter Sidebar (Desktop ≥ 1024px) */}
          {/* ======================================================== */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5">
            {/* Drive Sync Status Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Penyelarasan Repositori</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Aktif
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-medium text-slate-800">{allDocuments.length} Fail Terindeks</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6">
                  Diselaraskan daripada SharePoint LGM
                </p>
                <p className="text-[11px] text-slate-400 pl-6">
                  Terakhir: {new Date(driveConfig?.last_synced || Date.now()).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <button
                onClick={handleSyncDrive}
                disabled={isSyncing}
                className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg bg-teal-50 text-[#0F4C5C] hover:bg-teal-100 border border-teal-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyemak Drive...' : 'Sync / Refresh Index'}</span>
              </button>
            </div>

            {/* Smart Filters Card (FR-004) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Tapisan Spesifik Makmal</span>
                </div>
                {(filterRubber !== 'Semua' || filterFormat !== 'Semua' || filterStaff !== 'Semua') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#0F766E] hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Rubber Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Getah</label>
                <select
                  value={filterRubber}
                  onChange={(e) => setFilterRubber(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-transparent outline-none border"
                >
                  <option value="Semua">Semua Kategori Getah</option>
                  <option value="SMR 20">SMR 20 (Standard Rubber)</option>
                  <option value="SMR CV60">SMR CV60 (Constant Viscosity)</option>
                  <option value="Lateks">Lateks Pekat (Latex Concentrate)</option>
                  <option value="Epoxidised NR">Epoxidised NR (ENR-50 / 25)</option>
                  <option value="Compound">Sebatian / Compound</option>
                </select>
              </div>

              {/* File Format Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Format Fail</label>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-transparent outline-none border"
                >
                  <option value="Semua">Semua Format</option>
                  <option value="imej">Imej Instrumen (Kromatogram/Spektrum)</option>
                  <option value="excel">Hamparan Excel (.xlsx / .csv)</option>
                  <option value="word">Laporan Word (.docx)</option>
                </select>
              </div>

              {/* Testing Staff Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pegawai Penyelidik / Staf</label>
                <select
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-transparent outline-none border"
                >
                  <option value="Semua">Semua Staf Makmal</option>
                  <option value="Dr. Kartini">Dr. Kartini Ahmad (Leader)</option>
                  <option value="Faizal Razak">Faizal Razak (RO)</option>
                  <option value="Nurul Ain">Nurul Ain Zulkifli (RA)</option>
                </select>
              </div>

              {/* Active Filter Tags */}
              {(filterRubber !== 'Semua' || filterFormat !== 'Semua' || filterStaff !== 'Semua') && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {filterRubber !== 'Semua' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                      {filterRubber}
                      <button onClick={() => setFilterRubber('Semua')}><X className="w-3 h-3"/></button>
                    </span>
                  )}
                  {filterFormat !== 'Semua' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      {filterFormat}
                      <button onClick={() => setFilterFormat('Semua')}><X className="w-3 h-3"/></button>
                    </span>
                  )}
                  {filterStaff !== 'Semua' && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      {filterStaff}
                      <button onClick={() => setFilterStaff('Semua')}><X className="w-3 h-3"/></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Recent Queries / Search History */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Sejarah & Contoh Carian</span>
              </div>
              <div className="space-y-1.5">
                {recentQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(q);
                      handleSearch(q);
                    }}
                    className="w-full text-left text-xs p-2 rounded-lg text-slate-600 hover:text-[#0F4C5C] hover:bg-slate-50 transition border border-transparent hover:border-slate-200 line-clamp-2"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* CENTER PANEL: Voice & Query Workspace                     */}
          {/* ======================================================== */}
          <section className="col-span-1 lg:col-span-5 space-y-6">
            
            {/* Prominent Voice & Text Search Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              {/* Audio Waveform Animation when listening */}
              {isListening && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600 animate-pulse" />
              )}

              {/* Language Switcher & Voice Status */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Mod Input:</span>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      onClick={() => handleLanguageChange('ms-MY')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                        speechLanguage === 'ms-MY'
                          ? 'bg-white text-[#0F4C5C] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      BM (Utama)
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en-US')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                        speechLanguage === 'en-US'
                          ? 'bg-white text-[#0F4C5C] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isListening && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Merakam ({recordingSeconds}s / 60s)
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">Code-Switching Aktif</span>
                </div>
              </div>

              {/* Search Input Bar with embedded Mic */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder='Cakap atau taip... "Tunjukkan kromatogram SMR 20"'
                  className="w-full pl-4 pr-24 py-3.5 text-sm sm:text-base rounded-xl border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 outline-none transition bg-slate-50/50 focus:bg-white"
                />

                <div className="absolute right-2 flex items-center gap-1">
                  {/* Clear button if text exists */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      title="Padam teks"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Prominent Microphone Button (Usability: minimum 56px on mobile handled via sizing) */}
                  <button
                    onClick={handleToggleListening}
                    className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-center transition shadow-md ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                        : 'bg-[#0F766E] hover:bg-[#0F4C5C] text-white hover:scale-105 active:scale-95'
                    }`}
                    title={isListening ? 'Hentikan Rakaman' : 'Mulakan Carian Suara'}
                    aria-label="Carian Suara Makmal"
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Visual Audio Analyzer & Waveform Progress Bar (Active while TTS is speaking) */}
              {isSpeaking && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#0F4C5C] to-slate-900 text-white shadow-md border border-teal-500/40 animate-fadeIn">
                  {/* Top Header of Visualizer */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-emerald-300 tracking-wide flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Penganalisis Audio Suara Makmal (TTS Aktif)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                      <span>{ttsElapsedSeconds}s / {ttsEstimatedDuration}s</span>
                      <button
                        onClick={handleStopSpeech}
                        className="px-2 py-0.5 rounded bg-red-500/80 hover:bg-red-600 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                        title="Hentikan Bacaan Audio"
                      >
                        <VolumeX className="w-3 h-3" />
                        <span>Henti</span>
                      </button>
                    </div>
                  </div>

                  {/* 32-Bar Real-Time Graphic Audio Equalizer / Waveform Analyzer */}
                  <div className="h-10 w-full flex items-end justify-between gap-0.5 sm:gap-1 px-1 py-1 bg-black/30 rounded-lg overflow-hidden border border-teal-500/20">
                    {[
                      35, 60, 85, 45, 95, 70, 40, 80, 100, 65, 50, 90, 75, 40, 85, 60,
                      95, 70, 55, 88, 65, 40, 92, 78, 50, 85, 60, 75, 95, 45, 65, 30
                    ].map((baseHeight, idx) => {
                      const animDelay = (idx * 0.045) % 0.8;
                      const animDuration = 0.5 + ((idx % 7) * 0.08);
                      return (
                        <div
                          key={idx}
                          className="flex-1 rounded-t-xs audio-bar-anim"
                          style={{
                            height: `${baseHeight}%`,
                            animationDelay: `${animDelay}s`,
                            animationDuration: `${animDuration}s`,
                            background:
                              idx % 3 === 0
                                ? 'linear-gradient(to top, #0F766E, #10B981)'
                                : idx % 2 === 0
                                ? 'linear-gradient(to top, #0F4C5C, #06B6D4)'
                                : 'linear-gradient(to top, #14B8A6, #34D399)',
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Waveform Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-teal-500/20">
                      <div
                        className="h-full progress-glow-bar rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${Math.max(ttsProgress, 3)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span className="truncate max-w-[70%] text-emerald-200/90 font-medium italic">
                        {ttsCurrentWord ? `"...${ttsCurrentWord}..."` : 'Membacakan ringkasan keputusan saintifik...'}
                      </span>
                      <span className="font-semibold text-teal-300 font-mono">
                        {Math.round(ttsProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Microphone Error Notification */}
              {speechError && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{speechError}</span>
                  </div>
                  <button onClick={() => setSpeechError(null)} className="text-amber-600 hover:text-amber-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Action Buttons & Fast Suggested Queries */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Cadangan pantas makmal:</span>
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F4C5C] hover:bg-teal-900 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                  <span>{isSearching ? 'Mencari...' : 'Cari Dokumen'}</span>
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[
                  'Kromatogram HPTLC SMR 20',
                  'Keputusan Ujian Kotoran & Abu',
                  'Spektrum FTIR ENR-50',
                  'Lateks Pekat ISO 2004',
                  'GC-MS SMR CV60'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(chip);
                      handleSearch(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-[#0F4C5C] border border-slate-200 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Grounded Answer Card (FR-005) */}
            {searchResult && (
              <div className="bg-white rounded-2xl p-5 border border-teal-200/80 shadow-md relative overflow-hidden transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F4C5C] to-[#0F766E]" />
                
                {/* Header with Zero-Hallucination Grounding badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-[#0F766E] flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
                      Jawapan Berasaskan Rekod Makmal
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* TTS Audio Controls */}
                    {isSpeaking ? (
                      <button
                        onClick={handleStopSpeech}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition animate-pulse"
                        title="Hentikan Bacaan Suara"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Henti</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => speakText(searchResult.answer_text)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-[#0F4C5C] text-xs font-semibold hover:bg-teal-100 border border-teal-200 transition"
                        title="Dengar Ringkasan Suara (TTS)"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Dengar (TTS)</span>
                      </button>
                    )}

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Zero-Hallucination
                    </span>
                  </div>
                </div>

                {/* Grounded synthesized text with clickable citations */}
                <div className="text-slate-800 text-sm leading-relaxed space-y-2">
                  <p className="font-normal text-slate-800">
                    {searchResult.answer_text}
                  </p>
                </div>

                {/* Cited Source Documents Badges (FR-005 Acceptance Criteria 1) */}
                {searchResult.cited_documents && searchResult.cited_documents.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 block mb-2">
                      Rujukan Dokumen Makmal Terindeks:
                    </span>
                    <div className="space-y-2">
                      {searchResult.cited_documents.map((doc, idx) => (
                        <div
                          key={doc.doc_id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                            selectedDoc?.doc_id === doc.doc_id
                              ? 'bg-teal-50/70 border-teal-400 ring-1 ring-teal-300'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                {doc.file_name}
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                  {doc.rubber_type}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {doc.test_type} • Diuji oleh {doc.uploaded_by}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Direct Download in exact format (FR-006) */}
                            <a
                              href={`/api/documents/${doc.doc_id}/download`}
                              download={doc.file_name}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-slate-600 hover:text-[#0F4C5C] hover:bg-white rounded-md transition"
                              title={`Muat turun fail asal (${doc.file_extension})`}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <a
                              href={doc.drive_web_link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-slate-600 hover:text-[#0F4C5C] hover:bg-white rounded-md transition"
                              title="Buka di Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List of Available Lab Files with instant live filter */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Repositori Fail Makmal ({allDocuments.length} Fail)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik mana-mana fail untuk pratonton segera & muat turun format asal
                  </span>
                </div>
              </div>

              {/* Instant Search / Filter bar for files */}
              <div className="relative">
                <input
                  type="text"
                  value={fileSearchKeyword}
                  onChange={(e) => setFileSearchKeyword(e.target.value)}
                  placeholder="Tapis pantas: cth 'SMR 20', 'hptlc', 'b44', 'ftir', 'lateks'..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                {fileSearchKeyword && (
                  <button
                    onClick={() => setFileSearchKeyword('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {allDocuments
                  .filter((doc) => {
                    if (!fileSearchKeyword.trim()) return true;
                    const kw = fileSearchKeyword.toLowerCase();
                    return (
                      doc.file_name.toLowerCase().includes(kw) ||
                      doc.rubber_type.toLowerCase().includes(kw) ||
                      doc.test_type.toLowerCase().includes(kw) ||
                      doc.content_summary.toLowerCase().includes(kw)
                    );
                  })
                  .map((doc) => {
                    const isImage = doc.file_extension.match(/\.(png|jpg|jpeg|svg)$/i);
                    const isExcel = doc.file_extension.includes('.xls') || doc.file_extension.includes('.csv');
                    const isWord = doc.file_extension.includes('.doc');

                    return (
                      <div
                        key={doc.doc_id}
                        onClick={() => {
                          setSelectedDoc(doc);
                          if (isImage) setPreviewTab('instrument');
                          else if (isExcel) setPreviewTab('table');
                          else setPreviewTab('info');
                        }}
                        className={`py-2.5 px-2 flex items-center justify-between cursor-pointer rounded-lg transition ${
                          selectedDoc?.doc_id === doc.doc_id
                            ? 'bg-teal-50 text-[#0F4C5C] font-semibold border border-teal-200'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isImage && <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isExcel && <FileSpreadsheet className="w-4 h-4 text-teal-700 shrink-0" />}
                          {isWord && <FileText className="w-4 h-4 text-blue-600 shrink-0" />}

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{doc.file_name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-teal-800 font-semibold">
                                {doc.rubber_type}
                              </span>
                              <span>•</span>
                              <span>{doc.test_type}</span>
                              <span>•</span>
                              <span>{formatBytes(doc.file_size_bytes)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <a
                            href={`/api/documents/${doc.doc_id}/download`}
                            download={doc.file_name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-500 hover:text-[#0F4C5C] hover:bg-white rounded transition"
                            title={`Muat Turun Format Asal (${doc.file_extension})`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* RIGHT PANEL: Visual & Data Preview Pane (FR-006)          */}
          {/* ======================================================== */}
          <section className="col-span-1 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm sticky top-20">
              
              {/* Preview Header & Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      onClick={() => setPreviewTab('instrument')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        previewTab === 'instrument'
                          ? 'bg-white text-[#0F4C5C] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Kromatogram
                    </button>
                    <button
                      onClick={() => setPreviewTab('table')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        previewTab === 'table'
                          ? 'bg-white text-[#0F4C5C] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Jadual Excel
                    </button>
                    <button
                      onClick={() => setPreviewTab('info')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        previewTab === 'info'
                          ? 'bg-white text-[#0F4C5C] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Metadata
                    </button>
                  </div>
                </div>

                {selectedDoc && (
                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/documents/${selectedDoc.doc_id}/download`}
                      download={selectedDoc.file_name}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0F4C5C] px-2.5 py-1.5 rounded-lg shadow-xs transition"
                      title="Muat Turun Fail Dalam Format Asal"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{selectedDoc.file_extension}</span>
                    </a>
                  </div>
                )}
              </div>

              {selectedDoc ? (
                <div>
                  {/* File title banner */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {selectedDoc.rubber_type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">
                      {selectedDoc.file_name}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedDoc.test_type}</p>
                  </div>

                  {/* TAB 1: Visual Chromatogram / Spectrum Preview with Zoom & Inspector */}
                  {previewTab === 'instrument' && (
                    <div className="space-y-3">
                      <div className="relative border border-slate-200 rounded-xl bg-slate-900/5 p-2 overflow-hidden flex flex-col items-center">
                        {/* Zoom Controls */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
                          <button
                            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                            title="Zum Masuk (Zoom In)"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-bold text-slate-600 px-1">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <button
                            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                            title="Zum Keluar (Zoom Out)"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setZoomLevel(1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                            title="Reset Zum"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* High-res Image / SVG Render */}
                        <div
                          className="w-full transition-transform duration-200 overflow-auto max-h-72 flex justify-center items-center"
                          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                        >
                          {selectedDoc.image_preview_url ? (
                            <img
                              src={selectedDoc.image_preview_url}
                              alt={selectedDoc.file_name}
                              className="max-w-full rounded-lg shadow-inner"
                            />
                          ) : (
                            <div className="w-full h-44 bg-slate-100 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                              <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-1" />
                              <p className="text-xs text-slate-500 font-medium">
                                Fail ini adalah format data ({selectedDoc.file_extension}).
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Sila pilih tab "Jadual Excel" untuk pratonton baris data.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Chromatogram Peak Inspector Table */}
                      {selectedDoc.visual_peaks && selectedDoc.visual_peaks.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                          <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                            <span>Bacaan Puncak / Peak Detection</span>
                            <span className="text-[10px] text-teal-700 font-semibold">
                              {selectedDoc.visual_peaks.length} Puncak Dikenal Pasti
                            </span>
                          </div>
                          <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                            {selectedDoc.visual_peaks.map((peak, idx) => (
                              <div key={idx} className="p-2.5 flex items-start justify-between hover:bg-teal-50/40">
                                <div>
                                  <p className="font-semibold text-slate-800">{peak.name}</p>
                                  <p className="text-[10px] text-slate-500">Masa / Nilai: {peak.retention_time_or_rf}</p>
                                </div>
                                <span className="text-[11px] font-mono font-medium text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded">
                                  {peak.area_or_intensity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Excel / Table Data Preview */}
                  {previewTab === 'table' && (
                    <div className="space-y-3">
                      {selectedDoc.table_data ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                          <div className="overflow-x-auto max-h-72">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                  {selectedDoc.table_data.headers.map((h, i) => (
                                    <th key={i} className="p-2 font-semibold whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {selectedDoc.table_data.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-teal-50/50">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                                        {String(cell)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                          <FileText className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                          Tiada jadual data terstruktur dalam fail ini. Sila semak tab Kromatogram atau Metadata fail.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Metadata & File Provenance */}
                  {previewTab === 'info' && (
                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Format Asal:</span>
                        <span className="font-semibold text-slate-800">{selectedDoc.file_extension}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Saiz Fail:</span>
                        <span className="font-semibold text-slate-800">{formatBytes(selectedDoc.file_size_bytes)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Tarikh Kemas Kini:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(selectedDoc.modified_date).toLocaleString('ms-MY')}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Diuji / Dimuat Naik:</span>
                        <span className="font-semibold text-slate-800">{selectedDoc.uploaded_by}</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 block mb-1">Folder Google Drive (Mirror SharePoint):</span>
                        <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-2 py-1 rounded block break-all">
                          {selectedDoc.folder_path}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-slate-500 block mb-1">Ringkasan Kandungan:</span>
                        <p className="text-slate-700 leading-normal bg-white p-2.5 rounded border border-slate-200">
                          {selectedDoc.content_summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Sila pilih sebarang fail atau buat carian suara untuk melihat pratonton.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ======================================================== */}
      {/* MOBILE VOICE-FIRST FLOATING MIC DOCK (< 1024px) (FR-002) */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border border-slate-200 flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="p-2 text-slate-600 hover:text-[#0F4C5C]"
            title="Buka Tapisan"
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Large Touch-Friendly Microphone (≥56px x 56px requirement in PRD Section 14) */}
          <button
            onClick={handleToggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                : 'bg-[#0F766E] text-white hover:bg-[#0F4C5C]'
            }`}
            aria-label="Carian Suara Makmal Sebelah Tangan"
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>

          <button
            onClick={() => handleSearch()}
            className="p-2 text-slate-600 hover:text-[#0F4C5C]"
            title="Cari"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE FILTER DRAWER                                     */}
      {/* ======================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-80 bg-white h-full p-5 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Tapisan Makmal (LGM)</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-md text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Getah</label>
              <select
                value={filterRubber}
                onChange={(e) => setFilterRubber(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2 text-slate-800 border"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="SMR 20">SMR 20</option>
                <option value="SMR CV60">SMR CV60</option>
                <option value="Lateks">Lateks Pekat</option>
                <option value="Epoxidised NR">Epoxidised NR</option>
                <option value="Compound">Compound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Format Fail</label>
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 bg-slate-50 p-2 text-slate-800 border"
              >
                <option value="Semua">Semua Format</option>
                <option value="imej">Imej Instrumen (Kromatogram/Spektrum)</option>
                <option value="excel">Hamparan Excel (.xlsx)</option>
                <option value="word">Laporan Word (.docx)</option>
              </select>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#0F4C5C] text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUTHENTICATION & RBAC ROLE SWITCHER MODAL (FR-001)        */}
      {/* ======================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-bold text-slate-900 text-base">Pengesahan Pengguna & Peranan (RBAC)</h3>
              </div>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900">
                <p className="font-semibold mb-1">Syarat Akses Keselamatan LGM:</p>
                <p>Hanya emel rasmi organisasi <span className="font-mono font-bold">@lgm.gov.my</span> dibenarkan. Pengguna luar disekat untuk melindungi data ujian kimia sulit.</p>
              </div>

              {/* Quick switch between pre-registered test accounts */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Tukar Profil Ujian (Admin vs Staff):
                </label>
                <div className="space-y-2">
                  {availableUsers.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => handleSwitchUser(u.user_id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                        currentUser?.user_id === u.user_id
                          ? 'border-[#0F766E] bg-teal-50/70 font-semibold text-[#0F4C5C]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{u.full_name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Admin' ? 'bg-[#0F4C5C] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login form for custom official email */}
              <form onSubmit={handleOfficialLogin} className="pt-3 border-t border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-600">
                  Atau Log Masuk Emel Rasmi Baharu:
                </label>
                <div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@lgm.gov.my"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0F766E] outline-none"
                  />
                </div>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="Staff"
                      checked={loginRole === 'Staff'}
                      onChange={() => setLoginRole('Staff')}
                    />
                    <span>Staf Makmal (Staff)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="Admin"
                      checked={loginRole === 'Admin'}
                      onChange={() => setLoginRole('Admin')}
                    />
                    <span>Pegawai Penyelidik (Admin)</span>
                  </label>
                </div>

                {loginError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-[#0F4C5C] text-white text-xs font-bold rounded-lg hover:bg-teal-900 transition"
                >
                  Log Masuk
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN GOOGLE DRIVE & RBAC CONFIGURATION MODAL (FR-001)   */}
      {/* ======================================================== */}
      {showAdminModal && currentUser?.role === 'Admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0F4C5C]" />
                <h3 className="font-bold text-slate-900 text-base">Tetapan Pentadbir Makmal (Admin)</h3>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Folder Google Drive Terpaut:</span>
                <p className="font-mono text-[11px] text-teal-800 break-all">{driveConfig?.folder_id}</p>
                <p className="text-slate-500 mt-1">Nama Folder: {driveConfig?.folder_name}</p>
                <p className="text-slate-500">Penyelarasan: {driveConfig?.sync_schedule}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ID Folder Google Drive:</label>
                <input
                  type="text"
                  defaultValue={driveConfig?.folder_id}
                  id="admin-folder-id"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Jenis Getah Makmal:</label>
                <div className="flex flex-wrap gap-1.5">
                  {driveConfig?.rubber_categories?.map((cat, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    const input = (document.getElementById('admin-folder-id') as HTMLInputElement)?.value;
                    if (input) {
                      await fetch('/api/config/drive', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ folder_id: input }),
                      });
                      setSyncToast('Tetapan folder Google Drive berjaya dikemas kini.');
                      setShowAdminModal(false);
                      fetchDocuments();
                    }
                  }}
                  className="w-full py-2 bg-[#0F766E] hover:bg-[#0F4C5C] text-white font-bold rounded-lg transition"
                >
                  Simpan Tetapan Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIRECT FILE UPLOAD MODAL (FR-003)                        */}
      {/* ======================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-bold text-slate-900 text-base">Muat Naik Fail Makmal Terus</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Fail Ujian Makmal:</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.docx,.pptx,.pdf,.csv,.png,.jpg,.jpeg,.svg"
                  required
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-dashed border-slate-300 rounded-lg text-xs bg-slate-50"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Format disokong: .xlsx, .docx, .png, .jpg, .pdf (format asal dikekalkan tanpa pemampatan).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Getah:</label>
                <select
                  value={uploadRubber}
                  onChange={(e) => setUploadRubber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="SMR 20">SMR 20</option>
                  <option value="SMR CV60">SMR CV60</option>
                  <option value="Lateks">Lateks Pekat</option>
                  <option value="Epoxidised NR">Epoxidised NR</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Nama Ujian:</label>
                <input
                  type="text"
                  value={uploadTestType}
                  onChange={(e) => setUploadTestType(e.target.value)}
                  placeholder="Cth: Ujian Pengecaman HPTLC Batch Q4"
                  required
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="flex-1 py-2 rounded-lg bg-[#0F4C5C] hover:bg-teal-900 text-white font-bold transition disabled:opacity-50"
                >
                  {isUploading ? 'Memuat Naik...' : 'Muat Naik & Indeks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © 2026 Lembaga Getah Malaysia (LGM). Hak Cipta Terpelihara.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Pusat Penyelidikan Sungai Buloh</span>
            <span>•</span>
            <span>Zero-Hallucination Chemical Verification</span>
            <span>•</span>
            <span>Google Drive Mirror Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
