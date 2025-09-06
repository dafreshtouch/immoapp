import React, { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Info, Image, Building2, Home } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProjects } from '../hooks/useProjects';
import { useUnits } from '../hooks/useUnits';
import { generateTimeSlots } from '../utils/timeSlots';
import './EventModal.css';

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  color?: string;
  category?: string;
  projectId?: string;
  unitId?: string;
  location?: string;
  additionalInfo?: string;
  cost?: number;
  images?: string[];
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  selectedDate: string;
}

export function EventModal({ isOpen, onClose, onSave, selectedDate }: EventModalProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { projects } = useProjects();
  const { units, getUnitsByProject } = useUnits();

  const [formData, setFormData] = useState({
    title: '',
    time: '',
    startTime: '',
    endTime: '',
    description: '',
    color: '#007bff',
    category: '',
    projectId: '',
    unitId: '',
    location: '',
    additionalInfo: '',
    cost: '',
    images: [] as string[]
  });
  
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  // Update available units when project changes
  useEffect(() => {
    if (formData.projectId) {
      const projectUnits = getUnitsByProject(formData.projectId);
      setAvailableUnits(projectUnits);
    } else {
      setAvailableUnits([]);
    }
  }, [formData.projectId]);

  // Handle project change separately to avoid infinite loop
  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      projectId,
      unitId: '' // Reset unit when project changes
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const eventData = {
      title: formData.title.trim(),
      date: selectedDate,
      ...(formData.time && { time: formData.time }),
      ...(formData.startTime && { startTime: formData.startTime }),
      ...(formData.endTime && { endTime: formData.endTime }),
      ...(formData.description.trim() && { description: formData.description.trim() }),
      color: formData.color,
      ...(formData.category && { category: formData.category }),
      ...(formData.projectId && { projectId: formData.projectId }),
      ...(formData.unitId && { unitId: formData.unitId }),
      ...(formData.location.trim() && { location: formData.location.trim() }),
      ...(formData.additionalInfo.trim() && { additionalInfo: formData.additionalInfo.trim() }),
      ...(formData.cost && { cost: parseFloat(formData.cost) }),
      ...(formData.images.length > 0 && { images: formData.images })
    };

    onSave(eventData);

    // Reset form
    setFormData({
      title: '',
      time: '',
      startTime: '',
      endTime: '',
      description: '',
      color: '#007bff',
      category: '',
      projectId: '',
      unitId: '',
      location: '',
      additionalInfo: '',
      cost: '',
      images: [] as string[]
    });
    setAvailableUnits([]);
    onClose();
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxFiles = Math.min(files.length, 3 - formData.images.length);
    const filesToProcess = Array.from(files).slice(0, maxFiles);
    
    try {
      const newImages = await Promise.all(
        filesToProcess.map(async (file) => {
          // Check file size and compress if needed
          if (file.size > 500000) { // 500KB
            return await compressImage(file, 600, 0.6);
          } else {
            return await compressImage(file, 800, 0.8);
          }
        })
      );

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Erreur lors du traitement des images. Veuillez réessayer avec des images plus petites.');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvel événement</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="selected-date">{formatDate(selectedDate)}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group half-width">
              <label htmlFor="title">Titre *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nom de l'événement"
                required
                autoFocus
              />
            </div>

            <div className="form-group quarter-width">
              <label htmlFor="startTime">Heure début</label>
              <select
                id="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="form-select"
              >
                <option value="">--:--</option>
                {generateTimeSlots().map(timeString => (
                  <option key={timeString} value={timeString}>
                    {timeString}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group quarter-width">
              <label htmlFor="endTime">Heure fin</label>
              <select
                id="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="form-select"
              >
                <option value="">--:--</option>
                {generateTimeSlots().map(timeString => (
                  <option key={timeString} value={timeString}>
                    {timeString}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group quarter-width">
              <label htmlFor="category">Catégorie</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="form-select"
                disabled={categoriesLoading}
              >
                <option value="">Sélectionner une catégorie</option>
                {categoriesLoading ? (
                  <option disabled>Chargement...</option>
                ) : categories && categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category.id} value={category.value}>
                      {category.icon} {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Aucune catégorie disponible</option>
                )}
              </select>
            </div>

            <div className="form-group half-width">
              <label htmlFor="projectId">
                <Building2 size={16} style={{ marginRight: '4px' }} />
                Projet immobilier
              </label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="form-select"
              >
                <option value="">Sélectionner un projet (optionnel)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.address}
                  </option>
                ))}
              </select>
            </div>

            {formData.projectId && availableUnits.length > 0 && (
              <div className="form-group half-width">
                <label htmlFor="unitId">
                  <Home size={16} style={{ marginRight: '4px' }} />
                  Unité
                </label>
                <select
                  id="unitId"
                  value={formData.unitId}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Sélectionner une unité (optionnel)</option>
                  {availableUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} - {unit.surface}m² - {unit.price.toLocaleString()}€
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group quarter-width">
              <label htmlFor="location">
                <MapPin size={16} style={{ marginRight: '4px' }} />
                Lieu
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Lieu de l'événement (optionnel)"
              />
            </div>

            <div className="form-group quarter-width">
              <label htmlFor="cost">
                <DollarSign size={16} style={{ marginRight: '4px' }} />
                Coût
              </label>
              <input
                type="number"
                step="0.01"
                id="cost"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="Coût en € (optionnel)"
              />
            </div>

            <div className="form-group half-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'événement (optionnel)"
                rows={3}
              />
            </div>

            <div className="form-group half-width">
              <label htmlFor="additionalInfo">
                <Info size={16} style={{ marginRight: '4px' }} />
                Informations complémentaires
              </label>
              <textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                placeholder="Informations complémentaires (optionnel)"
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label>
                <Image size={16} style={{ marginRight: '4px' }} />
                Images ({formData.images.length}/3)
              </label>
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {formData.images.map((image, index) => (
                    <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <img 
                        src={image} 
                        alt={`Image ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          borderRadius: '6px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {formData.images.length < 3 && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="color">Couleur</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color,
                        border: formData.color === color ? '2px solid #000' : '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="button">
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
