import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProjects, Project } from '../hooks/useProjects';
import { useUnits, Unit } from '../hooks/useUnits';
import { Building2, MapPin, Plus, Eye, Edit, Trash2, Home, Euro } from 'lucide-react';
import './Projets.css';

interface LocalProject extends Project {
  units: Unit[];
  availableUnits: number;
}

const Projets: React.FC = () => {
  const { user } = useAuth();
  const { projects: firebaseProjects, loading, error, addProject, updateProject, deleteProject } = useProjects();
  const { units, addUnit, updateUnit, deleteUnit, fetchUnits } = useUnits();
  
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({});
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);

  const resetNewUnit = () => {
    setNewUnit({
      name: '',
      type: 'apartment',
      surface: 0,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      floor: 1,
      price: 0,
      description: '',
      images: [],
      documents: [],
      availability: 'available'
    });
  };

  // Sync Firebase projects with local state and fetch units
  useEffect(() => {
    const syncedProjects: LocalProject[] = firebaseProjects.map(project => ({
      ...project,
      units: units.filter(unit => unit.projectId === project.id),
      availableUnits: units.filter(unit => unit.projectId === project.id && unit.availability === 'available').length
    }));
    setProjects(syncedProjects);
  }, [firebaseProjects, units]);

  // Fetch units when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchUnits(selectedProjectId);
    }
  }, [selectedProjectId, fetchUnits]);

  const handleCreateUnit = (projectId: string) => {
    setSelectedProjectId(projectId);
    resetNewUnit();
    setNewUnit(prev => ({ ...prev, projectId }));
    setIsUnitModalOpen(true);
    setIsEditingUnit(false);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsUnitModalOpen(true);
    setIsEditingUnit(true);
  };

  const handleSaveUnit = async () => {
    if (!user) return;

    try {
      if (isEditingUnit && editingUnit) {
        await updateUnit(editingUnit.id, editingUnit);
      } else if (newUnit.name && newUnit.surface && newUnit.price && selectedProjectId) {
        await addUnit({
          ...newUnit,
          projectId: selectedProjectId,
          name: newUnit.name,
          surface: newUnit.surface,
          price: newUnit.price,
          images: newUnit.images || [],
          documents: newUnit.documents || []
        } as Omit<Unit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      }
      
      setIsUnitModalOpen(false);
      setIsEditingUnit(false);
      setEditingUnit(null);
      resetNewUnit();
      
      // Refresh units for the current project
      if (selectedProjectId) {
        fetchUnits(selectedProjectId);
      }
    } catch (error) {
      console.error('Error saving unit:', error);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!user) return;
    
    try {
      await deleteUnit(unitId);
      // Refresh units for the current project
      if (selectedProjectId) {
        fetchUnits(selectedProjectId);
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProjectList = () => (
    <div className="projects-grid">
      {projects.map((project) => (
        <div key={project.id} className="project-card">
          <div className="project-header">
            <div className="project-icon">
              <Building2 size={24} />
            </div>
            <div className="project-info">
              <h3>{project.name}</h3>
              <p className="project-location">
                <MapPin size={16} />
                {project.address}, {project.city}
              </p>
            </div>
          </div>

          <div className="project-stats">
            <div className="stat">
              <span className="stat-value">{project.units.length}</span>
              <span className="stat-label">Unités totales</span>
            </div>
            <div className="stat">
              <span className="stat-value">{project.availableUnits}</span>
              <span className="stat-label">Disponibles</span>
            </div>
            <div className="stat">
              <span className="stat-value">{project.totalValue?.toLocaleString() || 0}€</span>
              <span className="stat-label">Valeur totale</span>
            </div>
          </div>

          <div className="project-units">
            <h4>Unités récentes</h4>
            {project.units.slice(0, 3).map((unit) => (
              <div key={unit.id} className="unit-preview">
                <span className="unit-name">{unit.name}</span>
                <span className={`unit-status ${getStatusColor(unit.availability)}`}>
                  {unit.availability === 'available' ? 'Disponible' :
                   unit.availability === 'reserved' ? 'Réservé' :
                   unit.availability === 'sold' ? 'Vendu' : 'Loué'}
                </span>
                <span className="unit-price">{unit.price.toLocaleString()}€</span>
              </div>
            ))}
          </div>

          <div className="project-actions">
            <button
              className="btn-secondary"
              onClick={() => handleCreateUnit(project.id)}
            >
              <Plus size={16} />
              Ajouter unité
            </button>
            <button
              className="btn-primary"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <Eye size={16} />
              Voir détails
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUnitsView = () => {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (!selectedProject) return null;

    return (
      <div className="units-view">
        <div className="units-header">
          <button
            className="btn-back"
            onClick={() => setSelectedProjectId('')}
          >
            ← Retour aux projets
          </button>
          <h2>{selectedProject.name} - Unités</h2>
          <button
            className="btn-primary"
            onClick={() => handleCreateUnit(selectedProjectId)}
          >
            <Plus size={16} />
            Nouvelle unité
          </button>
        </div>

        <div className="units-grid">
          {selectedProject.units.map((unit) => (
            <div key={unit.id} className="unit-card">
              <div className="unit-header">
                <h3>{unit.name}</h3>
                <span className={`unit-status ${getStatusColor(unit.availability)}`}>
                  {unit.availability === 'available' ? 'Disponible' :
                   unit.availability === 'reserved' ? 'Réservé' :
                   unit.availability === 'sold' ? 'Vendu' : 'Loué'}
                </span>
              </div>

              <div className="unit-details">
                <div className="detail">
                  <Home size={16} />
                  <span>{unit.surface}m² • {unit.rooms} pièces</span>
                </div>
                <div className="detail">
                  <Euro size={16} />
                  <span>{unit.price.toLocaleString()}€</span>
                </div>
                {unit.pricePerSqm && (
                  <div className="detail">
                    <span>{unit.pricePerSqm.toLocaleString()}€/m²</span>
                  </div>
                )}
              </div>

              {unit.description && (
                <p className="unit-description">
                  {unit.description.substring(0, 100)}...
                </p>
              )}

              <div className="unit-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleEditUnit(unit)}
                >
                  <Edit size={16} />
                  Modifier
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteUnit(unit.id)}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUnitModal = () => (
    <div className={`modal ${isUnitModalOpen ? 'show' : ''}`}>
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>{isEditingUnit ? 'Modifier l\'unité' : 'Nouvelle unité'}</h3>
          <button 
            className="modal-close"
            onClick={() => {
              setIsUnitModalOpen(false);
              setIsEditingUnit(false);
              setEditingUnit(null);
              resetNewUnit();
            }}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Nom de l'unité *</label>
              <input
                type="text"
                value={isEditingUnit ? editingUnit?.name || '' : newUnit.name || ''}
                onChange={(e) => {
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, name: e.target.value });
                  } else {
                    setNewUnit(prev => ({ ...prev, name: e.target.value }));
                  }
                }}
                placeholder="Ex: Appartement A1"
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={isEditingUnit ? editingUnit?.type || 'apartment' : newUnit.type || 'apartment'}
                onChange={(e) => {
                  const value = e.target.value as Unit['type'];
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, type: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, type: value }));
                  }
                }}
              >
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="commercial">Commercial</option>
                <option value="office">Bureau</option>
                <option value="retail">Commerce</option>
                <option value="storage">Stockage</option>
                <option value="parking">Parking</option>
                <option value="land">Terrain</option>
              </select>
            </div>

            <div className="form-group">
              <label>Surface (m²) *</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.surface || 0 : newUnit.surface || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, surface: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, surface: value }));
                  }
                }}
                min="0"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label>Prix (€) *</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.price || 0 : newUnit.price || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, price: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, price: value }));
                  }
                }}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre de pièces</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.rooms || 1 : newUnit.rooms || 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, rooms: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, rooms: value }));
                  }
                }}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Chambres</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.bedrooms || 1 : newUnit.bedrooms || 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, bedrooms: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, bedrooms: value }));
                  }
                }}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Salles de bain</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.bathrooms || 1 : newUnit.bathrooms || 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, bathrooms: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, bathrooms: value }));
                  }
                }}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Étage</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.floor || 0 : newUnit.floor || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, floor: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, floor: value }));
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label>Disponibilité *</label>
              <select
                value={isEditingUnit ? editingUnit?.availability || 'available' : newUnit.availability || 'available'}
                onChange={(e) => {
                  const value = e.target.value as Unit['availability'];
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, availability: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, availability: value }));
                  }
                }}
              >
                <option value="available">Disponible</option>
                <option value="reserved">Réservé</option>
                <option value="sold">Vendu</option>
                <option value="rented">Loué</option>
              </select>
            </div>

            <div className="form-group">
              <label>État</label>
              <select
                value={isEditingUnit ? editingUnit?.condition || 'good' : newUnit.condition || 'good'}
                onChange={(e) => {
                  const value = e.target.value as Unit['condition'];
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, condition: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, condition: value }));
                  }
                }}
              >
                <option value="new">Neuf</option>
                <option value="excellent">Excellent</option>
                <option value="good">Bon</option>
                <option value="to_renovate">À rénover</option>
                <option value="to_demolish">À démolir</option>
              </select>
            </div>

            <div className="form-group">
              <label>Orientation</label>
              <select
                value={isEditingUnit ? editingUnit?.orientation || 'south' : newUnit.orientation || 'south'}
                onChange={(e) => {
                  const value = e.target.value as Unit['orientation'];
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, orientation: value });
                  } else {
                    setNewUnit(prev => ({ ...prev, orientation: value }));
                  }
                }}
              >
                <option value="north">Nord</option>
                <option value="south">Sud</option>
                <option value="east">Est</option>
                <option value="west">Ouest</option>
                <option value="north_south">Nord-Sud</option>
                <option value="east_west">Est-Ouest</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={isEditingUnit ? editingUnit?.description || '' : newUnit.description || ''}
                onChange={(e) => {
                  if (isEditingUnit && editingUnit) {
                    setEditingUnit({ ...editingUnit, description: e.target.value });
                  } else {
                    setNewUnit(prev => ({ ...prev, description: e.target.value }));
                  }
                }}
                placeholder="Description détaillée du bien..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel"
            onClick={() => {
              setIsUnitModalOpen(false);
              setIsEditingUnit(false);
              setEditingUnit(null);
              resetNewUnit();
            }}
          >
            Annuler
          </button>
          <button 
            className="btn-primary"
            onClick={handleSaveUnit}
          >
            {isEditingUnit ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des projets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="projets-page">
      <div className="projets-header">
        <h1>Gestion des Projets Immobiliers</h1>
        <p>Gérez vos projets et leurs unités immobilières</p>
      </div>

      <div className="projets-content">
        {selectedProjectId ? renderUnitsView() : renderProjectList()}
      </div>

      {renderUnitModal()}
    </div>
  );
};

export default Projets;
