import React, { useState, useEffect } from 'react';
import { db, getSetting, setSetting } from './db';
import { 
  Home, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Plus, 
  ArrowLeft, 
  FileDown, 
  FileUp, 
  Trash2, 
  Lock, 
  KeyRound, 
  RotateCcw,
  CheckCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Search,
  X
} from 'lucide-react';
import ItemCard from './components/ItemCard';
import AddItemModal from './components/AddItemModal';
import DetailModal from './components/DetailModal';

import iconMakan from './assets/icon_makan.jpg';
import iconWisata from './assets/icon_wisata.jpg';
import iconRoblox from './assets/icon_roblox.jpg';
import iconKomik from './assets/icon_komik.jpg';
import iconFilm from './assets/icon_film.jpg';
import iconHobi from './assets/icon_hobi.jpg';

export default function App() {
  // Navigation states: 'home', 'feed', 'settings'
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feed filtering: 'belum' (Wishlist) or 'sudah' (Arsip/Riwayat)
  const [feedStatusTab, setFeedStatusTab] = useState('belum');

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Lockscreen states
  const [isLocked, setIsLocked] = useState(true);
  const [pinHash, setPinHash] = useState(null); // Saved PIN
  const [isPinSetup, setIsPinSetup] = useState(false); // If setting PIN for first time
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [setupPinStep, setSetupPinStep] = useState(1); // 1: Enter new PIN, 2: Confirm PIN
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Items and Category counts
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    makan: { belum: 0, sudah: 0 },
    wisata: { belum: 0, sudah: 0 },
    roblox: { belum: 0, sudah: 0 },
    komik: { belum: 0, sudah: 0 },
    film: { belum: 0, sudah: 0 },
    hobi: { belum: 0, sudah: 0 },
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  // Settings screen specific state
  const [settingsPinInput, setSettingsPinInput] = useState('');
  const [settingsPinError, setSettingsPinError] = useState('');

  // Load PIN and count totals on startup
  useEffect(() => {
    async function initApp() {
      const savedPin = await getSetting('app_pin');
      if (savedPin) {
        setPinHash(savedPin);
        setIsPinSetup(false);
        setIsLocked(true);
      } else {
        setIsPinSetup(true);
        setIsLocked(true);
      }
      await refreshData();
    }
    initApp();
  }, []);

  // Sync React navigation/modal state with browser history (for Android physical back button)
  useEffect(() => {
    // Set initial history state if empty
    if (!window.history.state) {
      window.history.replaceState({ tab: 'home', category: null, modal: null }, '');
    }

    const handlePopState = (event) => {
      const state = event.state || {};
      
      // Close or open Add/Edit modal
      if (state.modal === 'add') {
        setShowAddModal(true);
      } else {
        setShowAddModal(false);
        setSelectedItemForEdit(null);
      }

      // Close or open Detail modal
      if (state.modal === 'detail') {
        setSelectedItemForDetail(state.detailItem || null);
      } else {
        setSelectedItemForDetail(null);
      }

      // Set current Tab and Category
      if (state.tab) {
        setCurrentTab(state.tab);
        setSelectedCategory(state.category || null);
      } else {
        setCurrentTab('home');
        setSelectedCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync data and count categories
  const refreshData = async () => {
    const allItems = await db.items.toArray();
    setItems(allItems);

    // Calculate category counts
    const newCounts = {
      makan: { belum: 0, sudah: 0 },
      wisata: { belum: 0, sudah: 0 },
      roblox: { belum: 0, sudah: 0 },
      komik: { belum: 0, sudah: 0 },
      film: { belum: 0, sudah: 0 },
      hobi: { belum: 0, sudah: 0 },
    };

    allItems.forEach(item => {
      if (newCounts[item.category]) {
        if (item.status === 'sudah') {
          newCounts[item.category].sudah++;
        } else {
          newCounts[item.category].belum++;
        }
      }
    });

    setCounts(newCounts);
  };

  // PIN lock keyboard input handler
  const handlePinKeyPress = (num) => {
    setPinError('');
    if (currentPinInput.length >= 4) return;

    const newInput = currentPinInput + num;
    setCurrentPinInput(newInput);

    // If reached 4 digits, process immediately
    if (newInput.length === 4) {
      setTimeout(() => {
        handlePinSubmit(newInput);
      }, 200);
    }
  };

  const handlePinBackspace = () => {
    setCurrentPinInput(prev => prev.slice(0, -1));
  };

  const handlePinSubmit = async (inputPin) => {
    if (isPinSetup) {
      if (setupPinStep === 1) {
        setTempPin(inputPin);
        setSetupPinStep(2);
        setCurrentPinInput('');
      } else {
        if (inputPin === tempPin) {
          // PIN verified, save to database
          await setSetting('app_pin', inputPin);
          setPinHash(inputPin);
          setIsLocked(false);
          setIsPinSetup(false);
          setCurrentPinInput('');
          setTempPin('');
          setSetupPinStep(1);
        } else {
          setPinError('PIN Konfirmasi tidak cocok!');
          setCurrentPinInput('');
          setSetupPinStep(1);
          setTempPin('');
        }
      }
    } else {
      if (inputPin === pinHash) {
        setIsLocked(false);
        setCurrentPinInput('');
      } else {
        setPinError('PIN Salah, coba lagi!');
        setCurrentPinInput('');
      }
    }
  };

  // Lock the app again
  const handleLockApp = () => {
    if (pinHash) {
      setIsLocked(true);
    }
  };

  // Toggle Item Archive State ('belum' <-> 'sudah')
  const handleToggleStatus = async (item) => {
    const updatedStatus = item.status === 'sudah' ? 'belum' : 'sudah';
    await db.items.update(item.id, { status: updatedStatus });
    await refreshData();
  };

  // Save Add/Edit Item
  const handleSaveItem = async (payload) => {
    if (selectedItemForEdit) {
      await db.items.update(selectedItemForEdit.id, payload);
    } else {
      await db.items.add(payload);
    }
    window.history.back();
    await refreshData();
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini dari arsip?')) {
      await db.items.delete(id);
      window.history.back();
      await refreshData();
    }
  };

  // Export database as JSON file
  const handleExportData = async () => {
    try {
      const allItems = await db.items.toArray();
      const backupData = {
        version: 1,
        appName: 'DailyListPersonalArchive',
        exportedAt: Date.now(),
        items: allItems
      };
      
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily_list_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal mengekspor data: ' + err.message);
    }
  };

  // Import database from JSON file
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        
        if (backupData.appName !== 'DailyListPersonalArchive' || !Array.isArray(backupData.items)) {
          alert('Format file cadangan tidak valid!');
          return;
        }

        if (confirm(`Anda akan mengimpor ${backupData.items.length} item. Ini akan menambah/menggabungkan dengan data yang ada sekarang. Lanjutkan?`)) {
          // Import into DB
          for (const item of backupData.items) {
            // Remove id so it generates a new one, or keep it to overwrite
            const { id, ...cleanItem } = item;
            await db.items.add(cleanItem);
          }
          alert('Data berhasil diimpor!');
          await refreshData();
          // Reset file input value
          e.target.value = null;
        }
      } catch (err) {
        alert('Gagal membaca data: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Helper for CSV Export
  const convertToCSV = (itemsList) => {
    const headers = [
      'name', 'category', 'status', 'createdAt', 'note', 'address', 
      'description', 'link', 'synopsis', 'releaseYear', 'startDate', 
      'image', 'finalImage'
    ];
    const csvRows = [headers.join(',')];

    for (const item of itemsList) {
      const values = headers.map(header => {
        const val = item[header];
        if (val === undefined || val === null) {
          return '""';
        }
        // Escape double quotes by doubling them
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  // Helper for CSV Import
  const parseCSV = (csvText) => {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const c = csvText[i];
      const next = csvText[i+1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++; // Skip the escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push("");
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row);
    }

    if (lines.length === 0) return [];
    
    const headers = lines[0].map(h => h.trim());
    const parsedItems = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i];
      if (values.length < headers.length) continue;
      
      const item = {};
      headers.forEach((header, index) => {
        let val = values[index];
        if (val === '') {
          val = undefined;
        } else if (header === 'createdAt' || header === 'releaseYear') {
          val = val ? parseInt(val, 10) : undefined;
          if (isNaN(val)) val = undefined;
        }
        item[header] = val;
      });
      parsedItems.push(item);
    }
    return parsedItems;
  };

  // Export database as CSV file
  const handleExportCSV = async () => {
    try {
      const allItems = await db.items.toArray();
      const csvStr = convertToCSV(allItems);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily_list_backup_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal mengekspor CSV: ' + err.message);
    }
  };

  // Import database from CSV file
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const importedItems = parseCSV(csvText);
        
        if (importedItems.length === 0) {
          alert('Format file CSV tidak valid atau kosong!');
          return;
        }

        if (confirm(`Anda akan mengimpor ${importedItems.length} item dari CSV. Ini akan menambah/menggabungkan dengan data yang ada sekarang. Lanjutkan?`)) {
          for (const item of importedItems) {
            const { id, ...cleanItem } = item;
            await db.items.add(cleanItem);
          }
          alert('Data CSV berhasil diimpor!');
          await refreshData();
          e.target.value = null;
        }
      } catch (err) {
        alert('Gagal membaca CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Change or Set PIN
  const handleChangePin = async (e) => {
    e.preventDefault();
    setSettingsPinError('');
    if (settingsPinInput.length !== 4 || isNaN(settingsPinInput)) {
      setSettingsPinError('PIN harus berupa 4 digit angka!');
      return;
    }

    await setSetting('app_pin', settingsPinInput);
    setPinHash(settingsPinInput);
    setSettingsPinInput('');
    alert('PIN berhasil diperbarui!');
  };

  // Factory Reset Database
  const handleFactoryReset = async () => {
    if (confirm('PERINGATAN KERAS! Ini akan menghapus SELURUH data, gambar, dan pengaturan PIN Anda secara permanen. Apakah Anda yakin?')) {
      await db.items.clear();
      await db.settings.clear();
      setPinHash(null);
      setIsPinSetup(true);
      setIsLocked(true);
      await refreshData();
      alert('Aplikasi telah di-reset ke kondisi awal.');
    }
  };

  // Navigation handlers
  const openCategoryFeed = (catKey) => {
    setSelectedCategory(catKey);
    setCurrentTab('feed');
    setSearchQuery('');
    window.history.pushState({ tab: 'feed', category: catKey, modal: null }, '');
  };

  const getCategoryDetails = (catKey) => {
    switch(catKey) {
      case 'makan': return { title: 'Tempat Makan', icon: iconMakan, color: 'var(--color-makan)' };
      case 'wisata': return { title: 'Wisata & Kunjungan', icon: iconWisata, color: 'var(--color-wisata)' };
      case 'roblox': return { title: 'Roblox Games', icon: iconRoblox, color: 'var(--color-roblox)' };
      case 'komik': return { title: 'Daftar Komik', icon: iconKomik, color: 'var(--color-komik)' };
      case 'film': return { title: 'Daftar Film', icon: iconFilm, color: 'var(--color-film)' };
      case 'hobi': return { title: 'Proyek Hobi', icon: iconHobi, color: 'var(--color-hobi)' };
      default: return { title: 'Arsip', icon: null, color: 'var(--accent)' };
    }
  };

  // LOCK SCREEN RENDER
  if (isLocked) {
    return (
      <div className="lock-screen">
        <div className="lock-container">
          <div className="lock-logo">🔒</div>
          <h2 className="lock-title">
            {isPinSetup 
              ? (setupPinStep === 1 ? 'Buat Kunci PIN Baru' : 'Konfirmasi PIN Baru')
              : 'Web Personal Archive'}
          </h2>
          <p className="lock-subtitle">
            {isPinSetup
              ? 'Gunakan 4 digit PIN untuk mengamankan data arsip pribadi Anda.'
              : 'Masukkan PIN untuk mengakses arsip.'}
          </p>

          <div className="pin-display">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`pin-dot ${i < currentPinInput.length ? 'filled' : ''}`} 
              />
            ))}
          </div>

          {pinError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '24px', fontWeight: '500' }}>
              {pinError}
            </p>
          )}

          <div className="pin-keyboard">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num} 
                type="button"
                className="pin-btn"
                onClick={() => handlePinKeyPress(num)}
              >
                {num}
              </button>
            ))}
            <button 
              type="button" 
              className="pin-btn"
              onClick={() => handlePinKeyPress(0)}
            >
              0
            </button>
            <button 
              type="button" 
              className="pin-btn"
              style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}
              onClick={handlePinBackspace}
            >
              Hapus
            </button>
            {isPinSetup && setupPinStep === 2 && (
              <button 
                type="button" 
                className="pin-btn"
                style={{ fontSize: '0.9rem', color: 'var(--color-pending)' }}
                onClick={() => {
                  setSetupPinStep(1);
                  setTempPin('');
                  setCurrentPinInput('');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress of wishlist items achieved
  const totalItems = items.length;
  const completedItems = items.filter(item => item.status === 'sudah').length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const getProgressMotivation = (percentage) => {
    if (totalItems === 0) return 'Mulai tambahkan beberapa item di wishlist Anda!';
    if (percentage === 100) return 'Luar biasa! Semua wishlist Anda telah tercapai! 🎉';
    if (percentage >= 75) return 'Hebat! Anda hampir mencapai semua target wishlist Anda. Teruskan! 💪';
    if (percentage >= 50) return 'Bagus! Setengah dari wishlist Anda sudah tercapai. Selangkah lagi! 🎯';
    if (percentage >= 25) return 'Perkembangan yang bagus! Nikmati setiap pencapaian kecil Anda. 🌟';
    return 'Mari selesaikan wishlist pertamamu! 🚀';
  };

  // Filter items globally based on searchQuery
  const filteredSearchItems = searchQuery.trim() === ''
    ? []
    : items.filter(item => {
        const query = searchQuery.toLowerCase();
        const details = getCategoryDetails(item.category);
        
        return (
          item.name?.toLowerCase().includes(query) ||
          item.note?.toLowerCase().includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.link?.toLowerCase().includes(query) ||
          item.synopsis?.toLowerCase().includes(query) ||
          item.releaseYear?.toString().includes(query) ||
          item.startDate?.toLowerCase().includes(query) ||
          details?.title?.toLowerCase().includes(query)
        );
      });

  // MAIN LAYOUT RENDER
  return (
    <div className="app-container">
      {/* HEADER BAR */}
      <header className="app-header">
        <span className="header-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <img src="/favicon.png" alt="" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
          Personal Archive
        </span>
        <div className="header-actions">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="header-action-btn"
            title={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
            type="button"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {pinHash && (
            <button 
              onClick={handleLockApp} 
              className="header-action-btn"
              title="Kunci Aplikasi"
              type="button"
            >
              <Lock size={18} />
            </button>
          )}
        </div>
      </header>

      {/* DASHBOARD/HOME VIEW */}
      {currentTab === 'home' && (
        <div className="home-container">
          <div className="welcome-section">
            <h1 className="welcome-title">Pengelola Arsip Wishlist Pribadi</h1>
            <p className="welcome-subtitle">Khusus untuk Annisa Pertiwi</p>
          </div>

          {/* SEARCH BAR */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari di semua kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear" 
                onClick={() => setSearchQuery('')}
                title="Hapus Pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* PROGRESS CARD */}
          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-title">Pencapaian Wishlist</span>
              <span className="progress-percentage">{progressPercentage}%</span>
            </div>
            
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="progress-motivation">
                {getProgressMotivation(progressPercentage)}
              </span>
              <span className="progress-stats">
                {completedItems}/{totalItems} Selesai
              </span>
            </div>
          </div>

          {searchQuery.trim() !== '' ? (
            <div>
              <div className="search-results-header">
                <span className="search-results-title">
                  Hasil Pencarian ({filteredSearchItems.length})
                </span>
              </div>

              {filteredSearchItems.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 10px' }}>
                  <div className="empty-icon">🔍</div>
                  <h3 className="empty-text">Tidak Ditemukan</h3>
                  <p className="empty-subtext">
                    Tidak ada hasil pencarian untuk "{searchQuery}". Coba kata kunci lain.
                  </p>
                </div>
              ) : (
                <div className="search-results-list">
                  {filteredSearchItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onToggleStatus={handleToggleStatus}
                      onEdit={(itemToEdit) => {
                        setSelectedItemForEdit(itemToEdit);
                        setSelectedCategory(itemToEdit.category);
                        setShowAddModal(true);
                        window.history.pushState({ tab: 'home', category: itemToEdit.category, modal: 'add' }, '');
                      }}
                      onDelete={handleDeleteItem}
                      onClick={() => {
                        setSelectedItemForDetail(item);
                        window.history.pushState({ tab: 'home', category: null, modal: 'detail', detailItem: item }, '');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="category-grid">
              {Object.keys(counts).map((catKey) => {
                const details = getCategoryDetails(catKey);
                const countBelum = counts[catKey].belum;
                const countSudah = counts[catKey].sudah;
                
                return (
                  <button
                    key={catKey}
                    className="category-card"
                    style={{ '--cat-color': details.color }}
                    onClick={() => openCategoryFeed(catKey)}
                  >
                    <div className="category-icon-wrapper">
                      {details.icon ? (
                        <img src={details.icon} alt="" className="category-icon-img" />
                      ) : (
                        '📁'
                      )}
                    </div>
                    <div className="category-details">
                      <span className="category-name">{details.title}</span>
                      <span className="category-count">
                        {countBelum} Wishlist • {countSudah} Selesai/Arsip
                      </span>
                    </div>
                    <ChevronRight size={18} className="category-arrow" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY FEED/LIST VIEW */}
      {currentTab === 'feed' && selectedCategory && (() => {
        const details = getCategoryDetails(selectedCategory);
        const filteredItems = items.filter(
          item => item.category === selectedCategory && item.status === feedStatusTab
        );

        return (
          <div>
            <div className="feed-header">
              <button className="back-btn" onClick={() => window.history.back()}>
                <ArrowLeft size={18} />
              </button>
              <div className="feed-title-wrapper">
                <span className="feed-title">
                  {details.icon ? (
                    <img src={details.icon} alt="" className="feed-title-icon-img" />
                  ) : (
                    '📁'
                  )}
                  {details.title}
                </span>
                <span className="feed-count">
                  {items.filter(i => i.category === selectedCategory).length} total item
                </span>
              </div>
            </div>

            {/* Switcher Tab "Wishlist" vs "Arsip" */}
            <div className="tab-container">
              <button 
                className={`tab-btn ${feedStatusTab === 'belum' ? 'active' : ''}`}
                onClick={() => setFeedStatusTab('belum')}
              >
                Wishlist ({counts[selectedCategory].belum})
              </button>
              <button 
                className={`tab-btn ${feedStatusTab === 'sudah' ? 'active' : ''}`}
                onClick={() => setFeedStatusTab('sudah')}
              >
                Arsip/Riwayat ({counts[selectedCategory].sudah})
              </button>
            </div>

            {/* Dynamic Items Vertical Feed */}
            <div className="feed-list">
              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {details.icon ? (
                      <img src={details.icon} alt="" className="empty-icon-img" />
                    ) : (
                      '📁'
                    )}
                  </div>
                  <h3 className="empty-text">Daftar Masih Kosong</h3>
                  <p className="empty-subtext">
                    Belum ada item di tab ini. Ketuk tombol + di bawah untuk menambah.
                  </p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(itemToEdit) => {
                      setSelectedItemForEdit(itemToEdit);
                      setShowAddModal(true);
                      window.history.pushState({ tab: currentTab, category: selectedCategory, modal: 'add' }, '');
                    }}
                    onDelete={handleDeleteItem}
                    onClick={() => {
                      setSelectedItemForDetail(item);
                      window.history.pushState({ tab: currentTab, category: selectedCategory, modal: 'detail', detailItem: item }, '');
                    }}
                  />
                ))
              )}
            </div>

            {/* Floating Action Button (FAB) to Add Item */}
            <button className="fab" onClick={() => {
              setSelectedItemForEdit(null);
              setShowAddModal(true);
              window.history.pushState({ tab: currentTab, category: selectedCategory, modal: 'add' }, '');
            }} title="Tambah Item Baru">
              <Plus size={24} />
            </button>
          </div>
        );
      })()}

      {/* SETTINGS VIEW */}
      {currentTab === 'settings' && (
        <div className="settings-container">
          <div className="welcome-section">
            <h1 className="welcome-title">Pengaturan</h1>
            <p className="welcome-subtitle">Atur kunci keamanan, cadangan data, dan ekspor arsip pribadi Anda.</p>
          </div>

          {/* Backup Section */}
          <div className="settings-card">
            <h3 className="settings-section-title">📦 Cadangan & Impor Data</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Data Anda disimpan secara lokal di browser perangkat ini. Lakukan ekspor berkala untuk mengamankan data dan memindahkannya ke perangkat lain.
            </p>
            
            <div className="backup-btns">
              <button className="btn-accent-outline" onClick={handleExportData}>
                <FileDown size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Ekspor JSON
              </button>
              
              <label className="btn-accent-outline file-upload-label" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileUp size={14} style={{ marginRight: '6px' }} />
                Impor JSON
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportData} 
                  style={{ display: 'none' }} 
                />
              </label>

              <button className="btn-accent-outline" onClick={handleExportCSV}>
                <FileDown size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Ekspor CSV
              </button>
              
              <label className="btn-accent-outline file-upload-label" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileUp size={14} style={{ marginRight: '6px' }} />
                Impor CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleImportCSV} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          {/* PIN Lock Section */}
          <div className="settings-card">
            <h3 className="settings-section-title">🔑 Ganti Kunci PIN Keamanan</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Ubah 4 digit PIN yang digunakan untuk mengamankan data personal archive Anda.
            </p>
            
            <form onSubmit={handleChangePin} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
              <div style={{ flexGrow: 1 }}>
                <input 
                  type="password" 
                  maxLength={4} 
                  pattern="[0-9]*" 
                  inputMode="numeric" 
                  placeholder="PIN Baru (4 angka)"
                  value={settingsPinInput}
                  onChange={(e) => setSettingsPinInput(e.target.value.replace(/\D/g, ''))}
                />
                {settingsPinError && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>
                    {settingsPinError}
                  </p>
                )}
              </div>
              <button type="submit" className="btn-accent-outline" style={{ height: '46px' }}>
                Perbarui PIN
              </button>
            </form>
          </div>

          {/* Factory Reset Section */}
          <div className="settings-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 className="settings-section-title" style={{ color: 'var(--color-danger)' }}>⚠️ Reset Pabrik</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Menghapus seluruh item wishlist, riwayat, gambar, dan pengaturan kunci. Aksi ini tidak dapat dibatalkan!
            </p>
            
            <button className="btn-danger-outline" onClick={handleFactoryReset} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
              Hapus Semua Data
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV BAR */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentTab === 'home' || currentTab === 'feed' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory(null);
            setCurrentTab('home');
            setSearchQuery('');
            window.history.pushState({ tab: 'home', category: null, modal: null }, '');
          }}
        >
          <Home size={20} />
          <span>Beranda</span>
        </button>

        <button 
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('settings');
            setSearchQuery('');
            window.history.pushState({ tab: 'settings', category: null, modal: null }, '');
          }}
        >
          <SettingsIcon size={20} />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* MODAL: ADD / EDIT ITEM */}
      {showAddModal && selectedCategory && (
        <AddItemModal
          category={selectedCategory}
          editItem={selectedItemForEdit}
          onClose={() => {
            window.history.back();
          }}
          onSave={handleSaveItem}
        />
      )}

      {/* MODAL: VIEW ITEM DETAILS */}
      {selectedItemForDetail && (
        <DetailModal
          item={selectedItemForDetail}
          onClose={() => window.history.back()}
        />
      )}
    </div>
  );
}
