import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit2, Trash2, Save, Calendar, Clock, FileText, MapPin, DollarSign, Info, Image, Building2, Home } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProjects } from '../hooks/useProjects';
import { useUnits } from '../hooks/useUnits';
import { generateTimeSlots } from '../utils/timeSlots';
import './EventViewModal.css';

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

interface EventViewModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onUpdate: (eventId: string, updates: Partial<Event>) => void;
  onDelete: (eventId: string) => void;
}

export function EventViewModal({ 
  isOpen, 
  event, 
  onClose, 
  onUpdate, 
  onDelete 
}: EventViewModalProps) {
  const { categories } = useCategories();
  const { projects } = useProjects();
  const { units } = useUnits();
  
  const [isEditing, setIsEditing] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        time: event.time || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        description: event.description || '',
        color: event.color || '#007bff',
        category: event.category || '',
        projectId: event.projectId || '',
        unitId: event.unitId || '',
        location: event.location || '',
        additionalInfo: event.additionalInfo || '',
        cost: event.cost?.toString() || '',
        images: event.images || []
      });
      setErrors({});
      setIsEditing(false);
    }
  }, [event]);

  // Get available units for selected project
  const availableUnits = useCallback(() => {
    if (!formData.projectId) return [];
    return units.filter(unit => unit.projectId === formData.projectId);
  }, [formData.projectId, units]);

  if (!isOpen || !event) return null;

  // Reset unit when project changes
  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectId,
      unitId: '' // Reset unit when project changes
    }));
    // Clear unit error if it exists
    if (errors.unitId) {
      setErrors(prev => ({ ...prev, unitId: '' }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    
    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      newErrors.cost = 'Le coût doit être un nombre valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        title: formData.title.trim(),
        color: formData.color
      };
      
      // Only add fields that have actual values (not empty strings or undefined)
      if (formData.time && formData.time.trim()) {
        updateData.time = formData.time.trim();
      }
      if (formData.startTime && formData.startTime.trim()) {
        updateData.startTime = formData.startTime.trim();
      }
      if (formData.endTime && formData.endTime.trim()) {
        updateData.endTime = formData.endTime.trim();
      }
      if (formData.description && formData.description.trim()) {
        updateData.description = formData.description.trim();
      }
      if (formData.category && formData.category.trim()) {
        updateData.category = formData.category.trim();
      }
      if (formData.projectId && formData.projectId.trim()) {
        updateData.projectId = formData.projectId.trim();
      }
      if (formData.unitId && formData.unitId.trim()) {
        updateData.unitId = formData.unitId.trim();
      }
      if (formData.location && formData.location.trim()) {
        updateData.location = formData.location.trim();
      }
      if (formData.additionalInfo && formData.additionalInfo.trim()) {
        updateData.additionalInfo = formData.additionalInfo.trim();
      }
      if (formData.cost && formData.cost.trim() && !isNaN(parseFloat(formData.cost))) {
        updateData.cost = parseFloat(formData.cost);
      }
      if (formData.images && formData.images.length > 0) {
        updateData.images = formData.images;
      }
      
      await onUpdate(event.id, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ general: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (event) {
      setFormData({
        title: event.title || '',
        time: event.time || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        description: event.description || '',
        color: event.color || '#007bff',
        category: event.category || '',
        projectId: event.projectId || '',
        unitId: event.unitId || '',
        location: event.location || '',
        additionalInfo: event.additionalInfo || '',
        cost: event.cost?.toString() || '',
        images: event.images || []
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? `${category.icon} ${category.name}` : categoryValue;
  };
  
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.name} - ${project.address}` : 'Projet introuvable';
  };
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? `${unit.name} - ${unit.surface}m² - ${unit.price.toLocaleString()}€` : 'Unité introuvable';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const remainingSlots = 3 - formData.images.length;
    if (remainingSlots <= 0) return;
    
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImages: string[] = [];
    let processedCount = 0;
    
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, images: 'Les images doivent faire moins de 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          processedCount++;
          
          if (processedCount === filesToProcess.length) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...newImages]
            }));
            setErrors(prev => ({ ...prev, images: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <h2>{isEditing ? 'Modifier l\'événement' : 'Détails de l\'événement'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="event-modal-body">
          <div className="event-content-layout">
            <div className="event-fields-section">
              <div className="event-field">
                <div className="field-label">
                  <FileText size={16} />
                  <span>Titre</span>
                </div>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`edit-input ${errors.title ? 'error' : ''}`}
                      placeholder="Titre de l'événement"
                    />
                    {errors.title && <div className="error-message">{errors.title}</div>}
                  </>
                ) : (
                  <div className="field-value">{event.title}</div>
                )}
              </div>

          <div className="event-field">
            <div className="field-label">
              <Calendar size={16} />
              <span>Date</span>
            </div>
            <div className="field-value">{formatDate(event.date)}</div>
          </div>

          <div className="event-field">
            <div className="field-label">
              <Clock size={16} />
              <span>Heure début</span>
            </div>
            {isEditing ? (
              <select
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="edit-input"
              >
                <option value="">--:--</option>
                {generateTimeSlots().map(timeString => (
                  <option key={timeString} value={timeString}>
                    {timeString}
                  </option>
                ))}
              </select>
            ) : (
              <div className="field-value">{event.startTime || 'Non spécifiée'}</div>
            )}
          </div>

          <div className="event-field">
            <div className="field-label">
              <Clock size={16} />
              <span>Heure fin</span>
            </div>
            {isEditing ? (
              <select
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="edit-input"
              >
                <option value="">--:--</option>
                {generateTimeSlots().map(timeString => (
                  <option key={timeString} value={timeString}>
                    {timeString}
                  </option>
                ))}
              </select>
            ) : (
              <div className="field-value">{event.endTime || 'Non spécifiée'}</div>
            )}
          </div>

          <div className="event-field">
            <div className="field-label">
              <MapPin size={16} />
              <span>Lieu</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="edit-input"
                placeholder="Lieu de l'événement"
              />
            ) : (
              <div className="field-value">{event.location || 'Non spécifié'}</div>
            )}
          </div>

          <div className="event-field">
            <div className="field-label">
              <FileText size={16} />
              <span>Catégorie</span>
            </div>
            {isEditing ? (
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="edit-input"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.value}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="field-value">
                {event.category ? getCategoryLabel(event.category) : 'Aucune catégorie'}
              </div>
            )}
          </div>

          <div className="event-field">
            <div className="field-label">
              <Building2 size={16} />
              <span>Projet immobilier</span>
            </div>
            {isEditing ? (
              <select
                value={formData.projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="edit-input"
              >
                <option value="">Sélectionner un projet (optionnel)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.address}
                  </option>
                ))}
              </select>
            ) : (
              <div className="field-value">
                {event.projectId ? getProjectName(event.projectId) : 'Aucun projet sélectionné'}
              </div>
            )}
          </div>

          <div className="event-field">
            <div className="field-label">
              <Home size={16} />
              <span>Unité</span>
            </div>
            {isEditing ? (
              <select
                value={formData.unitId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                className="edit-input"
                disabled={!formData.projectId}
              >
                <option value="">Sélectionner une unité (optionnel)</option>
                {availableUnits().length > 0 ? (
                  availableUnits().map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} - {unit.surface}m² - {unit.price.toLocaleString()}€
                    </option>
                  ))
                ) : (
                  <option disabled>Aucune unité disponible</option>
                )}
              </select>
            ) : (
              <div className="field-value">
                {event.unitId ? getUnitName(event.unitId) : 'Aucune unité sélectionnée'}
              </div>
            )}
          </div>

          <div className="event-field">
            <div className="field-label">
              <DollarSign size={16} />
              <span>Coût</span>
            </div>
            {isEditing ? (
              <>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className={`edit-input ${errors.cost ? 'error' : ''}`}
                  placeholder="Coût en €"
                />
                {errors.cost && <div className="error-message">{errors.cost}</div>}
              </>
            ) : (
              <div className="field-value">{event.cost ? `${event.cost} €` : 'Non spécifié'}</div>
            )}
          </div>

          <div className="event-field half-width">
            <div className="field-label">
              <FileText size={16} />
              <span>Description</span>
            </div>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="edit-textarea"
                placeholder="Description de l'événement"
                rows={3}
              />
            ) : (
              <div className="field-value">{event.description || 'Aucune description'}</div>
            )}
          </div>

          <div className="event-field half-width">
            <div className="field-label">
              <Info size={16} />
              <span>Informations complémentaires</span>
            </div>
            {isEditing ? (
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                className="edit-textarea"
                placeholder="Informations complémentaires"
                rows={3}
              />
            ) : (
              <div className="field-value">{event.additionalInfo || 'Aucune information complémentaire'}</div>
            )}
          </div>

              <div className="event-field">
                <div className="field-label">
                  <div style={{ width: '16px', height: '16px', backgroundColor: event.color || '#007bff', borderRadius: '3px' }}></div>
                  <span>Couleur</span>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
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
                ) : (
                  <div className="field-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: event.color || '#007bff', borderRadius: '4px' }}></div>
                    {event.color || '#007bff'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="event-images-section">
              <div className="images-header">
                <div className="field-label">
                  <Image size={16} />
                  <span>Images ({event.images?.length || 0}/3)</span>
                </div>
                {isEditing && formData.images.length < 3 && (
                  <label className="add-image-btn">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    + Ajouter
                  </label>
                )}
              </div>
              
              <div className="images-container">
                {(isEditing ? formData.images : event.images || []).map((image: string, index: number) => (
                  <div key={index} className="image-item">
                    <img 
                      src={image} 
                      alt={`Image ${index + 1}`}
                      className="event-image"
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {(!event.images || event.images.length === 0) && !isEditing && (
                  <div className="no-images">Aucune image</div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="event-modal-actions">
          {isEditing ? (
            <>
              {errors.general && <div className="error-message general-error">{errors.general}</div>}
              <button className="btn-cancel" onClick={handleCancel} disabled={loading}>
                Annuler
              </button>
              <button className="btn-save" onClick={handleSave} disabled={loading}>
                <Save size={16} />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </>
          ) : (
            <>
              <button className="btn-delete" onClick={handleDelete}>
                <Trash2 size={16} />
                Supprimer
              </button>
              <button className="btn-edit" onClick={handleEdit}>
                <Edit2 size={16} />
                Modifier
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
