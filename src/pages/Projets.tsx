import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjects, Project } from '../hooks/useProjects';
import { useUnits, Unit } from '../hooks/useUnits';
import { Plus, Edit, Trash2, ArrowLeft, Building, MapPin, Calendar, X, Building2, Eye, Home, Euro } from 'lucide-react';
import './Projets.css';

interface LocalProject extends Project {
  units: Unit[];
  availableUnits: number;
}

const Projets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects: firebaseProjects, loading, error, addProject, updateProject, deleteProject } = useProjects();
  const { units, addUnit, updateUnit, deleteUnit, fetchUnits } = useUnits();
  
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({});
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    location: '',
    totalUnits: 0,
    startDate: '',
    endDate: '',
    // Identification du bien
    type: 'building' as 'building' | 'house' | 'complex' | 'land' | 'commercial' | 'mixed',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    destination: 'habitation' as 'habitation' | 'commerce' | 'mixte' | 'industriel',
    totalSurface: 0,
    constructionYear: new Date().getFullYear(),
    renovationYear: 0,
    // Informations légales
    propertyTitle: '',
    urbanisticInfo: '',
    zoning: 'residential' as 'residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural',
    permits: [] as string[],
    servitudes: '',
    // Caractéristiques techniques
    heatingType: 'gas' as 'gas' | 'oil' | 'electric' | 'heat_pump' | 'solar' | 'wood' | 'other',
    roofType: '',
    buildingMaterials: '',
    isolation: {
      walls: false,
      roof: false,
      doubleGlazing: false,
    },
    // Informations financières
    budget: 0,
    totalValue: 0,
    cadastralIncome: 0,
    registrationFees: 0,
    notaryFees: 0,
    tva: 0,
    // Diagnostics et conformité
    energyCertificate: '',
    electricalCompliance: false,
    gasCompliance: false,
    heatingCertificate: false,
    asbestosCertificate: false,
    soilAttestation: false,
    
    // Informations générales détaillées
    branding: '',
    gpsCoordinates: '',
    neighborhood: '',
    phases: '',
    developer: '',
    architect: '',
    engineeringFirm: '',
    stabilityEngineer: '',
    pebOffice: '',
    generalContractor: '',
    constructionMode: 'turnkey' as 'turnkey' | 'separate_lots' | 'other',
    
    // Aspects techniques et urbanistiques
    urbanPermitNumber: '',
    urbanPermitDate: '',
    totalBuiltSurface: 0,
    numberOfLevels: 0,
    energyStandards: '',
    mainMaterials: '',
    exteriorDevelopment: '',
    localRegulationsCompliance: '',
    
    // Aspects légaux et administratifs
    divisionAct: '',
    coOwnershipRegulations: '',
    baseAct: '',
    insurances: '',
    environmentalPermits: '',
    soilStudy: '',
    pollutionCertificates: '',
    
    // Informations financières étendues
    constructionCostPerSqm: 0,
    financing: '',
    pricePerSqm: 0,
    estimatedRent: 0,
    averageRentalYield: 0,
    taxes: '',
    commonCharges: 0,
    
    // Informations commerciales et marketing
    positioning: '',
    targetClientele: '',
    competitiveAdvantages: '',
    marketingBranding: '',
    commercializationPlanning: '',
    marketingSupports: '',
    
    // Planning et organisation
    permitSubmissionDate: '',
    permitObtainedDate: '',
    constructionStartDate: '',
    phaseProgress: '',
    deliveryDate: '',
    salesMode: 'vefa' as 'vefa' | 'turnkey' | 'rental',
    legalGuarantees: '',
    
    // Environnement et valeur ajoutée
    accessibility: '',
    proximity: '',
    neighborhoodDevelopments: '',
    energyStrategy: '',
    environmentalImpact: '',
    socialAddedValue: '',
  });

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
    const syncedProjects: LocalProject[] = firebaseProjects.map(project => {
      const projectUnits = units.filter(unit => unit.projectId === project.id);
      
      return {
        ...project,
        units: projectUnits,
        availableUnits: projectUnits.filter(unit => unit.availability === 'available').length
      };
    });
    
    setProjects(syncedProjects);
  }, [firebaseProjects, units]);

  // Fetch all units on component mount
  useEffect(() => {
    if (user?.uid) {
      fetchUnits(); // Fetch all units without projectId filter
    }
  }, [user?.uid]);

  // Fetch units when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchUnits(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreateUnit = (projectId: string) => {
    setSelectedProjectId(projectId);
    resetNewUnit();
    setNewUnit(prev => ({ ...prev, projectId }));
    setIsUnitModalOpen(true);
    setIsEditingUnit(false);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setNewUnit({
      name: unit.name,
      type: unit.type,
      surface: unit.surface,
      price: unit.price,
      description: unit.description || '',
    });
    setIsUnitModalOpen(true);
    setIsEditingUnit(true);
  };

  const handleSaveUnit = async () => {
    if (!user || !selectedProjectId) return;

    // Validation
    if (!newUnit.name || !newUnit.type || !newUnit.surface || !newUnit.price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const unitData = {
        projectId: selectedProjectId,
        name: newUnit.name,
        type: newUnit.type,
        surface: newUnit.surface,
        price: newUnit.price,
        description: newUnit.description || '',
        images: [],
        documents: [],
        availability: 'available' as const,
        condition: 'good' as const,
      };

      if (editingUnit) {
        await updateUnit(editingUnit.id, unitData);
      } else {
        await addUnit(unitData);
      }

      // Units will be automatically refreshed by the hook
      
      setIsUnitModalOpen(false);
      setEditingUnit(null);
      setNewUnit({
        name: '',
        type: 'apartment',
        surface: 0,
        price: 0,
        description: '',
      });
    } catch (error) {
      console.error('Error saving unit:', error);
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    
    // Helper function to convert Firebase Timestamp or Date to string
    const dateToString = (date: any) => {
      if (!date) return '';
      if (typeof date === 'object' && date.toDate) {
        // Firebase Timestamp
        return date.toDate().toISOString().split('T')[0];
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      // String date
      return new Date(date).toISOString().split('T')[0];
    };
    
    setNewProject({
      name: project.name,
      description: project.description || '',
      location: project.address || '',
      totalUnits: project.totalUnits || 0,
      startDate: dateToString(project.startDate),
      endDate: dateToString(project.endDate),
      // Identification du bien
      type: project.type || 'building',
      address: project.address || '',
      city: project.city || '',
      postalCode: project.postalCode || '',
      country: project.country || '',
      destination: project.destination || 'habitation',
      totalSurface: project.totalSurface || 0,
      constructionYear: project.constructionYear || new Date().getFullYear(),
      renovationYear: project.renovationYear || 0,
      // Informations légales
      propertyTitle: project.propertyTitle || '',
      urbanisticInfo: project.urbanisticInfo || '',
      zoning: project.zoning || 'residential',
      permits: project.permits || [],
      servitudes: project.servitudes || '',
      // Caractéristiques techniques
      heatingType: project.heatingType || 'gas',
      roofType: project.roofType || '',
      buildingMaterials: project.buildingMaterials || '',
      isolation: {
        walls: project.isolation?.walls || false,
        roof: project.isolation?.roof || false,
        doubleGlazing: project.isolation?.doubleGlazing || false,
      },
      // Informations financières
      budget: project.budget || 0,
      totalValue: project.totalValue || 0,
      cadastralIncome: project.cadastralIncome || 0,
      registrationFees: project.registrationFees || 0,
      notaryFees: project.notaryFees || 0,
      tva: project.tva || 0,
      // Diagnostics et conformité
      energyCertificate: project.energyCertificate || '',
      electricalCompliance: project.electricalCompliance || false,
      gasCompliance: project.gasCompliance || false,
      heatingCertificate: project.heatingCertificate || false,
      asbestosCertificate: project.asbestosCertificate || false,
      soilAttestation: project.soilAttestation || false,
      
      // Informations générales détaillées
      branding: project.branding || '',
      gpsCoordinates: project.gpsCoordinates || '',
      neighborhood: project.neighborhood || '',
      phases: project.phases || '',
      developer: project.developer || '',
      architect: project.architect || '',
      engineeringFirm: project.engineeringFirm || '',
      stabilityEngineer: project.stabilityEngineer || '',
      pebOffice: project.pebOffice || '',
      generalContractor: project.generalContractor || '',
      constructionMode: project.constructionMode || 'turnkey',
      
      // Aspects techniques et urbanistiques
      urbanPermitNumber: project.urbanPermitNumber || '',
      urbanPermitDate: dateToString(project.urbanPermitDate),
      totalBuiltSurface: project.totalBuiltSurface || 0,
      numberOfLevels: project.numberOfLevels || 0,
      energyStandards: project.energyStandards || '',
      mainMaterials: project.mainMaterials || '',
      exteriorDevelopment: project.exteriorDevelopment || '',
      localRegulationsCompliance: project.localRegulationsCompliance || '',
      
      // Aspects légaux et administratifs
      divisionAct: project.divisionAct || '',
      coOwnershipRegulations: project.coOwnershipRegulations || '',
      baseAct: project.baseAct || '',
      insurances: project.insurances || '',
      environmentalPermits: project.environmentalPermits || '',
      soilStudy: project.soilStudy || '',
      pollutionCertificates: project.pollutionCertificates || '',
      
      // Informations financières étendues
      constructionCostPerSqm: project.constructionCostPerSqm || 0,
      financing: project.financing || '',
      pricePerSqm: project.pricePerSqm || 0,
      estimatedRent: project.estimatedRent || 0,
      averageRentalYield: project.averageRentalYield || 0,
      taxes: project.taxes || '',
      commonCharges: project.commonCharges || 0,
      
      // Informations commerciales et marketing
      positioning: project.positioning || '',
      targetClientele: project.targetClientele || '',
      competitiveAdvantages: project.competitiveAdvantages || '',
      marketingBranding: project.marketingBranding || '',
      commercializationPlanning: project.commercializationPlanning || '',
      marketingSupports: project.marketingSupports || '',
      
      // Planning et organisation
      permitSubmissionDate: dateToString(project.permitSubmissionDate),
      permitObtainedDate: dateToString(project.permitObtainedDate),
      constructionStartDate: dateToString(project.constructionStartDate),
      phaseProgress: project.phaseProgress || '',
      deliveryDate: dateToString(project.deliveryDate),
      salesMode: project.salesMode || 'vefa',
      legalGuarantees: project.legalGuarantees || '',
      
      // Environnement et valeur ajoutée
      accessibility: project.accessibility || '',
      proximity: project.proximity || '',
      neighborhoodDevelopments: project.neighborhoodDevelopments || '',
      energyStrategy: project.energyStrategy || '',
      environmentalImpact: project.environmentalImpact || '',
      socialAddedValue: project.socialAddedValue || '',
    });
    setIsEditingProject(true);
    setIsProjectModalOpen(true);
  };

  const resetProjectForm = () => {
    setNewProject({
      name: '',
      description: '',
      location: '',
      totalUnits: 0,
      startDate: '',
      endDate: '',
      // Identification du bien
      type: 'building' as 'building' | 'house' | 'complex' | 'land' | 'commercial' | 'mixed',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      destination: 'habitation' as 'habitation' | 'commerce' | 'mixte' | 'industriel',
      totalSurface: 0,
      constructionYear: new Date().getFullYear(),
      renovationYear: 0,
      // Informations légales
      propertyTitle: '',
      urbanisticInfo: '',
      zoning: 'residential' as 'residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural',
      permits: [] as string[],
      servitudes: '',
      // Caractéristiques techniques
      heatingType: 'gas' as 'gas' | 'oil' | 'electric' | 'heat_pump' | 'solar' | 'wood' | 'other',
      roofType: '',
      buildingMaterials: '',
      isolation: {
        walls: false,
        roof: false,
        doubleGlazing: false,
      },
      // Informations financières
      budget: 0,
      totalValue: 0,
      cadastralIncome: 0,
      registrationFees: 0,
      notaryFees: 0,
      tva: 0,
      // Diagnostics et conformité
      energyCertificate: '',
      electricalCompliance: false,
      gasCompliance: false,
      heatingCertificate: false,
      asbestosCertificate: false,
      soilAttestation: false,
      
      // Informations générales détaillées
      branding: '',
      gpsCoordinates: '',
      neighborhood: '',
      phases: '',
      developer: '',
      architect: '',
      engineeringFirm: '',
      stabilityEngineer: '',
      pebOffice: '',
      generalContractor: '',
      constructionMode: 'turnkey' as 'turnkey' | 'separate_lots' | 'other',
      
      // Aspects techniques et urbanistiques
      urbanPermitNumber: '',
      urbanPermitDate: '',
      totalBuiltSurface: 0,
      numberOfLevels: 0,
      energyStandards: '',
      mainMaterials: '',
      exteriorDevelopment: '',
      localRegulationsCompliance: '',
      
      // Aspects légaux et administratifs
      divisionAct: '',
      coOwnershipRegulations: '',
      baseAct: '',
      insurances: '',
      environmentalPermits: '',
      soilStudy: '',
      pollutionCertificates: '',
      
      // Informations financières étendues
      constructionCostPerSqm: 0,
      financing: '',
      pricePerSqm: 0,
      estimatedRent: 0,
      averageRentalYield: 0,
      taxes: '',
      commonCharges: 0,
      
      // Informations commerciales et marketing
      positioning: '',
      targetClientele: '',
      competitiveAdvantages: '',
      marketingBranding: '',
      commercializationPlanning: '',
      marketingSupports: '',
      
      // Planning et organisation
      permitSubmissionDate: '',
      permitObtainedDate: '',
      constructionStartDate: '',
      phaseProgress: '',
      deliveryDate: '',
      salesMode: 'vefa' as 'vefa' | 'turnkey' | 'rental',
      legalGuarantees: '',
      
      // Environnement et valeur ajoutée
      accessibility: '',
      proximity: '',
      neighborhoodDevelopments: '',
      energyStrategy: '',
      environmentalImpact: '',
      socialAddedValue: '',
    });
    setEditingProject(null);
    setIsEditingProject(false);
  };

  const handleSaveProject = async () => {
    if (!user) return;

    // Validation
    if (!newProject.name || !newProject.location) {
      alert('Veuillez remplir au moins le nom et la localisation du projet');
      return;
    }

    try {
      const projectData = {
        name: newProject.name,
        type: 'building' as const,
        address: newProject.location,
        city: '',
        postalCode: '',
        description: newProject.description,
        totalUnits: newProject.totalUnits,
        status: 'planning' as const,
        startDate: newProject.startDate ? new Date(newProject.startDate) : undefined,
        endDate: newProject.endDate ? new Date(newProject.endDate) : undefined,
        totalValue: 0,
        images: [],
        documents: [],
      };

      if (isEditingProject && editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await addProject(projectData);
      }

      setIsProjectModalOpen(false);
      resetProjectForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!user) return;
    
    try {
      await deleteUnit(unitId);
      // Units will be automatically refreshed by the hook
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
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleEditProject(project)}
            >
              <Edit size={16} />
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <Eye size={16} />
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
                  onClick={() => navigate(`/units/${unit.id}`)}
                >
                  <Eye size={16} />
                  Voir détails
                </button>
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
        
        <button 
          onClick={() => {
            resetProjectForm();
            setIsProjectModalOpen(true);
          }}
          className="create-project-btn"
        >
          <Plus size={20} />
          Nouveau Projet
        </button>
      </div>

      <div className="projets-content">
        {selectedProjectId ? renderUnitsView() : renderProjectList()}
      </div>

      {renderUnitModal()}
      {renderProjectModal()}
    </div>
  );

  function renderProjectModal() {
    if (!isProjectModalOpen) return null;

    return (
      <div className="modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{isEditingProject ? 'Modifier le Projet' : 'Nouveau Projet'}</h2>
            <button 
              className="close-btn" 
              onClick={() => {
                setIsProjectModalOpen(false);
                resetProjectForm();
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {/* Section 1: Informations de base */}
            <div className="form-section">
              <h3 className="section-title">Informations de base</h3>
              
              <div className="form-group">
                <label>Nom du projet *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du projet"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de bien *</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="building">Immeuble</option>
                    <option value="house">Maison</option>
                    <option value="complex">Complexe</option>
                    <option value="land">Terrain</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixte</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <select
                    value={newProject.destination}
                    onChange={(e) => setNewProject(prev => ({ ...prev, destination: e.target.value as any }))}
                  >
                    <option value="habitation">Habitation</option>
                    <option value="commerce">Commerce</option>
                    <option value="mixte">Mixte</option>
                    <option value="industriel">Industriel</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Adresse complète *</label>
                <input
                  type="text"
                  value={newProject.address}
                  onChange={(e) => setNewProject(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Numéro et rue"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ville *</label>
                  <input
                    type="text"
                    value={newProject.city}
                    onChange={(e) => setNewProject(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ville"
                  />
                </div>
                <div className="form-group">
                  <label>Code postal *</label>
                  <input
                    type="text"
                    value={newProject.postalCode}
                    onChange={(e) => setNewProject(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Code postal"
                  />
                </div>
                <div className="form-group">
                  <label>Pays</label>
                  <input
                    type="text"
                    value={newProject.country}
                    onChange={(e) => setNewProject(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du projet"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre d'unités</label>
                  <input
                    type="number"
                    value={newProject.totalUnits}
                    onChange={(e) => setNewProject(prev => ({ ...prev, totalUnits: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Surface totale (m²)</label>
                  <input
                    type="number"
                    value={newProject.totalSurface}
                    onChange={(e) => setNewProject(prev => ({ ...prev, totalSurface: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Année de construction</label>
                  <input
                    type="number"
                    value={newProject.constructionYear}
                    onChange={(e) => setNewProject(prev => ({ ...prev, constructionYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    min="1800"
                    max={new Date().getFullYear() + 10}
                  />
                </div>
                <div className="form-group">
                  <label>Année de rénovation</label>
                  <input
                    type="number"
                    value={newProject.renovationYear || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, renovationYear: parseInt(e.target.value) || 0 }))}
                    min="1800"
                    max={new Date().getFullYear() + 10}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Informations légales */}
            <div className="form-section">
              <h3 className="section-title">Informations légales</h3>
              
              <div className="form-group">
                <label>Titre de propriété</label>
                <input
                  type="text"
                  value={newProject.propertyTitle}
                  onChange={(e) => setNewProject(prev => ({ ...prev, propertyTitle: e.target.value }))}
                  placeholder="Référence du titre de propriété"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zonage</label>
                  <select
                    value={newProject.zoning}
                    onChange={(e) => setNewProject(prev => ({ ...prev, zoning: e.target.value as any }))}
                  >
                    <option value="residential">Résidentiel</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixte</option>
                    <option value="industrial">Industriel</option>
                    <option value="agricultural">Agricole</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Certificat énergétique (PEB/DPE)</label>
                  <input
                    type="text"
                    value={newProject.energyCertificate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, energyCertificate: e.target.value }))}
                    placeholder="Classe énergétique"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Renseignements urbanistiques</label>
                <textarea
                  value={newProject.urbanisticInfo}
                  onChange={(e) => setNewProject(prev => ({ ...prev, urbanisticInfo: e.target.value }))}
                  placeholder="Informations urbanistiques, permis, etc."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Servitudes</label>
                <textarea
                  value={newProject.servitudes}
                  onChange={(e) => setNewProject(prev => ({ ...prev, servitudes: e.target.value }))}
                  placeholder="Servitudes éventuelles (droit de passage, etc.)"
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.electricalCompliance}
                      onChange={(e) => setNewProject(prev => ({ ...prev, electricalCompliance: e.target.checked }))}
                    />
                    Conformité électrique
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.gasCompliance}
                      onChange={(e) => setNewProject(prev => ({ ...prev, gasCompliance: e.target.checked }))}
                    />
                    Conformité gaz
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.heatingCertificate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, heatingCertificate: e.target.checked }))}
                    />
                    Certificat chauffage
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.asbestosCertificate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, asbestosCertificate: e.target.checked }))}
                    />
                    Certificat amiante
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.soilAttestation}
                      onChange={(e) => setNewProject(prev => ({ ...prev, soilAttestation: e.target.checked }))}
                    />
                    Attestation du sol
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3: Caractéristiques techniques */}
            <div className="form-section">
              <h3 className="section-title">Caractéristiques techniques</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Type de chauffage</label>
                  <select
                    value={newProject.heatingType}
                    onChange={(e) => setNewProject(prev => ({ ...prev, heatingType: e.target.value as any }))}
                  >
                    <option value="gas">Gaz</option>
                    <option value="oil">Mazout</option>
                    <option value="electric">Électrique</option>
                    <option value="heat_pump">Pompe à chaleur</option>
                    <option value="solar">Solaire</option>
                    <option value="wood">Bois</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de toiture</label>
                  <input
                    type="text"
                    value={newProject.roofType}
                    onChange={(e) => setNewProject(prev => ({ ...prev, roofType: e.target.value }))}
                    placeholder="Tuiles, ardoise, etc."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Matériaux de construction</label>
                <input
                  type="text"
                  value={newProject.buildingMaterials}
                  onChange={(e) => setNewProject(prev => ({ ...prev, buildingMaterials: e.target.value }))}
                  placeholder="Béton, brique, bois, etc."
                />
              </div>

              <div className="form-group">
                <label>Isolation</label>
                <div className="checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.isolation.walls}
                      onChange={(e) => setNewProject(prev => ({ 
                        ...prev, 
                        isolation: { ...prev.isolation, walls: e.target.checked }
                      }))}
                    />
                    Murs isolés
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.isolation.roof}
                      onChange={(e) => setNewProject(prev => ({ 
                        ...prev, 
                        isolation: { ...prev.isolation, roof: e.target.checked }
                      }))}
                    />
                    Toiture isolée
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newProject.isolation.doubleGlazing}
                      onChange={(e) => setNewProject(prev => ({ 
                        ...prev, 
                        isolation: { ...prev.isolation, doubleGlazing: e.target.checked }
                      }))}
                    />
                    Double vitrage
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Informations financières */}
            <div className="form-section">
              <h3 className="section-title">Informations financières</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (€)</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Valeur totale (€)</label>
                  <input
                    type="number"
                    value={newProject.totalValue}
                    onChange={(e) => setNewProject(prev => ({ ...prev, totalValue: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Revenu cadastral (€)</label>
                  <input
                    type="number"
                    value={newProject.cadastralIncome}
                    onChange={(e) => setNewProject(prev => ({ ...prev, cadastralIncome: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Droits d'enregistrement (€)</label>
                  <input
                    type="number"
                    value={newProject.registrationFees}
                    onChange={(e) => setNewProject(prev => ({ ...prev, registrationFees: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frais de notaire (€)</label>
                  <input
                    type="number"
                    value={newProject.notaryFees}
                    onChange={(e) => setNewProject(prev => ({ ...prev, notaryFees: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>TVA (€)</label>
                  <input
                    type="number"
                    value={newProject.tva}
                    onChange={(e) => setNewProject(prev => ({ ...prev, tva: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Informations détaillées du projet */}
            <div className="form-section">
              <h3 className="section-title">Informations générales détaillées</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Branding/Nom commercial</label>
                  <input
                    type="text"
                    value={newProject.branding}
                    onChange={(e) => setNewProject(prev => ({ ...prev, branding: e.target.value }))}
                    placeholder="Nom commercial du projet"
                  />
                </div>
                <div className="form-group">
                  <label>Quartier</label>
                  <input
                    type="text"
                    value={newProject.neighborhood}
                    onChange={(e) => setNewProject(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Nom du quartier"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Coordonnées GPS</label>
                  <input
                    type="text"
                    value={newProject.gpsCoordinates}
                    onChange={(e) => setNewProject(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
                    placeholder="Latitude, Longitude"
                  />
                </div>
                <div className="form-group">
                  <label>Phasage du projet</label>
                  <input
                    type="text"
                    value={newProject.phases}
                    onChange={(e) => setNewProject(prev => ({ ...prev, phases: e.target.value }))}
                    placeholder="Phase 1, Phase 2..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Promoteur/Société</label>
                  <input
                    type="text"
                    value={newProject.developer}
                    onChange={(e) => setNewProject(prev => ({ ...prev, developer: e.target.value }))}
                    placeholder="Nom du promoteur"
                  />
                </div>
                <div className="form-group">
                  <label>Architecte</label>
                  <input
                    type="text"
                    value={newProject.architect}
                    onChange={(e) => setNewProject(prev => ({ ...prev, architect: e.target.value }))}
                    placeholder="Nom de l'architecte"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bureau d'étude</label>
                  <input
                    type="text"
                    value={newProject.engineeringFirm}
                    onChange={(e) => setNewProject(prev => ({ ...prev, engineeringFirm: e.target.value }))}
                    placeholder="Bureau d'étude"
                  />
                </div>
                <div className="form-group">
                  <label>Ingénieur stabilité</label>
                  <input
                    type="text"
                    value={newProject.stabilityEngineer}
                    onChange={(e) => setNewProject(prev => ({ ...prev, stabilityEngineer: e.target.value }))}
                    placeholder="Ingénieur stabilité"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bureau PEB</label>
                  <input
                    type="text"
                    value={newProject.pebOffice}
                    onChange={(e) => setNewProject(prev => ({ ...prev, pebOffice: e.target.value }))}
                    placeholder="Bureau PEB"
                  />
                </div>
                <div className="form-group">
                  <label>Entreprise générale</label>
                  <input
                    type="text"
                    value={newProject.generalContractor}
                    onChange={(e) => setNewProject(prev => ({ ...prev, generalContractor: e.target.value }))}
                    placeholder="Entreprise générale"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mode de construction</label>
                <select
                  value={newProject.constructionMode}
                  onChange={(e) => setNewProject(prev => ({ ...prev, constructionMode: e.target.value as any }))}
                >
                  <option value="turnkey">Clé sur porte</option>
                  <option value="separate_lots">Lots séparés</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            {/* Section 6: Aspects techniques et urbanistiques */}
            <div className="form-section">
              <h3 className="section-title">Aspects techniques et urbanistiques</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Numéro permis d'urbanisme</label>
                  <input
                    type="text"
                    value={newProject.urbanPermitNumber}
                    onChange={(e) => setNewProject(prev => ({ ...prev, urbanPermitNumber: e.target.value }))}
                    placeholder="Numéro du permis"
                  />
                </div>
                <div className="form-group">
                  <label>Date du permis</label>
                  <input
                    type="date"
                    value={newProject.urbanPermitDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, urbanPermitDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Surface totale construite (m²)</label>
                  <input
                    type="number"
                    value={newProject.totalBuiltSurface}
                    onChange={(e) => setNewProject(prev => ({ ...prev, totalBuiltSurface: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre de niveaux</label>
                  <input
                    type="number"
                    value={newProject.numberOfLevels}
                    onChange={(e) => setNewProject(prev => ({ ...prev, numberOfLevels: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Normes énergétiques</label>
                <input
                  type="text"
                  value={newProject.energyStandards}
                  onChange={(e) => setNewProject(prev => ({ ...prev, energyStandards: e.target.value }))}
                  placeholder="PEB A, passif, NZEB..."
                />
              </div>

              <div className="form-group">
                <label>Matériaux principaux</label>
                <textarea
                  value={newProject.mainMaterials}
                  onChange={(e) => setNewProject(prev => ({ ...prev, mainMaterials: e.target.value }))}
                  placeholder="Description des matériaux principaux"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Aménagements extérieurs</label>
                <textarea
                  value={newProject.exteriorDevelopment}
                  onChange={(e) => setNewProject(prev => ({ ...prev, exteriorDevelopment: e.target.value }))}
                  placeholder="Voiries, parkings, espaces verts..."
                  rows={2}
                />
              </div>
            </div>

            {/* Section 7: Informations commerciales et planning */}
            <div className="form-section">
              <h3 className="section-title">Informations commerciales et planning</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Positionnement</label>
                  <input
                    type="text"
                    value={newProject.positioning}
                    onChange={(e) => setNewProject(prev => ({ ...prev, positioning: e.target.value }))}
                    placeholder="Standing, luxe, familial..."
                  />
                </div>
                <div className="form-group">
                  <label>Clientèle cible</label>
                  <input
                    type="text"
                    value={newProject.targetClientele}
                    onChange={(e) => setNewProject(prev => ({ ...prev, targetClientele: e.target.value }))}
                    placeholder="Investisseurs, familles..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix de vente par m² (€)</label>
                  <input
                    type="number"
                    value={newProject.pricePerSqm}
                    onChange={(e) => setNewProject(prev => ({ ...prev, pricePerSqm: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Loyer estimé (€)</label>
                  <input
                    type="number"
                    value={newProject.estimatedRent}
                    onChange={(e) => setNewProject(prev => ({ ...prev, estimatedRent: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mode de vente</label>
                  <select
                    value={newProject.salesMode}
                    onChange={(e) => setNewProject(prev => ({ ...prev, salesMode: e.target.value as any }))}
                  >
                    <option value="vefa">VEFA (Vente en l'État Futur d'Achèvement)</option>
                    <option value="turnkey">Clé en main</option>
                    <option value="rental">Location</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date de livraison prévue</label>
                  <input
                    type="date"
                    value={newProject.deliveryDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Avantages compétitifs</label>
                <textarea
                  value={newProject.competitiveAdvantages}
                  onChange={(e) => setNewProject(prev => ({ ...prev, competitiveAdvantages: e.target.value }))}
                  placeholder="Prix, localisation, services, éco-énergie..."
                  rows={2}
                />
              </div>
            </div>

            {/* Section 8: Environnement et accessibilité */}
            <div className="form-section">
              <h3 className="section-title">Environnement et accessibilité</h3>
              
              <div className="form-group">
                <label>Accessibilité</label>
                <textarea
                  value={newProject.accessibility}
                  onChange={(e) => setNewProject(prev => ({ ...prev, accessibility: e.target.value }))}
                  placeholder="Routes, transports publics, mobilité douce..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Proximité</label>
                <textarea
                  value={newProject.proximity}
                  onChange={(e) => setNewProject(prev => ({ ...prev, proximity: e.target.value }))}
                  placeholder="Écoles, commerces, hôpitaux, universités..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Stratégie énergétique</label>
                <textarea
                  value={newProject.energyStrategy}
                  onChange={(e) => setNewProject(prev => ({ ...prev, energyStrategy: e.target.value }))}
                  placeholder="Panneaux solaires, pompe à chaleur, bornes électriques..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Valeur ajoutée sociale</label>
                <textarea
                  value={newProject.socialAddedValue}
                  onChange={(e) => setNewProject(prev => ({ ...prev, socialAddedValue: e.target.value }))}
                  placeholder="Logements abordables, mixité, services intégrés..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsProjectModalOpen(false);
                resetProjectForm();
              }}
            >
              Annuler
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveProject}
            >
              {isEditingProject ? 'Modifier le Projet' : 'Créer le Projet'}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default Projets;
