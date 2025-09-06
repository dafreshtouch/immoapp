import React, { useState, useRef } from 'react';
import { Upload, X, Link, Image } from 'lucide-react';
import { uploadProjectMainImage, uploadProjectGalleryImage, uploadUnitMainImage, uploadUnitGalleryImage } from '../utils/storage';
import './ImageUpload.css';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onRemove: () => void;
  placeholder?: string;
  projectId?: string;
  unitId?: string;
  isGallery?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  placeholder = "Ajouter une image",
  projectId,
  unitId,
  isGallery = false
}) => {
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        if (projectId) {
          // Upload to Firebase Storage for projects
          const downloadURL = isGallery 
            ? await uploadProjectGalleryImage(file, projectId)
            : await uploadProjectMainImage(file, projectId);
          onChange(downloadURL);
        } else if (unitId) {
          // Upload to Firebase Storage for units
          const downloadURL = isGallery 
            ? await uploadUnitGalleryImage(file, unitId)
            : await uploadUnitMainImage(file, unitId);
          onChange(downloadURL);
        } else {
          // Fallback to base64 for preview
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            onChange(result);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Erreur lors du téléchargement de l\'image');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setIsUrlMode(false);
    }
  };

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  if (value) {
    return (
      <div className="image-upload-preview">
        <img src={value} alt="Project" className="preview-image" />
        <button
          type="button"
          onClick={onRemove}
          className="remove-image-btn"
          title="Supprimer l'image"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="image-upload-container">
      {!isUrlMode ? (
        <div
          className={`image-upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <Image size={48} className="upload-icon" />
            <p className="upload-text">{placeholder}</p>
            <p className="upload-subtext">Glissez une image ou cliquez pour parcourir</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="url-input-container">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleUrlKeyPress}
            placeholder="https://exemple.com/image.jpg"
            className="url-input"
            autoFocus
          />
          <div className="url-actions">
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="url-submit-btn"
              disabled={!urlInput.trim()}
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUrlMode(false);
                setUrlInput('');
              }}
              className="url-cancel-btn"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="upload-options">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="upload-option-btn"
          title="Importer depuis l'ordinateur"
        >
          <Upload size={16} />
          Importer
        </button>
        <button
          type="button"
          onClick={() => setIsUrlMode(true)}
          className="upload-option-btn"
          title="Ajouter par URL"
        >
          <Link size={16} />
          URL
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
