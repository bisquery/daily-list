import React from 'react';
import { X, ExternalLink, MapPin, Calendar, Clock, BookOpen, Film, Gamepad2, AlertCircle } from 'lucide-react';

import iconMakan from '../assets/icon_makan.jpg';
import iconWisata from '../assets/icon_wisata.jpg';
import iconRoblox from '../assets/icon_roblox.jpg';
import iconKomik from '../assets/icon_komik.jpg';
import iconFilm from '../assets/icon_film.jpg';
import iconHobi from '../assets/icon_hobi.jpg';

export default function DetailModal({ item, onClose }) {
  if (!item) return null;

  const getCategoryName = (category) => {
    switch (category) {
      case 'makan':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconMakan} alt="" className="detail-badge-icon" /> Tempat Makan
          </span>
        );
      case 'wisata':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconWisata} alt="" className="detail-badge-icon" /> Tempat Wisata
          </span>
        );
      case 'roblox':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconRoblox} alt="" className="detail-badge-icon" /> Roblox Game
          </span>
        );
      case 'komik':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconKomik} alt="" className="detail-badge-icon" /> Daftar Komik
          </span>
        );
      case 'film':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconFilm} alt="" className="detail-badge-icon" /> Daftar Film
          </span>
        );
      case 'hobi':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconHobi} alt="" className="detail-badge-icon" /> Proyek Hobi
          </span>
        );
      default:
        return 'Detail Item';
    }
  };

  const renderCategorySpecificContent = () => {
    switch (item.category) {
      case 'makan':
      case 'wisata':
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address || item.name)}`;
        return (
          <>
            {item.address && (
              <div className="detail-section">
                <span className="detail-section-title">Alamat Lengkap</span>
                <span className="detail-section-content">{item.address}</span>
              </div>
            )}
            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`action-link-btn ${item.category === 'makan' ? 'btn-makan' : 'btn-wisata'}`}
            >
              <MapPin size={18} />
              <span>BUKA GOOGLE MAPS</span>
            </a>
          </>
        );

      case 'roblox':
        return (
          <>
            {item.description && (
              <div className="detail-section">
                <span className="detail-section-title">Deskripsi Game</span>
                <span className="detail-section-content">{item.description}</span>
              </div>
            )}
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-link-btn btn-roblox"
              >
                <Gamepad2 size={18} />
                <span>BUKA LINK GAME</span>
              </a>
            )}
          </>
        );

      case 'komik':
        return (
          <>
            {item.synopsis && (
              <div className="detail-section">
                <span className="detail-section-title">Sinopsis Komik</span>
                <span className="detail-section-content">{item.synopsis}</span>
              </div>
            )}
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-link-btn btn-komik"
              >
                <BookOpen size={18} />
                <span>BACA ONLINE</span>
              </a>
            )}
          </>
        );

      case 'film':
        return (
          <>
            {item.releaseYear && (
              <div className="detail-section">
                <span className="detail-section-title">Tahun Rilis</span>
                <span className="detail-section-content" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> {item.releaseYear}
                </span>
              </div>
            )}
            {item.synopsis && (
              <div className="detail-section">
                <span className="detail-section-title">Sinopsis Film</span>
                <span className="detail-section-content">{item.synopsis}</span>
              </div>
            )}
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-link-btn btn-film"
              >
                <Film size={18} />
                <span>LIHAT TRAILER</span>
              </a>
            )}
          </>
        );

      case 'hobi':
        const formattedStartDate = item.startDate 
          ? new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'Tidak ditentukan';
        return (
          <>
            <div className="detail-section">
              <span className="detail-section-title">Tanggal Mulai Proyek</span>
              <span className="detail-section-content" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {formattedStartDate}
              </span>
            </div>
            
            <div className="detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="detail-section-title">Visualisasi Proyek</span>
              <div style={{ display: 'grid', gridTemplateColumns: item.finalImage ? '1fr 1fr' : '1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Referensi:</span>
                  <img src={item.image} alt="Referensi" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                </div>
                {item.finalImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Hasil Akhir:</span>
                    <img src={item.finalImage} alt="Hasil Akhir" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const formattedDate = item.createdAt 
    ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detail Item</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {item.category === 'hobi' && item.finalImage ? (
            <img src={item.finalImage} alt={item.name} className="detail-image" />
          ) : item.image ? (
            <img src={item.image} alt={item.name} className="detail-image" />
          ) : (
            <div className="item-image-placeholder" style={{ height: '180px', borderRadius: '16px' }}>
              <span>Tidak ada gambar</span>
            </div>
          )}

          <div>
            <h2 className="detail-title">{item.name}</h2>
            <div className="detail-badge-row" style={{ marginTop: '8px' }}>
              <span className="detail-badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {getCategoryName(item.category)}
              </span>
              <span className={`detail-badge ${item.status === 'sudah' ? 'status-sudah' : 'status-belum'}`}>
                {item.status === 'sudah' ? 'Arsip / Sudah' : 'Belum Selesai'}
              </span>
            </div>
          </div>

          {item.note && (
            <div className="detail-section">
              <span className="detail-section-title">Catatan Pribadi</span>
              <p className="detail-section-content">{item.note}</p>
            </div>
          )}

          {renderCategorySpecificContent()}

          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <Clock size={12} />
              <span>Dibuat: {formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
