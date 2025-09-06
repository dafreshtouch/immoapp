import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnits } from '../hooks/useUnits';
import { useProjects } from '../hooks/useProjects';
import { ArrowLeft, Home, Bed, Bath, Compass, Euro, MapPin, Calendar, Edit, Image, FileText, Plus, Building2 } from 'lucide-react';
import { UnitEditModal } from '../components/UnitEditModal';
import './UnitDetail.css';

const UnitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { units, loading: unitsLoading } = useUnits();
  const { projects, loading: projectsLoading } = useProjects();
  
  const [unit, setUnit] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'documents' | 'history'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id && units.length > 0) {
      const foundUnit = units.find(u => u.id === id);
      setUnit(foundUnit);
      
      if (foundUnit && projects.length > 0) {
        const foundProject = projects.find(p => p.id === foundUnit.projectId);
        setProject(foundProject);
      }
    }
  }, [id, units, projects]);

  if (unitsLoading || projectsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de l'unité...</p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="error-container">
        <p>Unité non trouvée</p>
        <button onClick={() => navigate('/projets')} className="btn-primary">
          Retour aux projets
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'reserved': return 'status-reserved';
      case 'sold': return 'status-sold';
      case 'rented': return 'status-rented';
      default: return 'status-default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Réservé';
      case 'sold': return 'Vendu';
      case 'rented': return 'Loué';
      default: return status;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new': return 'Neuf';
      case 'excellent': return 'Excellent';
      case 'good': return 'Bon';
      case 'to_renovate': return 'À rénover';
      case 'to_demolish': return 'À démolir';
      default: return condition;
    }
  };

  const getOrientationLabel = (orientation: string) => {
    switch (orientation) {
      case 'north': return 'Nord';
      case 'south': return 'Sud';
      case 'east': return 'Est';
      case 'west': return 'Ouest';
      case 'north_south': return 'Nord-Sud';
      case 'east_west': return 'Est-Ouest';
      default: return orientation;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'commercial': return 'Commercial';
      case 'office': return 'Bureau';
      case 'retail': return 'Commerce';
      case 'storage': return 'Stockage';
      case 'parking': return 'Parking';
      case 'land': return 'Terrain';
      default: return type;
    }
  };

  return (
    <div className="unit-detail">
      {/* Header */}
      <div className="unit-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate(project ? `/projects/${project.id}` : '/projets')}
        >
          <ArrowLeft size={20} />
          {project ? `Retour au projet ${project.name}` : 'Retour aux projets'}
        </button>
        
        <div className="unit-title-section">
          <div className="unit-icon">
            <Home size={32} />
          </div>
          <div className="unit-title-info">
            <h1>{unit.name}</h1>
            {project && (
              <div className="unit-project">
                <Building2 size={16} />
                <span>{project.name}</span>
              </div>
            )}
            <div className="unit-location">
              <MapPin size={16} />
              <span>{project?.address}, {project?.city}</span>
            </div>
            <div className="unit-status">
              <span className={`status-badge ${getStatusColor(unit.availability)}`}>
                {getStatusLabel(unit.availability)}
              </span>
            </div>
          </div>
        </div>

        <div className="unit-actions">
          <button 
            className="btn-secondary"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit size={16} />
            Modifier
          </button>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="unit-main-info">
        <div className="price-card">
          <div className="price-main">
            <Euro size={24} />
            <div className="price-content">
              <div className="price-value">{unit.price.toLocaleString()}€</div>
              {unit.pricePerSqm && (
                <div className="price-per-sqm">{unit.pricePerSqm.toLocaleString()}€/m²</div>
              )}
            </div>
          </div>
        </div>

        <div className="specs-card">
          <div className="specs-grid">
            <div className="spec-item">
              <Home size={20} />
              <div className="spec-content">
                <div className="spec-value">{unit.surface}m²</div>
                <div className="spec-label">Surface</div>
              </div>
            </div>
            <div className="spec-item">
              <Bed size={20} />
              <div className="spec-content">
                <div className="spec-value">{unit.rooms}</div>
                <div className="spec-label">Pièces</div>
              </div>
            </div>
            {unit.bedrooms && (
              <div className="spec-item">
                <div className="spec-content">
                  <div className="spec-value">{unit.bedrooms}</div>
                  <div className="spec-label">Chambres</div>
                </div>
              </div>
            )}
            {unit.bathrooms && (
              <div className="spec-item">
                <Bath size={20} />
                <div className="spec-content">
                  <div className="spec-value">{unit.bathrooms}</div>
                  <div className="spec-label">Salles de bain</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="unit-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Image size={16} />
          Galerie
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          Documents
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Calendar size={16} />
          Historique
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-section">
                <h3>Description</h3>
                <p>{unit.description || 'Aucune description disponible.'}</p>
                
                <h3>Caractéristiques détaillées</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Type de bien</label>
                    <span>{getTypeLabel(unit.type)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Surface habitable</label>
                    <span>{unit.surface}m²</span>
                  </div>
                  <div className="detail-item">
                    <label>Nombre de pièces</label>
                    <span>{unit.rooms}</span>
                  </div>
                  {unit.bedrooms && (
                    <div className="detail-item">
                      <label>Chambres</label>
                      <span>{unit.bedrooms}</span>
                    </div>
                  )}
                  {unit.bathrooms && (
                    <div className="detail-item">
                      <label>Salles de bain</label>
                      <span>{unit.bathrooms}</span>
                    </div>
                  )}
                  {unit.floor !== undefined && (
                    <div className="detail-item">
                      <label>Étage</label>
                      <span>{unit.floor === 0 ? 'Rez-de-chaussée' : `${unit.floor}e étage`}</span>
                    </div>
                  )}
                  {unit.orientation && (
                    <div className="detail-item">
                      <label>Orientation</label>
                      <span>{getOrientationLabel(unit.orientation)}</span>
                    </div>
                  )}
                  {unit.condition && (
                    <div className="detail-item">
                      <label>État du bien</label>
                      <span>{getConditionLabel(unit.condition)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overview-section">
                <h3>Informations financières</h3>
                <div className="financial-info">
                  <div className="financial-item">
                    <label>Prix de vente</label>
                    <span className="price-highlight">{unit.price.toLocaleString()}€</span>
                  </div>
                  {unit.pricePerSqm && (
                    <div className="financial-item">
                      <label>Prix au m²</label>
                      <span>{unit.pricePerSqm.toLocaleString()}€/m²</span>
                    </div>
                  )}
                  <div className="financial-item">
                    <label>Statut</label>
                    <span className={`status-badge ${getStatusColor(unit.availability)}`}>
                      {getStatusLabel(unit.availability)}
                    </span>
                  </div>
                </div>

                <h3>Dates importantes</h3>
                <div className="dates-info">
                  <div className="date-item">
                    <label>Créé le</label>
                    <span>{unit.createdAt ? new Date(unit.createdAt).toLocaleDateString() : 'Non défini'}</span>
                  </div>
                  <div className="date-item">
                    <label>Dernière modification</label>
                    <span>{unit.updatedAt ? new Date(unit.updatedAt).toLocaleDateString() : 'Non défini'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-content">
            <div className="gallery-placeholder">
              <Image size={48} />
              <h3>Galerie photos</h3>
              <p>Aucune image disponible pour cette unité.</p>
              <button className="btn-primary">
                <Plus size={16} />
                Ajouter des photos
              </button>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-content">
            <div className="documents-placeholder">
              <FileText size={48} />
              <h3>Documents de l'unité</h3>
              <p>Aucun document disponible pour cette unité.</p>
              <button className="btn-primary">
                <Plus size={16} />
                Ajouter des documents
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-content">
            <div className="history-placeholder">
              <Calendar size={48} />
              <h3>Historique des modifications</h3>
              <p>Aucun historique disponible pour cette unité.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <UnitEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          unit={unit}
          onSave={(updatedUnit) => {
            setUnit(updatedUnit);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default UnitDetail;
