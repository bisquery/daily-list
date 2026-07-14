import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Camera } from 'lucide-react';

export default function AddItemModal({ category, editItem, onClose, onSave }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [note, setNote] = useState('');
  
  // Category-specific fields
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [releaseYear, setReleaseYear] = useState('');

  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Initialize form if editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '');
      setImage(editItem.image || '');
      setNote(editItem.note || '');
      setAddress(editItem.address || '');
      setDescription(editItem.description || '');
      setLink(editItem.link || '');
      setSynopsis(editItem.synopsis || '');
      setReleaseYear(editItem.releaseYear || '');
    } else {
      // Clear form for new item
      setName('');
      setImage('');
      setNote('');
      setAddress('');
      setDescription('');
      setLink('');
      setSynopsis('');
      setReleaseYear('');
    }
    setErrorMsg('');
  }, [editItem, category]);

  // Handle Image upload and compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar');
      return;
    }

    setIsCompressing(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to quality compressed JPEG Base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImage(dataUrl);
        setIsCompressing(false);
      };
      img.onerror = () => {
        setErrorMsg('Gagal memuat gambar');
        setIsCompressing(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file');
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Nama item wajib diisi');
      return;
    }

    if (!image) {
      setErrorMsg('Gambar wajib diupload');
      return;
    }

    const payload = {
      name: name.trim(),
      image,
      note: note.trim(),
      category: editItem ? editItem.category : category,
      status: editItem ? editItem.status : 'belum', // 'belum' by default for new items
      createdAt: editItem ? editItem.createdAt : Date.now(),
      // Optional category-specific fields:
      address: ['makan', 'wisata'].includes(category) ? address.trim() : undefined,
      description: category === 'roblox' ? description.trim() : undefined,
      link: ['roblox', 'komik', 'film'].includes(category) ? link.trim() : undefined,
      synopsis: ['komik', 'film'].includes(category) ? synopsis.trim() : undefined,
      releaseYear: category === 'film' ? releaseYear.trim() : undefined,
    };

    onSave(payload);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editItem ? 'Edit Item' : 'Tambah Item Baru'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          {errorMsg && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Image Upload Area */}
          <div className="form-group">
            <label>Gambar Item *</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />

            {image ? (
              <div className="image-upload-area" style={{ borderStyle: 'solid' }}>
                <img src={image} alt="Preview" className="uploaded-preview" />
                <button type="button" className="remove-upload-btn" onClick={() => setImage('')} title="Hapus Gambar">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="image-upload-area" onClick={triggerFileInput}>
                {isCompressing ? (
                  <span className="upload-text">Memproses gambar...</span>
                ) : (
                  <>
                    <Camera className="upload-icon" />
                    <span className="upload-text">Ketuk untuk Ambil Foto / Upload</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Wajib diisi</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="item-name">Nama Item *</label>
            <input
              id="item-name"
              type="text"
              placeholder="Masukkan nama..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category-Specific Form Fields */}
          {['makan', 'wisata'].includes(category) && (
            <div className="form-group">
              <label htmlFor="item-address">Alamat Lengkap</label>
              <textarea
                id="item-address"
                placeholder="Masukkan alamat..."
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}

          {category === 'roblox' && (
            <>
              <div className="form-group">
                <label htmlFor="item-desc">Deskripsi Game</label>
                <textarea
                  id="item-desc"
                  placeholder="Deskripsi singkat..."
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="item-link">Link Game Roblox</label>
                <input
                  id="item-link"
                  type="url"
                  placeholder="https://www.roblox.com/games/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </>
          )}

          {category === 'komik' && (
            <>
              <div className="form-group">
                <label htmlFor="comic-synopsis">Sinopsis Komik</label>
                <textarea
                  id="comic-synopsis"
                  placeholder="Masukkan sinopsis komik..."
                  rows="3"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="comic-link">Link Baca Online</label>
                <input
                  id="comic-link"
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </>
          )}

          {category === 'film' && (
            <>
              <div className="form-group">
                <label htmlFor="movie-year">Tahun Rilis</label>
                <input
                  id="movie-year"
                  type="number"
                  placeholder="Contoh: 2024"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="movie-synopsis">Sinopsis Film</label>
                <textarea
                  id="movie-synopsis"
                  placeholder="Masukkan sinopsis film..."
                  rows="3"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="movie-link">Link Trailer Film</label>
                <input
                  id="movie-link"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Personal Note Field */}
          <div className="form-group">
            <label htmlFor="item-note">Catatan Pribadi (Opsional)</label>
            <textarea
              id="item-note"
              placeholder="Catatan atau coretan kecil..."
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="form-submit-btn" disabled={isCompressing}>
            {editItem ? 'Simpan Perubahan' : 'Tambah Ke Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
}
