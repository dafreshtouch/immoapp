import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, Download, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { WorkCalculator } from '../components/WorkCalculator';
import './HomeStaging.css';

interface MaterialPrice {
  id: string;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  description?: string;
}

interface WorkItem {
  id: string;
  room: string;
  category: string;
  description: string;
  surface: number;
  materialId: string;
  materialPrice: number;
  laborHours: number;
  laborRate: number;
  totalMaterial: number;
  totalLabor: number;
  total: number;
}

interface Project {
  id: string;
  name: string;
  propertyType: string;
  totalSurface: number;
  rooms: string[];
  workItems: WorkItem[];
  totalMaterials: number;
  totalLabor: number;
  totalCost: number;
  margin: number;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const MATERIAL_DATABASE: MaterialPrice[] = [
  // Peinture
  { id: '1', name: 'Peinture acrylique standard', category: 'Peinture', unit: 'm²', pricePerUnit: 8.50, description: 'Peinture murale blanche ou couleur' },
  { id: '2', name: 'Peinture glycéro haut de gamme', category: 'Peinture', unit: 'm²', pricePerUnit: 12.00, description: 'Peinture lessivable premium' },
  { id: '3', name: 'Sous-couche universelle', category: 'Peinture', unit: 'm²', pricePerUnit: 6.00, description: 'Préparation avant peinture' },
  { id: '4', name: 'Peinture magnétique', category: 'Peinture', unit: 'm²', pricePerUnit: 18.50, description: 'Peinture aimantée pour murs créatifs' },
  { id: '5', name: 'Peinture ardoise', category: 'Peinture', unit: 'm²', pricePerUnit: 16.00, description: 'Peinture tableau noir' },
  { id: '6', name: 'Peinture anti-humidité', category: 'Peinture', unit: 'm²', pricePerUnit: 14.50, description: 'Peinture spéciale pièces humides' },
  
  // Revêtements sol
  { id: '7', name: 'Parquet stratifié', category: 'Sol', unit: 'm²', pricePerUnit: 25.00, description: 'Stratifié aspect bois' },
  { id: '8', name: 'Parquet massif chêne', category: 'Sol', unit: 'm²', pricePerUnit: 65.00, description: 'Parquet massif premium' },
  { id: '9', name: 'Parquet contrecollé', category: 'Sol', unit: 'm²', pricePerUnit: 45.00, description: 'Parquet 3 plis qualité' },
  { id: '10', name: 'Carrelage standard', category: 'Sol', unit: 'm²', pricePerUnit: 30.00, description: 'Carrelage grès cérame' },
  { id: '11', name: 'Carrelage haut de gamme', category: 'Sol', unit: 'm²', pricePerUnit: 55.00, description: 'Carrelage grand format' },
  { id: '12', name: 'Carrelage imitation parquet', category: 'Sol', unit: 'm²', pricePerUnit: 42.00, description: 'Carrelage effet bois' },
  { id: '13', name: 'Moquette résidentielle', category: 'Sol', unit: 'm²', pricePerUnit: 18.00, description: 'Moquette standard' },
  { id: '14', name: 'Moquette haut de gamme', category: 'Sol', unit: 'm²', pricePerUnit: 35.00, description: 'Moquette épaisse premium' },
  { id: '15', name: 'Sol PVC clipsable', category: 'Sol', unit: 'm²', pricePerUnit: 22.00, description: 'Lames PVC clipsables' },
  { id: '16', name: 'Béton ciré', category: 'Sol', unit: 'm²', pricePerUnit: 85.00, description: 'Béton ciré décoratif' },
  { id: '17', name: 'Résine époxy', category: 'Sol', unit: 'm²', pricePerUnit: 75.00, description: 'Sol résine moderne' },
  
  // Revêtements mur
  { id: '18', name: 'Papier peint standard', category: 'Mur', unit: 'm²', pricePerUnit: 15.00, description: 'Papier peint décoratif' },
  { id: '19', name: 'Papier peint premium', category: 'Mur', unit: 'm²', pricePerUnit: 35.00, description: 'Papier peint texturé' },
  { id: '20', name: 'Papier peint panoramique', category: 'Mur', unit: 'm²', pricePerUnit: 65.00, description: 'Papier peint sur mesure' },
  { id: '21', name: 'Carrelage mural', category: 'Mur', unit: 'm²', pricePerUnit: 25.00, description: 'Faïence salle de bain' },
  { id: '22', name: 'Carrelage métro', category: 'Mur', unit: 'm²', pricePerUnit: 32.00, description: 'Carrelage style métro parisien' },
  { id: '23', name: 'Lambris bois', category: 'Mur', unit: 'm²', pricePerUnit: 28.00, description: 'Lambris pin ou sapin' },
  { id: '24', name: 'Parement pierre', category: 'Mur', unit: 'm²', pricePerUnit: 45.00, description: 'Plaquettes de parement' },
  { id: '25', name: 'Enduit décoratif', category: 'Mur', unit: 'm²', pricePerUnit: 22.00, description: 'Enduit à effet' },
  
  // Électricité
  { id: '26', name: 'Point luminaire', category: 'Électricité', unit: 'unité', pricePerUnit: 45.00, description: 'Installation point éclairage' },
  { id: '27', name: 'Prise électrique', category: 'Électricité', unit: 'unité', pricePerUnit: 35.00, description: 'Prise 16A standard' },
  { id: '28', name: 'Prise USB', category: 'Électricité', unit: 'unité', pricePerUnit: 55.00, description: 'Prise avec ports USB' },
  { id: '29', name: 'Interrupteur simple', category: 'Électricité', unit: 'unité', pricePerUnit: 25.00, description: 'Interrupteur va-et-vient' },
  { id: '30', name: 'Interrupteur connecté', category: 'Électricité', unit: 'unité', pricePerUnit: 85.00, description: 'Interrupteur domotique' },
  { id: '31', name: 'Variateur LED', category: 'Électricité', unit: 'unité', pricePerUnit: 65.00, description: 'Variateur pour LED' },
  { id: '32', name: 'Spot encastrable', category: 'Électricité', unit: 'unité', pricePerUnit: 38.00, description: 'Spot LED encastré' },
  { id: '33', name: 'Bandeau LED', category: 'Électricité', unit: 'mètre', pricePerUnit: 25.00, description: 'Éclairage LED décoratif' },
  
  // Plomberie
  { id: '34', name: 'Robinetterie standard', category: 'Plomberie', unit: 'unité', pricePerUnit: 85.00, description: 'Mitigeur lavabo/évier' },
  { id: '35', name: 'Robinetterie haut de gamme', category: 'Plomberie', unit: 'unité', pricePerUnit: 180.00, description: 'Mitigeur design' },
  { id: '36', name: 'Robinetterie thermostatique', category: 'Plomberie', unit: 'unité', pricePerUnit: 220.00, description: 'Mitigeur thermostatique douche' },
  { id: '37', name: 'Évacuation douche', category: 'Plomberie', unit: 'unité', pricePerUnit: 125.00, description: 'Bonde et siphon douche' },
  { id: '38', name: 'WC suspendu', category: 'Plomberie', unit: 'unité', pricePerUnit: 350.00, description: 'WC suspendu avec bâti' },
  { id: '39', name: 'Lavabo design', category: 'Plomberie', unit: 'unité', pricePerUnit: 280.00, description: 'Vasque moderne' },
  
  // Menuiserie
  { id: '40', name: 'Porte intérieure standard', category: 'Menuiserie', unit: 'unité', pricePerUnit: 120.00, description: 'Porte postformée' },
  { id: '41', name: 'Porte intérieure premium', category: 'Menuiserie', unit: 'unité', pricePerUnit: 280.00, description: 'Porte bois massif' },
  { id: '42', name: 'Porte coulissante', category: 'Menuiserie', unit: 'unité', pricePerUnit: 320.00, description: 'Porte à galandage' },
  { id: '43', name: 'Cloison amovible', category: 'Menuiserie', unit: 'm²', pricePerUnit: 85.00, description: 'Cloison modulaire' },
  { id: '44', name: 'Fenêtre PVC', category: 'Menuiserie', unit: 'm²', pricePerUnit: 250.00, description: 'Fenêtre double vitrage' },
  { id: '45', name: 'Fenêtre aluminium', category: 'Menuiserie', unit: 'm²', pricePerUnit: 380.00, description: 'Fenêtre alu haut de gamme' },
  { id: '46', name: 'Volet roulant', category: 'Menuiserie', unit: 'm²', pricePerUnit: 180.00, description: 'Volet roulant électrique' },
  { id: '47', name: 'Placard sur mesure', category: 'Menuiserie', unit: 'm²', pricePerUnit: 450.00, description: 'Placard intégré' },
  
  // Isolation
  { id: '48', name: 'Isolation laine de verre', category: 'Isolation', unit: 'm²', pricePerUnit: 12.00, description: 'Isolation thermique standard' },
  { id: '49', name: 'Isolation laine de roche', category: 'Isolation', unit: 'm²', pricePerUnit: 15.00, description: 'Isolation phonique renforcée' },
  { id: '50', name: 'Isolation écologique', category: 'Isolation', unit: 'm²', pricePerUnit: 22.00, description: 'Isolation chanvre/lin' },
  { id: '51', name: 'Cloison placo', category: 'Isolation', unit: 'm²', pricePerUnit: 35.00, description: 'Cloison BA13 standard' },
  { id: '52', name: 'Cloison phonique', category: 'Isolation', unit: 'm²', pricePerUnit: 55.00, description: 'Cloison isolation acoustique' },
  
  // Chauffage
  { id: '53', name: 'Radiateur électrique', category: 'Chauffage', unit: 'unité', pricePerUnit: 180.00, description: 'Radiateur inertie' },
  { id: '54', name: 'Radiateur design', category: 'Chauffage', unit: 'unité', pricePerUnit: 350.00, description: 'Radiateur décoratif' },
  { id: '55', name: 'Plancher chauffant', category: 'Chauffage', unit: 'm²', pricePerUnit: 65.00, description: 'Chauffage au sol électrique' },
  { id: '56', name: 'Sèche-serviettes', category: 'Chauffage', unit: 'unité', pricePerUnit: 220.00, description: 'Radiateur salle de bain' },
  
  // Domotique
  { id: '57', name: 'Système domotique', category: 'Domotique', unit: 'unité', pricePerUnit: 450.00, description: 'Box domotique complète' },
  { id: '58', name: 'Détecteur mouvement', category: 'Domotique', unit: 'unité', pricePerUnit: 85.00, description: 'Capteur de présence' },
  { id: '59', name: 'Thermostat connecté', category: 'Domotique', unit: 'unité', pricePerUnit: 180.00, description: 'Thermostat intelligent' },
  { id: '60', name: 'Caméra sécurité', category: 'Domotique', unit: 'unité', pricePerUnit: 120.00, description: 'Caméra IP intérieure' }
];

const ROOM_TYPES = [
  'Salon', 'Cuisine', 'Chambre', 'Salle de bain', 'WC', 'Entrée', 
  'Couloir', 'Bureau', 'Dressing', 'Buanderie', 'Cave', 'Garage'
];

const WORK_CATEGORIES = [
  'Peinture', 'Sol', 'Mur', 'Électricité', 'Plomberie', 'Menuiserie', 'Isolation', 'Chauffage', 'Domotique', 'Autre'
];

// Templates de projets prédéfinis
const PROJECT_TEMPLATES = {
  'Studio': {
    defaultRooms: ['Studio', 'Salle de bain', 'Entrée'],
    averageSize: 25,
    commonWorks: [
      { category: 'Peinture', description: 'Peinture murs et plafond', estimatedHours: 8 },
      { category: 'Sol', description: 'Revêtement sol principal', estimatedHours: 6 },
      { category: 'Électricité', description: 'Points luminaires', estimatedHours: 4 }
    ]
  },
  'T2': {
    defaultRooms: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Entrée'],
    averageSize: 45,
    commonWorks: [
      { category: 'Peinture', description: 'Peinture complète', estimatedHours: 16 },
      { category: 'Sol', description: 'Parquet salon/chambre', estimatedHours: 12 },
      { category: 'Sol', description: 'Carrelage salle de bain', estimatedHours: 8 },
      { category: 'Électricité', description: 'Éclairage moderne', estimatedHours: 8 }
    ]
  },
  'T3': {
    defaultRooms: ['Salon', 'Chambre 1', 'Chambre 2', 'Cuisine', 'Salle de bain', 'WC', 'Entrée'],
    averageSize: 65,
    commonWorks: [
      { category: 'Peinture', description: 'Peinture toutes pièces', estimatedHours: 24 },
      { category: 'Sol', description: 'Parquet pièces principales', estimatedHours: 18 },
      { category: 'Sol', description: 'Carrelage pièces d\'eau', estimatedHours: 12 },
      { category: 'Électricité', description: 'Modernisation électrique', estimatedHours: 12 },
      { category: 'Plomberie', description: 'Robinetterie moderne', estimatedHours: 6 }
    ]
  },
  'Maison': {
    defaultRooms: ['Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Chambre 3', 'Salle de bain', 'WC', 'Entrée', 'Couloir'],
    averageSize: 120,
    commonWorks: [
      { category: 'Peinture', description: 'Peinture intérieure complète', estimatedHours: 40 },
      { category: 'Sol', description: 'Parquet étage', estimatedHours: 25 },
      { category: 'Sol', description: 'Carrelage RDC', estimatedHours: 20 },
      { category: 'Électricité', description: 'Mise aux normes électrique', estimatedHours: 20 },
      { category: 'Plomberie', description: 'Rénovation sanitaires', estimatedHours: 12 },
      { category: 'Chauffage', description: 'Radiateurs modernes', estimatedHours: 8 }
    ]
  }
};

// Coefficients de difficulté par pièce
const ROOM_DIFFICULTY_COEFFICIENTS = {
  'Salon': 1.0,
  'Chambre': 1.0,
  'Cuisine': 1.3,
  'Salle de bain': 1.5,
  'WC': 1.2,
  'Entrée': 1.1,
  'Couloir': 1.1,
  'Bureau': 1.0,
  'Dressing': 1.2,
  'Buanderie': 1.3,
  'Cave': 0.8,
  'Garage': 0.7,
  'Studio': 1.0
};

// Variations saisonnières des prix (en pourcentage)
const SEASONAL_VARIATIONS = {
  'Peinture': { spring: 0, summer: 5, autumn: 0, winter: -5 },
  'Sol': { spring: 0, summer: 0, autumn: 0, winter: 0 },
  'Mur': { spring: 0, summer: 0, autumn: 0, winter: 0 },
  'Électricité': { spring: 0, summer: 0, autumn: 0, winter: 0 },
  'Plomberie': { spring: 0, summer: 0, autumn: 0, winter: 10 },
  'Menuiserie': { spring: 0, summer: 0, autumn: 0, winter: 0 },
  'Isolation': { spring: 0, summer: -10, autumn: 5, winter: 15 },
  'Chauffage': { spring: -15, summer: -20, autumn: 10, winter: 20 },
  'Domotique': { spring: 0, summer: 0, autumn: 0, winter: 0 }
};

// Fonction pour obtenir la variation saisonnière actuelle
const getCurrentSeasonalVariation = (category: string): number => {
  const month = new Date().getMonth();
  const season = month >= 2 && month <= 4 ? 'spring' :
                month >= 5 && month <= 7 ? 'summer' :
                month >= 8 && month <= 10 ? 'autumn' : 'winter';
  
  return SEASONAL_VARIATIONS[category as keyof typeof SEASONAL_VARIATIONS]?.[season] || 0;
};

export function HomeStaging() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    // TODO: Charger depuis Firestore
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Appartement T3 - Rénovation complète',
        propertyType: 'Appartement',
        totalSurface: 75,
        rooms: ['Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Salle de bain'],
        workItems: [],
        totalMaterials: 0,
        totalLabor: 0,
        totalCost: 0,
        margin: 20,
        finalPrice: 0,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
    setProjects(mockProjects);
  };

  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: 'Nouveau projet',
      propertyType: 'Appartement',
      totalSurface: 0,
      rooms: [],
      workItems: [],
      totalMaterials: 0,
      totalLabor: 0,
      totalCost: 0,
      margin: 20,
      finalPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentProject(newProject);
    setIsCalculatorOpen(true);
  };

  const createProjectFromTemplate = (templateType: string) => {
    const template = PROJECT_TEMPLATES[templateType as keyof typeof PROJECT_TEMPLATES];
    if (!template) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: `${templateType} - ${new Date().toLocaleDateString('fr-FR')}`,
      propertyType: templateType,
      totalSurface: template.averageSize,
      rooms: [...template.defaultRooms],
      workItems: template.commonWorks.map((work, index) => ({
        id: `${Date.now()}-${index}`,
        room: template.defaultRooms[0],
        category: work.category,
        description: work.description,
        surface: Math.floor(template.averageSize / template.defaultRooms.length),
        materialId: MATERIAL_DATABASE.find(m => m.category === work.category)?.id || '',
        materialPrice: MATERIAL_DATABASE.find(m => m.category === work.category)?.pricePerUnit || 0,
        laborHours: work.estimatedHours,
        laborRate: 30,
        totalMaterial: 0,
        totalLabor: 0,
        total: 0
      })),
      totalMaterials: 0,
      totalLabor: 0,
      totalCost: 0,
      margin: 20,
      finalPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentProject(newProject);
    setIsCalculatorOpen(true);
  };

  const getAdjustedPrice = (material: MaterialPrice): number => {
    const seasonalVariation = getCurrentSeasonalVariation(material.category);
    return material.pricePerUnit * (1 + seasonalVariation / 100);
  };

  const editProject = (project: Project) => {
    setCurrentProject(project);
    setIsCalculatorOpen(true);
  };

  const saveProject = (projectData: Project) => {
    if (projects.find(p => p.id === projectData.id)) {
      // Mise à jour
      setProjects(projects.map(p => p.id === projectData.id ? { ...projectData, updatedAt: new Date() } : p));
    } else {
      // Création
      setProjects([...projects, projectData]);
    }
    setIsCalculatorOpen(false);
    setCurrentProject(null);
  };

  const deleteProject = (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const exportProject = (project: Project) => {
    // TODO: Générer un PDF ou Excel avec le détail des coûts
    console.log('Export project:', project);
  };

  if (!user) {
    return (
      <div className="homestaging-page">
        <div className="auth-required">
          <HomeIcon size={48} />
          <h2>Connexion requise</h2>
          <p>Veuillez vous connecter pour accéder au calculateur de home staging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homestaging-page">
      <div className="homestaging-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Calculateur Home Staging</h1>
            <p>Estimez précisément vos coûts de travaux et matériaux</p>
          </div>
          <div className="header-actions">
            <button className="create-project-btn" onClick={createNewProject}>
              <Plus size={20} />
              Nouveau Projet
            </button>
          </div>
        </div>
        
        {/* Templates de projets */}
        <div className="project-templates">
          <h3>Créer à partir d'un modèle</h3>
          <div className="templates-grid">
            {Object.keys(PROJECT_TEMPLATES).map((templateType) => {
              const template = PROJECT_TEMPLATES[templateType as keyof typeof PROJECT_TEMPLATES];
              return (
                <div key={templateType} className="template-card" onClick={() => createProjectFromTemplate(templateType)}>
                  <div className="template-info">
                    <h4>{templateType}</h4>
                    <p>{template.averageSize}m² • {template.defaultRooms.length} pièces</p>
                    <span className="template-works">{template.commonWorks.length} postes de travaux</span>
                  </div>
                  <div className="template-action">
                    <Plus size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="projects-section">
        <h2>Mes Projets</h2>
        {projects.length === 0 ? (
          <div className="empty-projects">
            <Calculator size={48} />
            <h3>Aucun projet créé</h3>
            <p>Créez votre premier projet pour commencer à calculer vos coûts de home staging.</p>
            <button className="create-first-project-btn" onClick={createNewProject}>
              <Plus size={16} />
              Créer mon premier projet
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <p className="project-type">{project.propertyType} - {project.totalSurface}m²</p>
                    <p className="project-rooms">{project.rooms.length} pièces</p>
                  </div>
                  <div className="project-cost">
                    <span className="cost-amount">{project.finalPrice.toLocaleString('fr-FR')} €</span>
                    <span className="cost-label">Prix final</span>
                  </div>
                </div>
                
                <div className="project-details">
                  <div className="cost-breakdown">
                    <div className="cost-item">
                      <span className="cost-type">Matériaux:</span>
                      <span className="cost-value">{project.totalMaterials.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-type">Main d'œuvre:</span>
                      <span className="cost-value">{project.totalLabor.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="cost-item">
                      <span className="cost-type">Marge ({project.margin}%):</span>
                      <span className="cost-value">{(project.finalPrice - project.totalCost).toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                  
                  <div className="project-date">
                    Modifié le {project.updatedAt.toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="project-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => editProject(project)}
                    title="Modifier"
                  >
                    <Calculator size={16} />
                    Calculer
                  </button>
                  <button 
                    className="action-btn export-btn"
                    onClick={() => exportProject(project)}
                    title="Exporter"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className="action-btn save-btn"
                    title="Sauvegarder"
                  >
                    <Save size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteProject(project.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="materials-reference">
        <h2>Référentiel des Prix</h2>
        <div className="seasonal-info">
          <p> <strong>Variations saisonnières actives</strong> - Les prix affichés incluent les variations de saison en cours</p>
        </div>
        <div className="materials-categories">
          {WORK_CATEGORIES.filter(cat => cat !== 'Autre').map(category => (
            <div key={category} className="material-category">
              <div className="category-header">
                <h3>{category}</h3>
                {getCurrentSeasonalVariation(category) !== 0 && (
                  <span className={`seasonal-badge ${getCurrentSeasonalVariation(category) > 0 ? 'increase' : 'decrease'}`}>
                    {getCurrentSeasonalVariation(category) > 0 ? '+' : ''}{getCurrentSeasonalVariation(category)}%
                  </span>
                )}
              </div>
              <div className="materials-list">
                {MATERIAL_DATABASE
                  .filter(material => material.category === category)
                  .map(material => {
                    const adjustedPrice = getAdjustedPrice(material);
                    const hasVariation = adjustedPrice !== material.pricePerUnit;
                    return (
                      <div key={material.id} className="material-item">
                        <div className="material-info">
                          <span className="material-name">{material.name}</span>
                          <span className="material-description">{material.description}</span>
                        </div>
                        <div className="material-price">
                          {hasVariation && (
                            <span className="original-price">{material.pricePerUnit.toFixed(2)} €</span>
                          )}
                          <span className={hasVariation ? 'adjusted-price' : ''}>
                            {adjustedPrice.toFixed(2)} €/{material.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="difficulty-coefficients">
          <h3>Coefficients de difficulté par pièce</h3>
          <div className="coefficients-grid">
            {Object.entries(ROOM_DIFFICULTY_COEFFICIENTS).map(([room, coefficient]) => (
              <div key={room} className="coefficient-item">
                <span className="room-name">{room}</span>
                <span className={`coefficient ${coefficient > 1 ? 'difficult' : coefficient < 1 ? 'easy' : 'normal'}`}>
                  ×{coefficient}
                </span>
              </div>
            ))}
          </div>
          <p className="coefficient-note">
            Ces coefficients s'appliquent automatiquement au temps de main d'œuvre selon la complexité de chaque pièce.
          </p>
        </div>
      </div>

      {isCalculatorOpen && (
        <WorkCalculator
          project={currentProject}
          materials={MATERIAL_DATABASE}
          roomTypes={ROOM_TYPES}
          workCategories={WORK_CATEGORIES}
          onSave={saveProject}
          onCancel={() => {
            setIsCalculatorOpen(false);
            setCurrentProject(null);
          }}
        />
      )}
    </div>
  );
}
