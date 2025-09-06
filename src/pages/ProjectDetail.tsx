import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useUnits, Unit } from '../hooks/useUnits';
import { useAuth } from '../hooks/useAuth';
import { uploadProjectGalleryImage } from '../utils/storage';
import { addImageToProject, removeImageFromProject, updateProjectMainImage } from '../utils/projectImages';
import { addImageToUnit, removeImageFromUnit } from '../utils/unitImages';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, MapPin, Building2, Plus, Home, Bed, Bath, Compass, Trash2, X, Edit2, Users, Euro, Calendar, Edit, Image, FileText, Eye } from 'lucide-react';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading: projectsLoading, updateProject } = useProjects();
  const { units, loading: unitsLoading, fetchUnits, addUnit, updateUnit, deleteUnit } = useUnits();
  
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'gallery' | 'documents'>('units');
  
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({});
  
  // Gallery state
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Documents state
  const [projectDocuments, setProjectDocuments] = useState<any[]>([]);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Project edit modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    type: 'building' as 'building' | 'house' | 'complex' | 'land' | 'commercial' | 'mixed',
    address: '',
    city: '',
    postalCode: '',
    status: 'planning' as 'planning' | 'construction' | 'completed' | 'on_hold',
    totalUnits: 0,
    budget: 0,
    startDate: '',
    endDate: '',
    mainImage: ''
  });

  // Get units for this project - simplified to avoid React conflicts
  const projectUnits = React.useMemo(() => {
    if (!units || !id) {
      return [];
    }
    
    return units.filter(unit => unit.projectId === id);
  }, [units, id]);

  // Load project data when component mounts or projects change
  useEffect(() => {
    if (id && projects.length > 0) {
      console.log('ProjectDetail: Loading project with id:', id);
      console.log('ProjectDetail: Available projects:', projects);
      const foundProject = projects.find(p => p.id === id);
      console.log('ProjectDetail: Found project:', foundProject);
      setProject(foundProject || null);
      
      // Load gallery images from project data
      if (foundProject?.images) {
        setProjectImages(foundProject.images);
      }
    }
  }, [id, projects]);

  // Single effect to load data when user or project changes
  useEffect(() => {
    if (user?.uid) {
      console.log('ProjectDetail: Loading data for user:', user.uid, 'project:', id);
      fetchUnits(); // Fetch all units
    }
  }, [user?.uid]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'reserved': return 'status-reserved';
      case 'sold': return 'status-sold';
      case 'rented': return 'status-rented';
      default: return 'status-default';
    }
  };

  const resetNewUnit = () => {
    setNewUnit({
      name: '',
      type: 'apartment',
      surface: 0,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      floor: 0,
      price: 0,
      description: '',
      availability: 'available',
      condition: 'good',
      orientation: 'south',
      projectId: id || '', // Assure la liaison avec le projet actuel
      images: [],
      documents: [],
      
      // Identification complémentaire
      fullAddress: '',
      country: '',
      destination: 'habitation',
      hasElevator: false,
      
      // Informations légales obligatoires
      propertyTitle: '',
      energyCertificate: '',
      electricalCompliance: false,
      gasCompliance: false,
      urbanisticInfo: '',
      soilAttestation: false,
      asbestosCertificate: false,
      heatingCertificate: false,
      cadastralPlan: '',
      mortgageStatus: '',
      
      // Informations pour location
      leaseType: 'residential',
      leaseDuration: '',
      securityDeposit: 0,
      leaseRegistered: false,
      
      // Energy & Environment
      energyClass: 'not_specified',
      ghgEmissions: 'not_specified',
      heatingType: 'gas',
      hotWaterSystem: 'gas',
      
      // Construction
      constructionYear: undefined,
      renovationYear: undefined,
      buildingMaterials: '',
      roofType: '',
      isolation: {
        walls: false,
        roof: false,
        doubleGlazing: false
      },
      
      // Features
      balcony: false,
      balconyArea: 0,
      terrace: false,
      terraceArea: 0,
      garden: false,
      gardenArea: 0,
      cellar: false,
      attic: false,
      elevator: false,
      parking: false,
      parkingSpaces: 0,
      garage: false,
      
      // Amenities
      furnished: false,
      kitchenType: 'none',
      internetFiber: false,
      airConditioning: false,
      fireplace: false,
      swimmingPool: false,
      
      // Security & Access
      securitySystem: false,
      intercom: false,
      accessControl: false,
      concierge: false,
      
      // Commercial specific
      commercialLicense: false,
      shopWindow: false,
      storageRoom: false,
      loadingDock: false,
      
      // Financial
      pricePerSqm: 0,
      charges: 0,
      propertyTax: 0,
      coOwnershipFees: 0,
      rentalYield: 0,
      cadastralIncome: 0,
      registrationFees: 0,
      notaryFees: 0,
      
      // Informations administratives
      permits: [],
      servitudes: '',
      zoning: 'residential',
      
      // Diagnostics spécifiques
      leadDiagnostic: false,
      termitesDiagnostic: false,
      noiseDiagnostic: false,
      
      // Informations pratiques
      accessibility: {
        publicTransport: '',
        schools: '',
        shops: '',
      },
      neighborhood: '',
      valueAppreciationPotential: '',
      
      // Informations supplémentaires utiles
      buildingName: '',
      floorDescription: '',
      exposureDetails: '',
      noiseLevel: 'quiet',
      proximityDetails: {
        metro: '',
        shops: '',
        schools: '',
        parks: '',
      },
      
      // Caractéristiques spéciales
      uniqueFeatures: '',
      renovationNeeds: '',
      investmentPotential: '',
      targetTenant: '',
      
      // Informations de gestion
      managementCompany: '',
      buildingAge: 0,
      lastRenovation: 0,
      futureWorks: '',
      
      // Media
      virtualTourUrl: '',
      plans: []
    });
  };

  // Handle authentication state
  if (!user) {
    return (
      <div className="project-detail">
        <div className="error-container">
          <h2>Authentification requise</h2>
          <p>Vous devez être connecté pour accéder aux détails du projet.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Handle loading states
  if (projectsLoading) {
    return (
      <div className="project-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  // Handle project not found
  if (!project && !projectsLoading) {
    return (
      <div className="project-detail">
        <div className="error-container">
          <h2>Projet non trouvé</h2>
          <p>Le projet demandé n'existe pas ou vous n'avez pas les permissions pour y accéder.</p>
          <button onClick={() => navigate('/projets')} className="btn-primary">
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Réservé';
      case 'sold': return 'Vendu';
      case 'rented': return 'Loué';
      default: return status;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'project-status-planning';
      case 'construction': return 'project-status-construction';
      case 'completed': return 'project-status-completed';
      case 'on_hold': return 'project-status-hold';
      default: return 'project-status-default';
    }
  };

  const getProjectStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planification';
      case 'construction': return 'Construction';
      case 'completed': return 'Terminé';
      case 'on_hold': return 'En attente';
      default: return status;
    }
  };

  const availableUnits = projectUnits.filter(unit => unit.availability === 'available').length;
  const totalValue = projectUnits.reduce((sum, unit) => sum + (unit.price || 0), 0);
  const averagePrice = projectUnits.length > 0 ? totalValue / projectUnits.length : 0;

  const handleCreateUnit = () => {
    resetNewUnit();
    // Ensure the unit is properly linked to the current project
    setNewUnit(prev => ({ 
      ...prev, 
      projectId: id,
      name: '',
      type: 'apartment',
      surface: 0,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      floor: 0,
      price: 0,
      description: '',
      availability: 'available',
      condition: 'good',
      orientation: 'south',
      images: [],
      documents: []
    }));
    setEditingUnit(null);
    setIsUnitModalOpen(true);
    console.log('Creating new unit for project:', id);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setNewUnit({
      name: unit.name,
      type: unit.type,
      surface: unit.surface,
      rooms: unit.rooms,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      floor: unit.floor,
      price: unit.price,
      description: unit.description || '',
      availability: unit.availability,
      condition: unit.condition,
      orientation: unit.orientation,
      
      // Identification complémentaire
      fullAddress: unit.fullAddress || '',
      country: unit.country || '',
      destination: unit.destination || 'habitation',
      hasElevator: unit.hasElevator || false,
      
      // Informations légales obligatoires
      propertyTitle: unit.propertyTitle || '',
      energyCertificate: unit.energyCertificate || '',
      electricalCompliance: unit.electricalCompliance || false,
      gasCompliance: unit.gasCompliance || false,
      urbanisticInfo: unit.urbanisticInfo || '',
      soilAttestation: unit.soilAttestation || false,
      asbestosCertificate: unit.asbestosCertificate || false,
      heatingCertificate: unit.heatingCertificate || false,
      cadastralPlan: unit.cadastralPlan || '',
      mortgageStatus: unit.mortgageStatus || '',
      
      // Informations pour location
      leaseType: unit.leaseType || 'residential',
      leaseDuration: unit.leaseDuration || '',
      securityDeposit: unit.securityDeposit || 0,
      leaseRegistered: unit.leaseRegistered || false,
      
      // Energy & Environment
      energyClass: unit.energyClass || 'not_specified',
      ghgEmissions: unit.ghgEmissions || 'not_specified',
      heatingType: unit.heatingType || 'gas',
      hotWaterSystem: unit.hotWaterSystem || 'gas',
      
      // Construction
      constructionYear: unit.constructionYear,
      renovationYear: unit.renovationYear,
      buildingMaterials: unit.buildingMaterials || '',
      roofType: unit.roofType || '',
      isolation: unit.isolation || {
        walls: false,
        roof: false,
        doubleGlazing: false
      },
      
      // Features
      balcony: unit.balcony || false,
      balconyArea: unit.balconyArea || 0,
      terrace: unit.terrace || false,
      terraceArea: unit.terraceArea || 0,
      garden: unit.garden || false,
      gardenArea: unit.gardenArea || 0,
      cellar: unit.cellar || false,
      attic: unit.attic || false,
      elevator: unit.elevator || false,
      parking: unit.parking || false,
      parkingSpaces: unit.parkingSpaces || 0,
      garage: unit.garage || false,
      
      // Amenities
      furnished: unit.furnished || false,
      kitchenType: unit.kitchenType || 'none',
      internetFiber: unit.internetFiber || false,
      airConditioning: unit.airConditioning || false,
      fireplace: unit.fireplace || false,
      swimmingPool: unit.swimmingPool || false,
      
      // Security & Access
      securitySystem: unit.securitySystem || false,
      intercom: unit.intercom || false,
      accessControl: unit.accessControl || false,
      concierge: unit.concierge || false,
      
      // Commercial specific
      commercialLicense: unit.commercialLicense || false,
      shopWindow: unit.shopWindow || false,
      storageRoom: unit.storageRoom || false,
      loadingDock: unit.loadingDock || false,
      
      // Financial
      pricePerSqm: unit.pricePerSqm || 0,
      charges: unit.charges || 0,
      propertyTax: unit.propertyTax || 0,
      coOwnershipFees: unit.coOwnershipFees || 0,
      rentalYield: unit.rentalYield || 0,
      cadastralIncome: unit.cadastralIncome || 0,
      registrationFees: unit.registrationFees || 0,
      notaryFees: unit.notaryFees || 0,
      
      // Informations administratives
      permits: unit.permits || [],
      servitudes: unit.servitudes || '',
      zoning: unit.zoning || 'residential',
      
      // Diagnostics spécifiques
      leadDiagnostic: unit.leadDiagnostic || false,
      termitesDiagnostic: unit.termitesDiagnostic || false,
      noiseDiagnostic: unit.noiseDiagnostic || false,
      
      // Informations pratiques
      accessibility: unit.accessibility || {
        publicTransport: '',
        schools: '',
        shops: ''
      },
      neighborhood: unit.neighborhood || '',
      valueAppreciationPotential: unit.valueAppreciationPotential || '',
      
      // Media
      images: unit.images || [],
      documents: unit.documents || [],
      virtualTourUrl: unit.virtualTourUrl || '',
      plans: unit.plans || []
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!user || !id) {
      console.error('Missing user or project ID');
      alert('Erreur: utilisateur ou projet non identifié');
      return;
    }
    
    // Validation des données obligatoires
    if (!newUnit.name || !newUnit.surface || !newUnit.price) {
      alert('Veuillez remplir au moins le nom, la surface et le prix de l\'unité');
      return;
    }
    
    try {
      // Prepare unit data with all required fields including new ones
      const unitData = {
        projectId: id,
        surface: Number(newUnit.surface) || 0,
        price: Number(newUnit.price) || 0,
        rooms: Number(newUnit.rooms) || 1,
        bedrooms: Number(newUnit.bedrooms) || 1,
        bathrooms: Number(newUnit.bathrooms) || 1,
        floor: Number(newUnit.floor) || 0,
        name: newUnit.name,
        type: newUnit.type || 'apartment',
        availability: newUnit.availability || 'available',
        condition: newUnit.condition || 'good',
        orientation: newUnit.orientation || 'south',
        description: newUnit.description || '',
        images: newUnit.images || [],
        documents: newUnit.documents || [],
        
        // Include all the new fields
        fullAddress: newUnit.fullAddress || '',
        country: newUnit.country || '',
        destination: newUnit.destination || 'habitation',
        hasElevator: newUnit.hasElevator || false,
        
        // Legal information
        propertyTitle: newUnit.propertyTitle || '',
        energyCertificate: newUnit.energyCertificate || '',
        electricalCompliance: newUnit.electricalCompliance || false,
        gasCompliance: newUnit.gasCompliance || false,
        urbanisticInfo: newUnit.urbanisticInfo || '',
        soilAttestation: newUnit.soilAttestation || false,
        asbestosCertificate: newUnit.asbestosCertificate || false,
        heatingCertificate: newUnit.heatingCertificate || false,
        cadastralPlan: newUnit.cadastralPlan || '',
        mortgageStatus: newUnit.mortgageStatus || '',
        
        // Rental information
        leaseType: newUnit.leaseType || 'residential',
        leaseDuration: newUnit.leaseDuration || '',
        securityDeposit: Number(newUnit.securityDeposit) || 0,
        leaseRegistered: newUnit.leaseRegistered || false,
        
        // Energy & Environment
        energyClass: newUnit.energyClass || 'not_specified',
        ghgEmissions: newUnit.ghgEmissions || 'not_specified',
        heatingType: newUnit.heatingType || 'gas',
        hotWaterSystem: newUnit.hotWaterSystem || 'gas',
        
        // Construction
        constructionYear: Number(newUnit.constructionYear) || 0,
        renovationYear: Number(newUnit.renovationYear) || 0,
        buildingMaterials: newUnit.buildingMaterials || '',
        roofType: newUnit.roofType || '',
        isolation: newUnit.isolation || { walls: false, roof: false, doubleGlazing: false },
        
        // Features
        balcony: newUnit.balcony || false,
        balconyArea: Number(newUnit.balconyArea) || 0,
        terrace: newUnit.terrace || false,
        terraceArea: Number(newUnit.terraceArea) || 0,
        garden: newUnit.garden || false,
        gardenArea: Number(newUnit.gardenArea) || 0,
        cellar: newUnit.cellar || false,
        attic: newUnit.attic || false,
        elevator: newUnit.elevator || false,
        parking: newUnit.parking || false,
        parkingSpaces: Number(newUnit.parkingSpaces) || 0,
        garage: newUnit.garage || false,
        
        // Amenities
        furnished: newUnit.furnished || false,
        kitchenType: newUnit.kitchenType || 'none',
        internetFiber: newUnit.internetFiber || false,
        airConditioning: newUnit.airConditioning || false,
        fireplace: newUnit.fireplace || false,
        swimmingPool: newUnit.swimmingPool || false,
        
        // Security & Access
        securitySystem: newUnit.securitySystem || false,
        intercom: newUnit.intercom || false,
        accessControl: newUnit.accessControl || false,
        concierge: newUnit.concierge || false,
        
        // Commercial specific
        commercialLicense: newUnit.commercialLicense || false,
        shopWindow: newUnit.shopWindow || false,
        storageRoom: newUnit.storageRoom || false,
        loadingDock: newUnit.loadingDock || false,
        
        // Financial
        propertyTax: Number(newUnit.propertyTax) || 0,
        coOwnershipFees: Number(newUnit.coOwnershipFees) || 0,
        rentalYield: Number(newUnit.rentalYield) || 0,
        cadastralIncome: Number(newUnit.cadastralIncome) || 0,
        registrationFees: Number(newUnit.registrationFees) || 0,
        notaryFees: Number(newUnit.notaryFees) || 0,
        
        // Administrative information
        permits: newUnit.permits || [],
        servitudes: newUnit.servitudes || '',
        zoning: newUnit.zoning || 'residential',
        
        // Specific diagnostics
        leadDiagnostic: newUnit.leadDiagnostic || false,
        termitesDiagnostic: newUnit.termitesDiagnostic || false,
        noiseDiagnostic: newUnit.noiseDiagnostic || false,
        
        // Practical information
        accessibility: newUnit.accessibility || { publicTransport: '', schools: '', shops: '' },
        neighborhood: newUnit.neighborhood || '',
        valueAppreciationPotential: newUnit.valueAppreciationPotential || '',
        
        // Additional useful information
        buildingName: newUnit.buildingName || '',
        floorDescription: newUnit.floorDescription || '',
        exposureDetails: newUnit.exposureDetails || '',
        noiseLevel: newUnit.noiseLevel || 'quiet',
        proximityDetails: newUnit.proximityDetails || { metro: '', shops: '', schools: '', parks: '' },
        uniqueFeatures: newUnit.uniqueFeatures || '',
        renovationNeeds: newUnit.renovationNeeds || '',
        investmentPotential: newUnit.investmentPotential || '',
        targetTenant: newUnit.targetTenant || '',
        managementCompany: newUnit.managementCompany || '',
        buildingAge: Number(newUnit.buildingAge) || 0,
        lastRenovation: Number(newUnit.lastRenovation) || 0,
        futureWorks: newUnit.futureWorks || '',
        
        // Media
        virtualTourUrl: newUnit.virtualTourUrl || '',
        plans: newUnit.plans || []
      };
      
      console.log('Saving unit with data:', unitData);
      console.log('Project ID being used:', id);
      
      if (editingUnit) {
        await updateUnit(editingUnit.id, unitData);
        console.log('Unit updated successfully');
      } else {
        const newUnitId = await addUnit(unitData as Omit<Unit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
        console.log('New unit created with ID:', newUnitId);
      }
      
      setIsUnitModalOpen(false);
      resetNewUnit();
      setEditingUnit(null);
      
      // Force refresh des données
      setTimeout(() => {
        fetchUnits();
      }, 500);
      
    } catch (error) {
      console.error('Error saving unit:', error);
      alert(`Erreur lors de la sauvegarde de l'unité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette unité ?')) return;
    
    try {
      await deleteUnit(unitId);
      // Units will be automatically refreshed by the hook
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Gallery handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && project?.id) {
      try {
        const uploadPromises = Array.from(files).map(file => 
          uploadProjectGalleryImage(file, project.id)
        );
        
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Add each image URL to the project in Firestore
        for (const imageUrl of uploadedUrls) {
          await addImageToProject(project.id, imageUrl);
        }
        
        setProjectImages(prev => [...prev, ...uploadedUrls]);
        console.log('Images uploaded and saved successfully:', uploadedUrls);
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('Erreur lors du téléchargement des images');
      }
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    if (confirm('Supprimer cette image ?')) {
      try {
        const imageUrl = projectImages[imageIndex];
        
        // Remove from Firestore
        await removeImageFromProject(project.id, imageUrl);
        
        // Remove from local state
        setProjectImages(prev => prev.filter((_, index) => index !== imageIndex));
        
        console.log('Image deleted successfully:', imageUrl);
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Erreur lors de la suppression de l\'image');
      }
    }
  };

  // Documents handlers
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date(),
          url: URL.createObjectURL(file) // In real app, upload to Firebase Storage
        };
        setProjectDocuments(prev => [...prev, newDoc]);
      });
    }
  };

  const handleDeleteDocument = (docId: number) => {
    if (confirm('Supprimer ce document ?')) {
      setProjectDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  // Project edit handlers
  const handleEditProject = () => {
    console.log('handleEditProject called, project:', project);
    console.log('Current isProjectModalOpen:', isProjectModalOpen);
    
    if (project) {
      console.log('Setting project form with data:', project);
      setProjectForm({
        name: project.name,
        description: project.description || '',
        type: project.type || 'building',
        address: project.address || '',
        city: project.city || '',
        postalCode: project.postalCode || '',
        status: project.status || 'planning',
        totalUnits: project.totalUnits || 0,
        budget: project.budget || 0,
        startDate: project.startDate ? (project.startDate instanceof Date ? project.startDate.toISOString().split('T')[0] : new Date(project.startDate).toISOString().split('T')[0]) : '',
        endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate.toISOString().split('T')[0] : new Date(project.endDate).toISOString().split('T')[0]) : '',
        mainImage: project.mainImage || ''
      });
      
      console.log('Opening modal...');
      setIsProjectModalOpen(true);
      console.log('Modal should be open now');
    } else {
      console.log('No project found');
    }
  };

  const handleSaveProject = async () => {
    if (!projectForm.name.trim() || !projectForm.address.trim()) {
      alert('Veuillez remplir au moins le nom et l\'adresse du projet');
      return;
    }

    try {
      const updateData = {
        ...projectForm,
        startDate: projectForm.startDate ? new Date(projectForm.startDate) : undefined,
        endDate: projectForm.endDate ? new Date(projectForm.endDate) : undefined,
        mainImage: projectForm.mainImage
      };

      await updateProject(project.id, updateData);
      setIsProjectModalOpen(false);
      
      // Refresh project data
      const updatedProject = projects.find(p => p.id === project.id);
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde du projet');
    }
  };

  if (projectsLoading || unitsLoading) {
    return (
      <div className="project-detail">
        <div className="loading-state">
          <p>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="project-detail-header">
        <div className="header-top">
          <button 
            className="back-button"
            onClick={() => navigate('/projets')}
          >
            <ArrowLeft size={20} />
            Retour aux projets
          </button>
          
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked!');
                handleEditProject();
              }}
            >
              <Edit size={16} />
              Modifier le projet
            </button>
            <button className="btn-primary" onClick={handleCreateUnit}>
              <Plus size={16} />
              Ajouter unité
            </button>
          </div>
        </div>
        
        <div className="project-hero">
          {project?.mainImage ? (
            <div className="project-hero-image">
              <img src={project.mainImage} alt={project.name} />
            </div>
          ) : (
            <div className="project-icon">
              <Building2 size={40} />
            </div>
          )}
          <div className="project-main-info">
            <h1>{project?.name || 'Projet sans nom'}</h1>
            <div className="project-meta">
              <div className="project-location">
                <MapPin size={18} />
                <span>{project?.address || 'Adresse non définie'}, {project?.city || 'Ville non définie'}</span>
              </div>
              <div className="project-status">
                <span className={`status-badge-large ${getProjectStatusColor(project?.status || 'planning')}`}>
                  {getProjectStatusLabel(project?.status || 'planning')}
                </span>
              </div>
            </div>
            {project?.description && (
              <p className="project-description">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="project-quick-stats">
        <div className="quick-stat">
          <div className="quick-stat-icon home">
            <Home size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{projectUnits.length}</span>
            <span className="quick-stat-label">Unités</span>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-icon available">
            <Users size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{availableUnits}</span>
            <span className="quick-stat-label">Disponibles</span>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-icon value">
            <Euro size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{(totalValue / 1000000).toFixed(1)}M€</span>
            <span className="quick-stat-label">Valeur totale</span>
          </div>
        </div>
        
        <div className="quick-stat">
          <div className="quick-stat-icon average">
            <Calendar size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{(averagePrice / 1000).toFixed(0)}k€</span>
            <span className="quick-stat-label">Prix moyen</span>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="project-navigation">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'units' ? 'active' : ''}`}
            onClick={() => setActiveTab('units')}
          >
            <Home size={18} />
            <span>Unités</span>
            <span className="tab-count">{projectUnits.length}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Building2 size={18} />
            <span>Vue d'ensemble</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <Image size={18} />
            <span>Galerie</span>
            <span className="tab-count">{projectImages.length}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={18} />
            <span>Documents</span>
            <span className="tab-count">{projectDocuments.length}</span>
          </button>
        </div>
        
        
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-section">
                <h3>Description du projet</h3>
                <p>{project?.description || 'Aucune description disponible.'}</p>
                
                <h3>Informations générales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Type de projet</label>
                    <span>{project?.type === 'building' ? 'Immeuble' : (project?.type || 'Non spécifié')}</span>
                  </div>
                  <div className="info-item">
                    <label>Nombre d'unités prévues</label>
                    <span>{project?.totalUnits || projectUnits.length || 'Non spécifié'}</span>
                  </div>
                  <div className="info-item">
                    <label>Date de début</label>
                    <span>{project?.startDate ? (
                      project.startDate.toDate ? 
                        new Date(project.startDate.toDate()).toLocaleDateString() : 
                        new Date(project.startDate).toLocaleDateString()
                    ) : 'Non définie'}</span>
                  </div>
                  <div className="info-item">
                    <label>Date de fin prévue</label>
                    <span>{project?.endDate ? (
                      project.endDate.toDate ? 
                        new Date(project.endDate.toDate()).toLocaleDateString() : 
                        new Date(project.endDate).toLocaleDateString()
                    ) : 'Non définie'}</span>
                  </div>
                  <div className="info-item">
                    <label>Budget total</label>
                    <span>{project?.budget ? `${project.budget.toLocaleString()} €` : 'Non défini'}</span>
                  </div>
                  <div className="info-item">
                    <label>Surface totale</label>
                    <span>{project?.totalSurface ? `${project.totalSurface} m²` : 
                      (projectUnits.reduce((sum, unit) => sum + (unit.surface || 0), 0) > 0 ? 
                        `${projectUnits.reduce((sum, unit) => sum + (unit.surface || 0), 0)} m²` : 
                        'Non définie')}</span>
                  </div>
                </div>
              </div>

              <div className="overview-section">
                <h3>Répartition des unités</h3>
                <div className="units-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Disponibles</span>
                    <span className="breakdown-value available">{availableUnits}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Réservées</span>
                    <span className="breakdown-value reserved">
                      {projectUnits.filter(u => u.availability === 'reserved').length}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Vendues</span>
                    <span className="breakdown-value sold">
                      {projectUnits.filter(u => u.availability === 'sold').length}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Louées</span>
                    <span className="breakdown-value rented">
                      {projectUnits.filter(u => u.availability === 'rented').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="units-content">
            <div className="units-header">
              <div className="units-title-section">
              <h3>Unités du projet ({projectUnits.length})</h3>
              <div className="units-summary">
                <span className="summary-item available">
                  <span className="summary-dot"></span>
                  {availableUnits} disponibles
                </span>
                <span className="summary-item reserved">
                  <span className="summary-dot"></span>
                  {projectUnits.filter(u => u.availability === 'reserved').length} réservées
                </span>
                <span className="summary-item sold">
                  <span className="summary-dot"></span>
                  {projectUnits.filter(u => u.availability === 'sold').length} vendues
                </span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleCreateUnit}>
              <Plus size={16} />
              Ajouter une unité
            </button>
          </div>
            
            {unitsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des unités...</p>
              </div>
            ) : projectUnits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Home size={48} />
                </div>
                <h3>Aucune unité dans ce projet</h3>
                <p>Commencez par ajouter votre première unité à ce projet.</p>
                <button className="btn-primary" onClick={handleCreateUnit}>
                  <Plus size={16} />
                  Ajouter une unité
                </button>
              </div>
            ) : (
              <div className="units-showcase">
                <div className="units-grid-enhanced">
                  {projectUnits.map((unit) => (
                    <div key={unit.id} className="unit-block">
                      <div className="unit-block-header">
                        {unit.images && unit.images.length > 0 ? (
                          <div className="unit-image">
                            <img src={unit.images[0]} alt={unit.name} />
                          </div>
                        ) : (
                          <div className="unit-image-placeholder">
                            <div className="unit-type-badge">
                              {unit.type === 'apartment' ? '🏠' : 
                               unit.type === 'house' ? '🏡' : 
                               unit.type === 'commercial' ? '🏢' :
                               unit.type === 'office' ? '🏢' :
                               unit.type === 'retail' ? '🏪' :
                               unit.type === 'storage' ? '📦' :
                               unit.type === 'parking' ? '🚗' :
                               unit.type === 'land' ? '🌍' : '🏠'}
                            </div>
                          </div>
                        )}
                        <div className="unit-status-indicator">
                          <span className={`status-dot ${getStatusColor(unit.availability)}`}></span>
                        </div>
                      </div>
                      
                      <div className="unit-block-content">
                        <div className="unit-title">
                          <h4>{unit.name}</h4>
                          <span className={`status-badge-modern ${getStatusColor(unit.availability)}`}>
                            {getStatusLabel(unit.availability)}
                          </span>
                        </div>
                        
                        <div className="unit-type-label">
                          {unit.type === 'apartment' ? 'Appartement' : 
                           unit.type === 'house' ? 'Maison' : 
                           unit.type === 'commercial' ? 'Commercial' :
                           unit.type === 'office' ? 'Bureau' :
                           unit.type === 'retail' ? 'Commerce' :
                           unit.type === 'storage' ? 'Stockage' :
                           unit.type === 'parking' ? 'Parking' :
                           unit.type === 'land' ? 'Terrain' : unit.type}
                        </div>
                        
                        <div className="unit-price-section">
                          <div className="main-price">{unit.price?.toLocaleString()}€</div>
                          <div className="price-per-sqm">
                            {unit.surface && unit.price ? 
                              `${Math.round(unit.price / unit.surface).toLocaleString()}€/m²` : 
                              ''
                            }
                          </div>
                        </div>
                        
                        <div className="unit-specs-modern">
                          <div className="spec-item-modern">
                            <Home size={18} />
                            <span>{unit.surface}m²</span>
                          </div>
                          {unit.rooms && (
                            <div className="spec-item-modern">
                              <span className="spec-icon">🏠</span>
                              <span>{unit.rooms}P</span>
                            </div>
                          )}
                          {unit.bedrooms && (
                            <div className="spec-item-modern">
                              <Bed size={18} />
                              <span>{unit.bedrooms}</span>
                            </div>
                          )}
                          {unit.bathrooms && (
                            <div className="spec-item-modern">
                              <Bath size={18} />
                              <span>{unit.bathrooms}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="unit-details-row">
                          {unit.floor !== undefined && (
                            <div className="detail-item">
                              <Building2 size={14} />
                              <span>Étage {unit.floor}</span>
                            </div>
                          )}
                          {unit.orientation && (
                            <div className="detail-item">
                              <Compass size={14} />
                              <span>{unit.orientation}</span>
                            </div>
                          )}
                        </div>
                        
                        {unit.description && (
                          <div className="unit-description-preview">
                            <p>
                              {unit.description.length > 80 
                                ? `${unit.description.substring(0, 80)}...`
                                : unit.description
                              }
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="unit-block-actions">
                        <button 
                          className="btn-view-details"
                          onClick={() => navigate(`/units/${unit.id}`)}
                        >
                          <Eye size={16} />
                          Voir détails
                        </button>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon"
                            onClick={() => handleEditUnit(unit)}
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn-icon danger"
                            onClick={() => handleDeleteUnit(unit.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-content">
            <div className="gallery-header">
              <h3>Galerie photos ({projectImages.length})</h3>
              <div className="gallery-actions">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn-primary"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Plus size={16} />
                  Ajouter des photos
                </button>
              </div>
            </div>
            
            {projectImages.length === 0 ? (
              <div className="gallery-placeholder">
                <Image size={48} />
                <h3>Aucune photo</h3>
                <p>Ajoutez des photos pour présenter votre projet.</p>
              </div>
            ) : (
              <div className="gallery-grid">
                {projectImages.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={image} 
                      alt={`Photo ${index + 1}`}
                      onClick={() => {
                        setSelectedImage(image);
                        setIsImageModalOpen(true);
                      }}
                    />
                    <div className="gallery-item-overlay">
                      <button 
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteImage(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-content">
            <div className="documents-header">
              <h3>Documents du projet ({projectDocuments.length})</h3>
              <div className="documents-actions">
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn-primary"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  <Plus size={16} />
                  Ajouter des documents
                </button>
              </div>
            </div>
            
            {projectDocuments.length === 0 ? (
              <div className="documents-placeholder">
                <FileText size={48} />
                <h3>Aucun document</h3>
                <p>Ajoutez des documents (plans, contrats, etc.) pour ce projet.</p>
              </div>
            ) : (
              <div className="documents-list">
                {projectDocuments.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="document-icon">
                      <FileText size={24} />
                    </div>
                    <div className="document-info">
                      <h4>{doc.name}</h4>
                      <div className="document-meta">
                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.uploadDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        Ouvrir
                      </button>
                      <button 
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Edit Modal */}
      {isProjectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Modifier le projet</h3>
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
                  <option value="complex">Complexe</option>
                  <option value="land">Terrain</option>
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
                  placeholder="Adresse"
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
                <label>Statut</label>
                <select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="planning">Planification</option>
                  <option value="construction">Construction</option>
                  <option value="completed">Terminé</option>
                  <option value="on_hold">En attente</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nombre d'unités prévues</label>
                <input
                  type="number"
                  value={projectForm.totalUnits}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, totalUnits: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Budget (€)</label>
                <input
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="form-group full-width">
                <label>Image du projet</label>
                <ImageUpload
                  value={projectForm.mainImage}
                  onChange={(imageUrl: string) => setProjectForm(prev => ({ ...prev, mainImage: imageUrl }))}
                  onRemove={() => setProjectForm(prev => ({ ...prev, mainImage: '' }))}
                  projectId={project?.id}
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
              Modifier
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Unit Modal */}
      {isUnitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUnitModalOpen(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUnit ? 'Modifier l\'unité' : 'Nouvelle unité'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setIsUnitModalOpen(false);
                  setEditingUnit(null);
                  resetNewUnit();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-sections">
                {/* Section 1: Informations de base */}
                <div className="form-section">
                  <h4>Informations de base</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom de l'unité *</label>
                      <input
                        type="text"
                        value={newUnit.name || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Appartement A1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={newUnit.type || 'apartment'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, type: e.target.value as Unit['type'] }))}
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
                      <label>Destination</label>
                      <select
                        value={newUnit.destination || 'habitation'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, destination: e.target.value as 'habitation' | 'commerce' | 'mixte' }))}
                      >
                        <option value="habitation">Habitation</option>
                        <option value="commerce">Commerce</option>
                        <option value="mixte">Mixte</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Adresse complète</label>
                      <input
                        type="text"
                        value={newUnit.fullAddress || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, fullAddress: e.target.value }))}
                        placeholder="Adresse complète de l'unité"
                      />
                    </div>

                    <div className="form-group">
                      <label>Pays</label>
                      <input
                        type="text"
                        value={newUnit.country || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Belgique"
                      />
                    </div>

                    <div className="form-group">
                      <label>Surface (m²) *</label>
                      <input
                        type="number"
                        value={newUnit.surface || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, surface: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Nombre de pièces</label>
                      <input
                        type="number"
                        value={newUnit.rooms || 1}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, rooms: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Chambres</label>
                      <input
                        type="number"
                        value={newUnit.bedrooms || 1}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 1 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Salles de bain</label>
                      <input
                        type="number"
                        value={newUnit.bathrooms || 1}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 1 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Étage</label>
                      <input
                        type="number"
                        value={newUnit.floor || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, floor: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Disponibilité</label>
                      <select
                        value={newUnit.availability || 'available'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, availability: e.target.value as Unit['availability'] }))}
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
                        value={newUnit.condition || 'good'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, condition: e.target.value as Unit['condition'] }))}
                      >
                        <option value="new">Neuf</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Bon</option>
                        <option value="to_renovate">À rénover</option>
                        <option value="to_demolish">À démolir</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Année de construction</label>
                      <input
                        type="number"
                        value={newUnit.constructionYear || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, constructionYear: parseInt(e.target.value) || undefined }))}
                        min="1800"
                        max="2030"
                      />
                    </div>

                    <div className="form-group">
                      <label>Année de rénovation</label>
                      <input
                        type="number"
                        value={newUnit.renovationYear || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, renovationYear: parseInt(e.target.value) || undefined }))}
                        min="1800"
                        max="2030"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        value={newUnit.description || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description détaillée du bien..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations légales */}
                <div className="form-section">
                  <h4>Informations légales obligatoires</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Titre de propriété</label>
                      <input
                        type="text"
                        value={newUnit.propertyTitle || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, propertyTitle: e.target.value }))}
                        placeholder="Référence du titre de propriété"
                      />
                    </div>

                    <div className="form-group">
                      <label>Certificat énergétique (PEB/DPE)</label>
                      <input
                        type="text"
                        value={newUnit.energyCertificate || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, energyCertificate: e.target.value }))}
                        placeholder="Référence du certificat"
                      />
                    </div>

                    <div className="form-group">
                      <label>Classe énergétique</label>
                      <select
                        value={newUnit.energyClass || 'not_specified'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, energyClass: e.target.value as Unit['energyClass'] }))}
                      >
                        <option value="not_specified">Non spécifié</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Émissions GES</label>
                      <select
                        value={newUnit.ghgEmissions || 'not_specified'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, ghgEmissions: e.target.value as Unit['ghgEmissions'] }))}
                      >
                        <option value="not_specified">Non spécifié</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Renseignements urbanistiques</label>
                      <input
                        type="text"
                        value={newUnit.urbanisticInfo || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, urbanisticInfo: e.target.value }))}
                        placeholder="Informations urbanistiques"
                      />
                    </div>

                    <div className="form-group">
                      <label>Zonage</label>
                      <select
                        value={newUnit.zoning || 'residential'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, zoning: e.target.value as Unit['zoning'] }))}
                      >
                        <option value="residential">Résidentiel</option>
                        <option value="commercial">Commercial</option>
                        <option value="mixed">Mixte</option>
                        <option value="industrial">Industriel</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Plan cadastral</label>
                      <input
                        type="text"
                        value={newUnit.cadastralPlan || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, cadastralPlan: e.target.value }))}
                        placeholder="Référence du plan cadastral"
                      />
                    </div>

                    <div className="form-group">
                      <label>État des hypothèques</label>
                      <input
                        type="text"
                        value={newUnit.mortgageStatus || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, mortgageStatus: e.target.value }))}
                        placeholder="État des hypothèques"
                      />
                    </div>

                    <div className="form-group">
                      <label>Servitudes</label>
                      <textarea
                        value={newUnit.servitudes || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, servitudes: e.target.value }))}
                        placeholder="Servitudes éventuelles"
                        rows={2}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.electricalCompliance || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, electricalCompliance: e.target.checked }))}
                        />
                        Conformité électrique
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.gasCompliance || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, gasCompliance: e.target.checked }))}
                        />
                        Conformité gaz
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.heatingCertificate || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, heatingCertificate: e.target.checked }))}
                        />
                        Certificat installation chauffage
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.soilAttestation || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, soilAttestation: e.target.checked }))}
                        />
                        Attestation du sol
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.asbestosCertificate || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, asbestosCertificate: e.target.checked }))}
                        />
                        Certificat d'amiante
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.leadDiagnostic || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, leadDiagnostic: e.target.checked }))}
                        />
                        Diagnostic plomb
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.termitesDiagnostic || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, termitesDiagnostic: e.target.checked }))}
                        />
                        Diagnostic termites
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.noiseDiagnostic || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, noiseDiagnostic: e.target.checked }))}
                        />
                        Diagnostic bruit
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 3: Caractéristiques techniques */}
                <div className="form-section">
                  <h4>Caractéristiques techniques</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Type de chauffage</label>
                      <select
                        value={newUnit.heatingType || 'gas'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, heatingType: e.target.value as Unit['heatingType'] }))}
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
                      <label>Système eau chaude</label>
                      <select
                        value={newUnit.hotWaterSystem || 'gas'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, hotWaterSystem: e.target.value as Unit['hotWaterSystem'] }))}
                      >
                        <option value="gas">Gaz</option>
                        <option value="electric">Électrique</option>
                        <option value="solar">Solaire</option>
                        <option value="heat_pump">Pompe à chaleur</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Orientation</label>
                      <select
                        value={newUnit.orientation || 'south'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, orientation: e.target.value as Unit['orientation'] }))}
                      >
                        <option value="north">Nord</option>
                        <option value="south">Sud</option>
                        <option value="east">Est</option>
                        <option value="west">Ouest</option>
                        <option value="north_south">Nord-Sud</option>
                        <option value="east_west">Est-Ouest</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Matériaux de construction</label>
                      <input
                        type="text"
                        value={newUnit.buildingMaterials || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, buildingMaterials: e.target.value }))}
                        placeholder="Brique, béton, bois..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Type de toiture</label>
                      <input
                        type="text"
                        value={newUnit.roofType || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, roofType: e.target.value }))}
                        placeholder="Tuiles, ardoises, tôle..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Type de cuisine</label>
                      <select
                        value={newUnit.kitchenType || 'none'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, kitchenType: e.target.value as Unit['kitchenType'] }))}
                      >
                        <option value="none">Aucune</option>
                        <option value="kitchenette">Kitchenette</option>
                        <option value="open">Ouverte</option>
                        <option value="closed">Fermée</option>
                        <option value="american">Américaine</option>
                      </select>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.isolation?.walls || false}
                          onChange={(e) => setNewUnit(prev => ({ 
                            ...prev, 
                            isolation: { ...prev.isolation, walls: e.target.checked }
                          }))}
                        />
                        Isolation des murs
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.isolation?.roof || false}
                          onChange={(e) => setNewUnit(prev => ({ 
                            ...prev, 
                            isolation: { ...prev.isolation, roof: e.target.checked }
                          }))}
                        />
                        Isolation de la toiture
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.isolation?.doubleGlazing || false}
                          onChange={(e) => setNewUnit(prev => ({ 
                            ...prev, 
                            isolation: { ...prev.isolation, doubleGlazing: e.target.checked }
                          }))}
                        />
                        Double vitrage
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.hasElevator || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, hasElevator: e.target.checked }))}
                        />
                        Ascenseur dans l'immeuble
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.internetFiber || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, internetFiber: e.target.checked }))}
                        />
                        Fibre optique
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.airConditioning || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, airConditioning: e.target.checked }))}
                        />
                        Climatisation
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 4: Informations financières */}
                <div className="form-section">
                  <h4>Informations financières</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Prix (€) *</label>
                      <input
                        type="number"
                        value={newUnit.price || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Prix au m² (€)</label>
                      <input
                        type="number"
                        value={newUnit.pricePerSqm || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, pricePerSqm: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Charges (€/mois)</label>
                      <input
                        type="number"
                        value={newUnit.charges || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, charges: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Taxe foncière (€/an)</label>
                      <input
                        type="number"
                        value={newUnit.propertyTax || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, propertyTax: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Charges copropriété (€/mois)</label>
                      <input
                        type="number"
                        value={newUnit.coOwnershipFees || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, coOwnershipFees: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Rendement locatif (%)</label>
                      <input
                        type="number"
                        value={newUnit.rentalYield || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, rentalYield: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Revenu cadastral (€)</label>
                      <input
                        type="number"
                        value={newUnit.cadastralIncome || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, cadastralIncome: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Droits d'enregistrement (€)</label>
                      <input
                        type="number"
                        value={newUnit.registrationFees || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, registrationFees: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Frais de notaire (€)</label>
                      <input
                        type="number"
                        value={newUnit.notaryFees || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, notaryFees: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Caractéristiques et équipements */}
                <div className="form-section">
                  <h4>Caractéristiques et équipements</h4>
                  <div className="form-grid">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.balcony || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, balcony: e.target.checked }))}
                        />
                        Balcon
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Surface balcon (m²)</label>
                      <input
                        type="number"
                        value={newUnit.balconyArea || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, balconyArea: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.1"
                        disabled={!newUnit.balcony}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.terrace || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, terrace: e.target.checked }))}
                        />
                        Terrasse
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Surface terrasse (m²)</label>
                      <input
                        type="number"
                        value={newUnit.terraceArea || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, terraceArea: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.1"
                        disabled={!newUnit.terrace}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.garden || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, garden: e.target.checked }))}
                        />
                        Jardin
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Surface jardin (m²)</label>
                      <input
                        type="number"
                        value={newUnit.gardenArea || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, gardenArea: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.1"
                        disabled={!newUnit.garden}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.parking || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, parking: e.target.checked }))}
                        />
                        Parking
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Nombre de places de parking</label>
                      <input
                        type="number"
                        value={newUnit.parkingSpaces || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, parkingSpaces: parseInt(e.target.value) || 0 }))}
                        min="0"
                        disabled={!newUnit.parking}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.garage || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, garage: e.target.checked }))}
                        />
                        Garage
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.cellar || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, cellar: e.target.checked }))}
                        />
                        Cave
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.attic || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, attic: e.target.checked }))}
                        />
                        Grenier
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.furnished || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, furnished: e.target.checked }))}
                        />
                        Meublé
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.fireplace || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, fireplace: e.target.checked }))}
                        />
                        Cheminée
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.swimmingPool || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, swimmingPool: e.target.checked }))}
                        />
                        Piscine
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.securitySystem || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, securitySystem: e.target.checked }))}
                        />
                        Système de sécurité
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.intercom || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, intercom: e.target.checked }))}
                        />
                        Interphone
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.concierge || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, concierge: e.target.checked }))}
                        />
                        Concierge
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 6: Informations pour location */}
                <div className="form-section">
                  <h4>Informations pour location</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Type de bail</label>
                      <select
                        value={newUnit.leaseType || 'residential'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, leaseType: e.target.value as Unit['leaseType'] }))}
                      >
                        <option value="residential">Résidentiel</option>
                        <option value="student">Étudiant</option>
                        <option value="commercial">Commercial</option>
                        <option value="short_term">Court terme</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Durée du bail</label>
                      <input
                        type="text"
                        value={newUnit.leaseDuration || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, leaseDuration: e.target.value }))}
                        placeholder="Ex: 3 ans, 9 ans"
                      />
                    </div>

                    <div className="form-group">
                      <label>Garantie locative (€)</label>
                      <input
                        type="number"
                        value={newUnit.securityDeposit || 0}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, securityDeposit: parseFloat(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newUnit.leaseRegistered || false}
                          onChange={(e) => setNewUnit(prev => ({ ...prev, leaseRegistered: e.target.checked }))}
                        />
                        Bail enregistré
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 7: Informations pratiques */}
                <div className="form-section">
                  <h4>Informations pratiques</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Type de quartier</label>
                      <input
                        type="text"
                        value={newUnit.neighborhood || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, neighborhood: e.target.value }))}
                        placeholder="Résidentiel, commercial, mixte..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Transports publics</label>
                      <input
                        type="text"
                        value={newUnit.accessibility?.publicTransport || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          accessibility: { 
                            ...prev.accessibility, 
                            publicTransport: e.target.value 
                          }
                        }))}
                        placeholder="Métro, bus, tram à proximité"
                      />
                    </div>

                    <div className="form-group">
                      <label>Écoles</label>
                      <input
                        type="text"
                        value={newUnit.accessibility?.schools || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          accessibility: { 
                            ...prev.accessibility, 
                            schools: e.target.value 
                          }
                        }))}
                        placeholder="Écoles à proximité"
                      />
                    </div>

                    <div className="form-group">
                      <label>Commerces</label>
                      <input
                        type="text"
                        value={newUnit.accessibility?.shops || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          accessibility: { 
                            ...prev.accessibility, 
                            shops: e.target.value 
                          }
                        }))}
                        placeholder="Commerces et services à proximité"
                      />
                    </div>

                    <div className="form-group">
                      <label>Potentiel de valorisation</label>
                      <textarea
                        value={newUnit.valueAppreciationPotential || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, valueAppreciationPotential: e.target.value }))}
                        placeholder="Projets urbains, développements futurs..."
                        rows={2}
                      />
                    </div>

                    <div className="form-group">
                      <label>URL visite virtuelle</label>
                      <input
                        type="url"
                        value={newUnit.virtualTourUrl || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, virtualTourUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 8: Informations supplémentaires utiles */}
                <div className="form-section">
                  <h4>Informations supplémentaires</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom de l'immeuble/résidence</label>
                      <input
                        type="text"
                        value={newUnit.buildingName || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, buildingName: e.target.value }))}
                        placeholder="Résidence Les Jardins"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description de l'étage</label>
                      <input
                        type="text"
                        value={newUnit.floorDescription || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, floorDescription: e.target.value }))}
                        placeholder="Rez-de-chaussée, 1er étage, dernier étage..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Niveau sonore</label>
                      <select
                        value={newUnit.noiseLevel || 'quiet'}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, noiseLevel: e.target.value as 'very_quiet' | 'quiet' | 'moderate' | 'noisy' }))}
                      >
                        <option value="very_quiet">Très calme</option>
                        <option value="quiet">Calme</option>
                        <option value="moderate">Modéré</option>
                        <option value="noisy">Bruyant</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Âge du bâtiment (années)</label>
                      <input
                        type="number"
                        value={newUnit.buildingAge || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, buildingAge: parseInt(e.target.value) || 0 }))}
                        min="0"
                        placeholder="15"
                      />
                    </div>

                    <div className="form-group">
                      <label>Dernière rénovation</label>
                      <input
                        type="number"
                        value={newUnit.lastRenovation || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, lastRenovation: parseInt(e.target.value) || 0 }))}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="2020"
                      />
                    </div>

                    <div className="form-group">
                      <label>Société de gestion/Syndic</label>
                      <input
                        type="text"
                        value={newUnit.managementCompany || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, managementCompany: e.target.value }))}
                        placeholder="Nom du syndic"
                      />
                    </div>

                    <div className="form-group">
                      <label>Distance métro/tram</label>
                      <input
                        type="text"
                        value={newUnit.proximityDetails?.metro || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          proximityDetails: { 
                            ...prev.proximityDetails, 
                            metro: e.target.value 
                          }
                        }))}
                        placeholder="5 min à pied"
                      />
                    </div>

                    <div className="form-group">
                      <label>Commerces à proximité</label>
                      <input
                        type="text"
                        value={newUnit.proximityDetails?.shops || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          proximityDetails: { 
                            ...prev.proximityDetails, 
                            shops: e.target.value 
                          }
                        }))}
                        placeholder="Supermarché, pharmacie..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Écoles proches</label>
                      <input
                        type="text"
                        value={newUnit.proximityDetails?.schools || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          proximityDetails: { 
                            ...prev.proximityDetails, 
                            schools: e.target.value 
                          }
                        }))}
                        placeholder="École primaire à 200m"
                      />
                    </div>

                    <div className="form-group">
                      <label>Parcs et espaces verts</label>
                      <input
                        type="text"
                        value={newUnit.proximityDetails?.parks || ''}
                        onChange={(e) => setNewUnit(prev => ({ 
                          ...prev, 
                          proximityDetails: { 
                            ...prev.proximityDetails, 
                            parks: e.target.value 
                          }
                        }))}
                        placeholder="Parc municipal à 300m"
                      />
                    </div>

                    <div className="form-group">
                      <label>Locataire type visé</label>
                      <input
                        type="text"
                        value={newUnit.targetTenant || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, targetTenant: e.target.value }))}
                        placeholder="Famille, étudiant, professionnel..."
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Détails exposition (vue, luminosité)</label>
                      <textarea
                        value={newUnit.exposureDetails || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, exposureDetails: e.target.value }))}
                        placeholder="Vue sur jardin, très lumineux, exposition sud..."
                        rows={2}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Caractéristiques uniques</label>
                      <textarea
                        value={newUnit.uniqueFeatures || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, uniqueFeatures: e.target.value }))}
                        placeholder="Plafonds hauts, poutres apparentes, cheminée d'époque..."
                        rows={2}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Travaux nécessaires</label>
                      <textarea
                        value={newUnit.renovationNeeds || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, renovationNeeds: e.target.value }))}
                        placeholder="Rafraîchissement peinture, rénovation salle de bain..."
                        rows={2}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Potentiel d'investissement</label>
                      <textarea
                        value={newUnit.investmentPotential || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, investmentPotential: e.target.value }))}
                        placeholder="Quartier en développement, plus-value attendue..."
                        rows={2}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Travaux prévus dans l'immeuble</label>
                      <textarea
                        value={newUnit.futureWorks || ''}
                        onChange={(e) => setNewUnit(prev => ({ ...prev, futureWorks: e.target.value }))}
                        placeholder="Rénovation façade prévue en 2025..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Images de l'unité</label>
                  <div className="image-gallery">
                    {newUnit.images?.map((image, index) => (
                      <div key={index} className="image-item">
                        <img src={image} alt={`Unité ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={async () => {
                            const imageToRemove = newUnit.images?.[index];
                            const updatedImages = newUnit.images?.filter((_, i) => i !== index) || [];
                            setNewUnit(prev => ({ ...prev, images: updatedImages }));
                            
                            // If editing an existing unit and removing from Firestore
                            if (editingUnit?.id && imageToRemove) {
                              try {
                                await removeImageFromUnit(editingUnit.id, imageToRemove);
                              } catch (error) {
                                console.error('Error removing image from unit:', error);
                              }
                            }
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <ImageUpload
                      onChange={async (imageUrl) => {
                        const currentImages = newUnit.images || [];
                        const updatedImages = [...currentImages, imageUrl];
                        setNewUnit(prev => ({ ...prev, images: updatedImages }));
                        
                        // If editing an existing unit, also update Firestore
                        if (editingUnit?.id) {
                          try {
                            await addImageToUnit(editingUnit.id, imageUrl);
                          } catch (error) {
                            console.error('Error adding image to unit:', error);
                          }
                        }
                      }}
                      onRemove={() => {}}
                      placeholder="Ajouter une image"
                      unitId={editingUnit?.id || 'temp'}
                      isGallery={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setIsUnitModalOpen(false);
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
                {editingUnit ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="modal-overlay" onClick={() => setIsImageModalOpen(false)}>
          <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Aperçu de l'image</h3>
              <button 
                className="modal-close"
                onClick={() => setIsImageModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <img src={selectedImage} alt="Aperçu" className="modal-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
