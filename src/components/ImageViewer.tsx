import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import './ImageViewer.css';

interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  fileType: 'image' | 'video' | 'document';
  uploadDate: Date;
  description?: string;
}

interface ImageViewerProps {
  images: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageViewer({ images, currentIndex, isOpen, onClose, onNavigate }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];

  // Réinitialiser les transformations lors du changement d'image
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Gestion des raccourcis clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < images.length - 1) {
          onNavigate(currentIndex + 1);
        }
        break;
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + 0.25, 3));
        break;
      case '-':
        setZoom(prev => Math.max(prev - 0.25, 0.25));
        break;
      case '0':
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
        break;
    }
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Gestion du zoom avec la molette
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  // Gestion du drag pour déplacer l'image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Navigation
  const goToPrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  // Actions
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentImage.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header avec informations et contrôles */}
        <div className="image-viewer-header">
          <div className="image-info">
            <h3>{currentImage.name}</h3>
            <span className="image-counter">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          
          <div className="image-controls">
            <button onClick={handleZoomOut} title="Zoom arrière (-)">
              <ZoomOut size={20} />
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} title="Zoom avant (+)">
              <ZoomIn size={20} />
            </button>
            <button onClick={handleRotate} title="Rotation">
              <RotateCw size={20} />
            </button>
            <button onClick={handleDownload} title="Télécharger">
              <Download size={20} />
            </button>
            <button onClick={handleReset} title="Réinitialiser (0)">
              Réinitialiser
            </button>
            <button onClick={onClose} className="close-btn" title="Fermer (Échap)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        {currentIndex > 0 && (
          <button 
            className="nav-btn nav-prev" 
            onClick={goToPrevious}
            title="Image précédente (←)"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button 
            className="nav-btn nav-next" 
            onClick={goToNext}
            title="Image suivante (→)"
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Image principale */}
        <div 
          className="image-viewer-content"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            src={currentImage.url}
            alt={currentImage.name}
            className="viewer-image"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            draggable={false}
          />
        </div>

        {/* Métadonnées */}
        <div className="image-viewer-footer">
          <div className="image-metadata">
            <span className="metadata-item">Type: {currentImage.type}</span>
            <span className="metadata-item">
              Date: {currentImage.uploadDate.toLocaleDateString('fr-FR')}
            </span>
            {currentImage.description && (
              <span className="metadata-item">
                Description: {currentImage.description}
              </span>
            )}
          </div>
          
          <div className="keyboard-shortcuts">
            <small>
              Raccourcis: ← → (navigation) | + - (zoom) | 0 (réinitialiser) | Échap (fermer)
            </small>
          </div>
        </div>

        {/* Miniatures */}
        <div className="image-thumbnails">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onNavigate(index)}
            >
              <img src={image.url} alt={image.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
