import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjects, Project } from '../hooks/useProjects';
import { useUnits } from '../hooks/useUnits';
import ImageUpload from '../components/ImageUpload';
import { updateProjectMainImage } from '../utils/projectImages';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Euro, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  ArrowUpDown,
  X,
  Home,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle
} from 'lucide-react';
import './ProjectsNew.css';

interface ProjectStats {
  totalProjects: number;
  totalUnits: number;
  totalValue: number;
  availableUnits: number;
  occupancyRate: number;
}

interface ProjectWithStats extends Project {
  unitsCount: number;
  availableUnits: number;
  occupancyRate: number;
  totalValue: number;
  averagePrice: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'units' | 'value';

const ProjectsNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading: projectsLoading, addProject, updateProject, deleteProject } = useProjects();
  const { units, loading: unitsLoading } = useUnits();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form State
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    type: 'building' as Project['type'],
    address: '',
    city: '',
    postalCode: '',
    totalUnits: 0,
    budget: 0,
    startDate: '',
    endDate: '',
    mainImage: ''
  });


  // Calculate project statistics
  const projectsWithStats = useMemo((): ProjectWithStats[] => {
    return projects.map(project => {
      const projectUnits = units.filter(unit => unit.projectId === project.id);
      const availableUnits = projectUnits.filter(unit => unit.availability === 'available').length;
      const totalValue = projectUnits.reduce((sum, unit) => sum + (unit.price || 0), 0);
      const averagePrice = projectUnits.length > 0 ? totalValue / projectUnits.length : 0;
      const occupancyRate = projectUnits.length > 0 ? ((projectUnits.length - availableUnits) / projectUnits.length) * 100 : 0;

      return {
        ...project,
        unitsCount: projectUnits.length,
        availableUnits,
        occupancyRate,
        totalValue,
        averagePrice
      };
    });
  }, [projects, units]);

  // Calculate global statistics
  const globalStats = useMemo((): ProjectStats => {
    const totalUnits = units.length;
    const availableUnits = units.filter(unit => unit.availability === 'available').length;
    const totalValue = units.reduce((sum, unit) => sum + (unit.price || 0), 0);
    const occupancyRate = totalUnits > 0 ? ((totalUnits - availableUnits) / totalUnits) * 100 : 0;

    return {
      totalProjects: projects.length,
      totalUnits,
      totalValue,
      availableUnits,
      occupancyRate
    };
  }, [projects, units]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsWithStats;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = a.createdAt || new Date(0);
          bValue = b.createdAt || new Date(0);
          break;
        case 'units':
          aValue = a.unitsCount;
          bValue = b.unitsCount;
          break;
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projectsWithStats, searchTerm, sortBy, sortOrder]);

  // Handlers
  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
      type: 'building',
      address: '',
      city: '',
      postalCode: '',
      totalUnits: 0,
      budget: 0,
      startDate: '',
      endDate: '',
      mainImage: ''
    });
    setEditingProject(null);
  };

  const handleCreateProject = () => {
    resetProjectForm();
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    console.log('Editing project:', project);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      type: project.type || 'building',
      address: project.address || '',
      city: project.city || '',
      postalCode: project.postalCode || '',
      totalUnits: project.totalUnits || 0,
      budget: project.budget || 0,
      startDate: project.startDate ? (project.startDate instanceof Date ? project.startDate.toISOString().split('T')[0] : new Date(project.startDate).toISOString().split('T')[0]) : '',
      endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate.toISOString().split('T')[0] : new Date(project.endDate).toISOString().split('T')[0]) : '',
      mainImage: project.mainImage || ''
    });
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name.trim() || !projectForm.address.trim()) {
      alert('Veuillez remplir au moins le nom et l\'adresse du projet');
      return;
    }

    try {
      const projectData = {
        ...projectForm,
        status: 'planning' as Project['status'],
        startDate: projectForm.startDate ? new Date(projectForm.startDate) : undefined,
        endDate: projectForm.endDate ? new Date(projectForm.endDate) : undefined,
        totalValue: 0,
        images: [],
        documents: []
      };

      if (editingProject) {
        // Include mainImage in the project data for updates
        const updateData = {
          ...projectData,
          mainImage: projectForm.mainImage
        };
        
        await updateProject(editingProject.id, updateData);
      } else {
        // Include mainImage in the project data for new projects
        const newProjectData = {
          ...projectData,
          mainImage: projectForm.mainImage
        };
        
        await addProject(newProjectData);
      }

      setIsProjectModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde du projet');
    }
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };


  if (projectsLoading || unitsLoading) {
    return (
      <div className="projects-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des projets...</p>
      </div>
    );
  }


  return (
    <div className="projects-new">
      {/* Header */}
      <div className="projects-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Gestion des Projets</h1>
            <p>Gérez et suivez tous vos projets immobiliers</p>
          </div>
          <button 
          className="btn-primary"
          onClick={handleCreateProject}
        >
          <Plus size={20} />
          Nouveau projet
        </button>
        </div>

        {/* Global Statistics */}
        <div className="global-stats">
          <div className="stat-card">
            <div className="stat-icon projects">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{globalStats.totalProjects}</span>
              <span className="stat-label">Projets</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon units">
              <Home size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{globalStats.totalUnits}</span>
              <span className="stat-label">Unités totales</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon available">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{globalStats.availableUnits}</span>
              <span className="stat-label">Disponibles</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon value">
              <Euro size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{(globalStats.totalValue / 1000000).toFixed(1)}M€</span>
              <span className="stat-label">Valeur totale</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon occupancy">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{globalStats.occupancyRate.toFixed(1)}%</span>
              <span className="stat-label">Taux d'occupation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="projects-controls">
        <div className="controls-left">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filtres
          </button>
        </div>

        <div className="controls-right">
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="sort-select"
            >
              <option value="date">Date de création</option>
              <option value="name">Nom</option>
              <option value="units">Nombre d'unités</option>
              <option value="value">Valeur</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown size={18} />
            </button>
          </div>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
        </div>
      )}

      {/* Projects List */}
      <div className={`projects-container ${viewMode}`}>
        {filteredAndSortedProjects.length === 0 ? (
          <div className="empty-state">
            <Building2 size={64} />
            <h3>Aucun projet trouvé</h3>
            <p>
              {searchTerm 
                ? 'Aucun projet ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier projet immobilier.'
              }
            </p>
            {!searchTerm && (
              <button className="btn-primary" onClick={handleCreateProject}>
                <Plus size={20} />
                Créer un projet
              </button>
            )}
          </div>
        ) : (
          <div className={`projects-${viewMode}`}>
            {filteredAndSortedProjects.map((project) => (
              <div key={project.id} className="project-card">
                {project.mainImage && (
                  <div className="project-card-image">
                    <img src={project.mainImage} alt={project.name} />
                  </div>
                )}
                
                <div className="project-card-header">
                  <div className="project-actions">
                    <button 
                      className="action-btn"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      title="Voir les détails"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit button clicked for project:', project);
                        handleEditProject(project);
                      }}
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => handleDeleteProject(project)}
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="project-card-content">
                  <div className="project-main-info">
                    <h3 className="project-name">{project.name}</h3>
                    <div className="project-location">
                      <MapPin size={16} />
                      <span>{project.address}, {project.city}</span>
                    </div>
                    {project.description && (
                      <p className="project-description">
                        {project.description.length > 120 
                          ? `${project.description.substring(0, 120)}...`
                          : project.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="project-stats-grid">
                    <div className="stat-item">
                      <Home size={16} />
                      <span className="stat-number">{project.unitsCount}</span>
                      <span className="stat-text">Unités</span>
                    </div>
                    <div className="stat-item">
                      <Users size={16} />
                      <span className="stat-number">{project.availableUnits}</span>
                      <span className="stat-text">Disponibles</span>
                    </div>
                    <div className="stat-item">
                      <Euro size={16} />
                      <span className="stat-number">{(project.totalValue / 1000000).toFixed(1)}M€</span>
                      <span className="stat-text">Valeur</span>
                    </div>
                    <div className="stat-item">
                      <TrendingUp size={16} />
                      <span className="stat-number">{project.occupancyRate.toFixed(0)}%</span>
                      <span className="stat-text">Occupation</span>
                    </div>
                  </div>

                  {(project.startDate || project.endDate) && (
                    <div className="project-dates">
                      {project.startDate && (
                        <div className="date-item">
                          <Calendar size={14} />
                          <span>Début: {new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.endDate && (
                        <div className="date-item">
                          <Calendar size={14} />
                          <span>Fin: {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="project-card-footer">
                  <button 
                    className="btn-view-project"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Voir le projet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</h2>
              <button 
                className="modal-close"
                onClick={() => setIsProjectModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom du projet *</label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nom du projet"
                  />
                </div>

                <div className="form-group">
                  <label>Type de projet</label>
                  <select
                    value={projectForm.type}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="building">Immeuble</option>
                    <option value="house">Maison</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixte</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Adresse *</label>
                  <input
                    type="text"
                    value={projectForm.address}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse du projet"
                  />
                </div>

                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    value={projectForm.city}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ville"
                  />
                </div>

                <div className="form-group">
                  <label>Code postal</label>
                  <input
                    type="text"
                    value={projectForm.postalCode}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Code postal"
                  />
                </div>


                <div className="form-group">
                  <label>Nombre d'unités prévues</label>
                  <input
                    type="number"
                    value={projectForm.totalUnits}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, totalUnits: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Budget (€)</label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Image du projet</label>
                  <ImageUpload
                    value={projectForm.mainImage}
                    onChange={(imageUrl) => setProjectForm(prev => ({ ...prev, mainImage: imageUrl }))}
                    onRemove={() => setProjectForm(prev => ({ ...prev, mainImage: '' }))}
                    placeholder="Ajouter une image pour illustrer le projet"
                    projectId={editingProject?.id}
                    isGallery={false}
                  />
                </div>

                <div className="form-group">
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Date de fin prévue</label>
                  <input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du projet..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsProjectModalOpen(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveProject}
              >
                {editingProject ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && projectToDelete && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button 
                className="modal-close"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer le projet <strong>{projectToDelete.name}</strong> ?
              </p>
              <p className="warning-text">
                Cette action est irréversible et supprimera également toutes les unités associées.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-danger"
                onClick={confirmDeleteProject}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsNew;
