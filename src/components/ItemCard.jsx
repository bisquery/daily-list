import React from 'react';
import { Edit2, Trash2, MapPin, Gamepad2, BookOpen, Film, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';

export default function ItemCard({ item, onToggleStatus, onEdit, onDelete, onClick }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'makan': return '🍽️';
      case 'wisata': return '🌍';
      case 'roblox': return '🎮';
      case 'komik': return '📚';
      case 'film': return '🎬';
      default: return '📁';
    }
  };

  const getMetaDisplay = () => {
    switch (item.category) {
      case 'makan':
      case 'wisata':
        return item.address ? (
          <div className="item-meta-item">
            <MapPin size={12} />
            <span>{item.address}</span>
          </div>
        ) : null;
      case 'roblox':
        return (
          <div className="item-meta-item">
            <Gamepad2 size={12} />
            <span>Roblox Game</span>
          </div>
        );
      case 'komik':
        return (
          <div className="item-meta-item">
            <BookOpen size={12} />
            <span>Komik</span>
          </div>
        );
      case 'film':
        return (
          <div className="item-meta-item">
            <Film size={12} />
            <span>{item.releaseYear ? `Tahun ${item.releaseYear}` : 'Film'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formattedDate = item.createdAt 
    ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="item-card">
      <div className="item-image-wrapper" onClick={onClick}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
        ) : (
          <div className="item-image-placeholder">
            <ImageIcon size={32} />
            <span>Tidak ada gambar</span>
          </div>
        )}
        <div className={`item-status-badge ${item.status === 'sudah' ? 'status-sudah' : 'status-belum'}`}>
          {item.status === 'sudah' ? <CheckCircle size={12} /> : <Clock size={12} />}
          <span>{item.status === 'sudah' ? 'Sudah / Arsip' : 'Belum'}</span>
        </div>
      </div>

      <div className="item-info">
        <div className="item-header">
          <h3 className="item-name" onClick={onClick}>
            {getCategoryIcon(item.category)} {item.name}
          </h3>
        </div>

        <div className="item-meta">
          {getMetaDisplay()}
          {formattedDate && (
            <div className="item-meta-item" style={{ marginLeft: 'auto' }}>
              <Clock size={12} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {item.note && <p className="item-note">{item.note}</p>}

        <div className="item-actions">
          <label className="toggle-archive" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={item.status === 'sudah'}
              onChange={() => onToggleStatus(item)}
            />
            <span>Tandai Sudah</span>
          </label>

          <div className="card-action-btns" onClick={(e) => e.stopPropagation()}>
            <button className="action-btn edit" onClick={() => onEdit(item)} title="Edit Item">
              <Edit2 size={14} />
            </button>
            <button className="action-btn delete" onClick={() => onDelete(item.id)} title="Hapus Item">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
