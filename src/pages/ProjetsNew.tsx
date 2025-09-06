import React, { useState, useEffect } from 'react';
import { Plus, Building2, Home, MapPin, Calendar, Euro, Users, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProjects, Project as FirebaseProject } from '../hooks/useProjects';
import { useUnits, Unit as FirebaseUnit } from '../hooks/useUnits';
import './Projets.css';

// Utilisation du type Unit du hook useUnits
type Unit = FirebaseUnit;

// Extension du type Project Firebase avec les champs locaux
interface LocalProject extends FirebaseProject {
  units: Unit[];
  availableUnits: number;
}

type Project = LocalProject;

// Interface pour l'édition avec dates en string
interface EditingProject {
  id?: string;
  name?: string;
  type?: 'building' | 'house' | 'complex' | 'land';
  address?: string;
  city?: string;
  postalCode?: string;
  description?: string;
  totalUnits?: number;
  status?: 'planning' | 'construction' | 'completed' | 'sold';
  startDate?: string;
  endDate?: string;
  totalValue?: number;
  images?: string[];
  documents?: string[];
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
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, name: e.target.value } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, name: e.target.value }));
                  }
                }}
                placeholder="Ex: Appartement 3A"
                required
              />
            </div>

            <div className="form-group">
              <label>Type de bien *</label>
              <select
                value={isEditingUnit ? editingUnit?.type || 'apartment' : newUnit.type || 'apartment'}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, type: e.target.value as Unit['type'] } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, type: e.target.value as Unit['type'] }));
                  }
                }}
              >
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="commercial">Commercial</option>
                <option value="office">Bureau</option>
                <option value="retail">Commerce</option>
                <option value="parking">Parking</option>
                <option value="storage">Cave/Box</option>
                <option value="land">Terrain</option>
              </select>
            </div>

            <div className="form-group">
              <label>Surface (m²) *</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.surface || '' : newUnit.surface || ''}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, surface: Number(e.target.value) } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, surface: Number(e.target.value) }));
                  }
                }}
                placeholder="85"
                required
              />
            </div>

            <div className="form-group">
              <label>Prix (€) *</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.price || '' : newUnit.price || ''}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, price: Number(e.target.value) } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, price: Number(e.target.value) }));
                  }
                }}
                placeholder="250000"
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre de pièces</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.rooms || '' : newUnit.rooms || ''}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, rooms: Number(e.target.value) } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, rooms: Number(e.target.value) }));
                  }
                }}
                placeholder="3"
              />
            </div>

            <div className="form-group">
              <label>Chambres</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.bedrooms || '' : newUnit.bedrooms || ''}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, bedrooms: Number(e.target.value) } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, bedrooms: Number(e.target.value) }));
                  }
                }}
                placeholder="2"
              />
            </div>

            <div className="form-group">
              <label>Salles de bain</label>
              <input
                type="number"
                value={isEditingUnit ? editingUnit?.bathrooms || '' : newUnit.bathrooms || ''}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, bathrooms: Number(e.target.value) } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, bathrooms: Number(e.target.value) }));
                  }
                }}
                placeholder="1"
              />
            </div>

            <div className="form-group">
              <label>Disponibilité</label>
              <select
                value={isEditingUnit ? editingUnit?.availability || 'available' : newUnit.availability || 'available'}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, availability: e.target.value as Unit['availability'] } : null);
                  } else {
                    setNewUnit(prev => ({ ...prev, availability: e.target.value as Unit['availability'] }));
                  }
                }}
              >
                <option value="available">Disponible</option>
                <option value="reserved">Réservé</option>
                <option value="sold">Vendu</option>
                <option value="rented">Loué</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={isEditingUnit ? editingUnit?.description || '' : newUnit.description || ''}
                onChange={(e) => {
                  if (isEditingUnit) {
                    setEditingUnit(prev => prev ? { ...prev, description: e.target.value } : null);
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
      <div className="page-container">
        <div className="loading">Chargement des projets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Projets Immobiliers</h1>
        <div className="page-actions">
          <button className="btn-primary">
            <Plus size={20} />
            Nouveau Projet
          </button>
        </div>
      </div>

      {selectedProjectId ? renderUnitsView() : renderProjectList()}
      {renderUnitModal()}
    </div>
  );
};

export default Projets;
