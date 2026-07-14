import React from 'react';
import { X, ExternalLink, MapPin, Calendar, Clock, BookOpen, Film, Gamepad2, AlertCircle } from 'lucide-react';

export default function DetailModal({ item, onClose }) {
  if (!item) return null;

  const getCategoryName = (category) => {
    switch (category) {
      case 'makan': return 'Tempat Makan 🍽️';
      case 'wisata': return 'Tempat Wisata 🌍';
      case 'roblox': return 'Roblox Game 🎮';
      case 'komik': return 'Daftar Komik 📚';
      case 'film': return 'Daftar Film 🎬';
      default: return 'Detail Item';
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
          {item.image ? (
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
