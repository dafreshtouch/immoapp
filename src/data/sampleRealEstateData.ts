import { Project } from '../hooks/useProjects';
import { Unit } from '../hooks/useUnits';
import { GestionMessage, GestionTask, Contractor, Document } from '../hooks/useGestion';

// Sample Projects Data
export const sampleProjects: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Résidence Les Jardins',
    type: 'building',
    address: '15 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    description: 'Résidence moderne de standing avec espaces verts',
    totalUnits: 24,
    status: 'construction',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-06-30'),
    totalValue: 12000000,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    ],
    documents: []
  },
  {
    name: 'Villa Moderne Neuilly',
    type: 'house',
    address: '42 Avenue Charles de Gaulle',
    city: 'Neuilly-sur-Seine',
    postalCode: '92200',
    description: 'Villa contemporaine avec jardin et piscine',
    totalUnits: 1,
    status: 'completed',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2024-01-15'),
    totalValue: 2800000,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    ],
    documents: []
  },
  {
    name: 'Centre Commercial Rivoli',
    type: 'complex',
    address: '128 Rue de Rivoli',
    city: 'Paris',
    postalCode: '75004',
    description: 'Centre commercial avec bureaux et commerces',
    totalUnits: 45,
    status: 'planning',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2026-12-31'),
    totalValue: 35000000,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    ],
    documents: []
  },
  {
    name: 'Terrain Constructible Vincennes',
    type: 'land',
    address: '25 Avenue de la République',
    city: 'Vincennes',
    postalCode: '94300',
    description: 'Terrain de 2000m² constructible, zone résidentielle',
    totalUnits: 1,
    status: 'completed',
    totalValue: 1500000,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    ],
    documents: []
  }
];

// Sample Units Data
export const sampleUnits: Omit<Unit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    projectId: 'project1', // Will be replaced with actual project ID
    name: 'Appartement 3A',
    type: 'apartment',
    surface: 85,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 1,
    floor: 3,
    price: 650000,
    pricePerSqm: 7647,
    charges: 180,
    availability: 'available',
    condition: 'new',
    description: 'Appartement lumineux avec balcon, vue dégagée',
    energyClass: 'B',
    ghgEmissions: 'A',
    heatingType: 'gas',
    orientation: 'south',
    constructionYear: 2024,
    balcony: true,
    balconyArea: 8,
    elevator: true,
    parking: true,
    parkingSpaces: 1,
    furnished: false,
    kitchenType: 'open',
    internetFiber: true,
    securitySystem: true,
    intercom: true,
    propertyTax: 2800,
    coOwnershipFees: 2160,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    documents: []
  },
  {
    projectId: 'project1',
    name: 'Appartement 2B',
    type: 'apartment',
    surface: 65,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    price: 520000,
    pricePerSqm: 8000,
    charges: 150,
    availability: 'reserved',
    condition: 'new',
    description: 'Appartement cosy avec terrasse',
    energyClass: 'B',
    ghgEmissions: 'B',
    heatingType: 'gas',
    orientation: 'east',
    constructionYear: 2024,
    terrace: true,
    terraceArea: 12,
    elevator: true,
    parking: false,
    furnished: false,
    kitchenType: 'closed',
    internetFiber: true,
    securitySystem: true,
    intercom: true,
    propertyTax: 2200,
    coOwnershipFees: 1800,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    documents: []
  },
  {
    projectId: 'project2',
    name: 'Villa Principale',
    type: 'house',
    surface: 280,
    rooms: 8,
    bedrooms: 4,
    bathrooms: 3,
    floor: 0,
    price: 2800000,
    pricePerSqm: 10000,
    availability: 'sold',
    condition: 'excellent',
    description: 'Villa moderne avec piscine et jardin paysager',
    energyClass: 'A',
    ghgEmissions: 'A',
    heatingType: 'heat_pump',
    orientation: 'south',
    constructionYear: 2023,
    garden: true,
    gardenArea: 500,
    garage: true,
    swimmingPool: true,
    furnished: true,
    kitchenType: 'american',
    internetFiber: true,
    airConditioning: true,
    fireplace: true,
    securitySystem: true,
    accessControl: true,
    propertyTax: 8500,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    ],
    documents: []
  },
  {
    projectId: 'project3',
    name: 'Local Commercial RC1',
    type: 'commercial',
    surface: 120,
    floor: 0,
    price: 850000,
    pricePerSqm: 7083,
    availability: 'available',
    condition: 'new',
    description: 'Local commercial avec vitrine sur rue passante',
    energyClass: 'C',
    ghgEmissions: 'C',
    heatingType: 'electric',
    orientation: 'north',
    constructionYear: 2025,
    commercialLicense: true,
    shopWindow: true,
    storageRoom: true,
    internetFiber: true,
    airConditioning: true,
    securitySystem: true,
    accessControl: true,
    propertyTax: 4200,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    ],
    documents: []
  },
  {
    projectId: 'project3',
    name: 'Bureau Étage 2',
    type: 'office',
    surface: 95,
    floor: 2,
    price: 680000,
    pricePerSqm: 7158,
    availability: 'available',
    condition: 'new',
    description: 'Bureau moderne avec open space et salles de réunion',
    energyClass: 'B',
    ghgEmissions: 'B',
    heatingType: 'heat_pump',
    orientation: 'east_west',
    constructionYear: 2025,
    elevator: true,
    internetFiber: true,
    airConditioning: true,
    securitySystem: true,
    accessControl: true,
    intercom: true,
    propertyTax: 3500,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    ],
    documents: []
  },
  {
    projectId: 'project4',
    name: 'Terrain Principal',
    type: 'land',
    surface: 2000,
    price: 1500000,
    pricePerSqm: 750,
    availability: 'available',
    condition: 'good',
    description: 'Terrain constructible, viabilisé, proche transports',
    orientation: 'south',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    ],
    documents: []
  }
];

// Sample Messages Data
export const sampleMessages: Omit<GestionMessage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    subject: 'Retard livraison Résidence Les Jardins',
    content: 'Les travaux de plomberie accusent un retard de 2 semaines. Prévoir ajustement planning.',
    priority: 'high',
    isRead: false,
    sender: 'Jean Dupont - Chef de chantier',
    recipient: 'Équipe projet',
    projectId: 'project1'
  },
  {
    subject: 'Validation plans Villa Neuilly',
    content: 'Les plans de rénovation ont été validés par l\'architecte. Début des travaux prévu lundi.',
    priority: 'medium',
    isRead: true,
    sender: 'Marie Martin - Architecte',
    recipient: 'Direction',
    projectId: 'project2'
  },
  {
    subject: 'Demande devis électricité',
    content: 'Besoin d\'un devis pour l\'installation électrique du centre commercial.',
    priority: 'medium',
    isRead: false,
    sender: 'Pierre Leroy - Responsable projet',
    recipient: 'Service achats',
    projectId: 'project3'
  }
];

// Sample Tasks Data
export const sampleTasks: Omit<GestionTask, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Inspection sécurité chantier',
    description: 'Contrôle mensuel de sécurité sur le chantier Résidence Les Jardins',
    status: 'pending',
    priority: 'high',
    assignedTo: 'Jean Dupont',
    projectId: 'project1',
    dueDate: new Date('2025-01-15')
  },
  {
    title: 'Finaliser dossier permis construire',
    description: 'Compléter et déposer le dossier de permis pour le centre commercial',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Marie Martin',
    projectId: 'project3',
    dueDate: new Date('2025-01-20')
  },
  {
    title: 'Réception définitive Villa',
    description: 'Organiser la réception définitive de la villa de Neuilly',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'Pierre Leroy',
    projectId: 'project2',
    dueDate: new Date('2024-12-15')
  },
  {
    title: 'Mise à jour site web projets',
    description: 'Actualiser les photos et descriptions des projets en cours',
    status: 'pending',
    priority: 'low',
    assignedTo: 'Sophie Durand',
    dueDate: new Date('2025-01-25')
  }
];

// Sample Contractors Data
export const sampleContractors: Omit<Contractor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Jean Dupont',
    company: 'Dupont Construction',
    specialty: 'Gros œuvre',
    phone: '01 42 33 44 55',
    email: 'j.dupont@dupont-construction.fr',
    address: '25 Rue de la Construction, 75010 Paris',
    rating: 4.8,
    activeProjects: ['project1', 'project3'],
    totalProjects: 15
  },
  {
    name: 'Marie Martin',
    company: 'Martin Architecture',
    specialty: 'Architecture',
    phone: '01 45 67 89 10',
    email: 'marie@martin-archi.fr',
    address: '12 Boulevard Haussmann, 75009 Paris',
    rating: 4.9,
    activeProjects: ['project2', 'project3'],
    totalProjects: 28
  },
  {
    name: 'Pierre Leroy',
    company: 'Électricité Moderne',
    specialty: 'Électricité',
    phone: '01 56 78 90 12',
    email: 'contact@elec-moderne.fr',
    address: '8 Avenue Voltaire, 75011 Paris',
    rating: 4.6,
    activeProjects: ['project1'],
    totalProjects: 42
  },
  {
    name: 'Sophie Durand',
    company: 'Plomberie Plus',
    specialty: 'Plomberie',
    phone: '01 67 89 01 23',
    email: 'sophie@plomberie-plus.fr',
    address: '33 Rue des Artisans, 75012 Paris',
    rating: 4.7,
    activeProjects: ['project1', 'project2'],
    totalProjects: 35
  },
  {
    name: 'Laurent Petit',
    company: 'Jardins & Paysages',
    specialty: 'Paysagisme',
    phone: '01 78 90 12 34',
    email: 'l.petit@jardins-paysages.fr',
    address: '15 Allée des Jardins, 94300 Vincennes',
    rating: 4.5,
    activeProjects: ['project2'],
    totalProjects: 22
  }
];

// Sample Documents Data
export const sampleDocuments: Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Contrat Dupont Construction',
    type: 'contract',
    url: '/documents/contrat-dupont-construction.pdf',
    size: 2048576,
    projectId: 'project1',
    contractorId: 'contractor1'
  },
  {
    name: 'Facture électricité janvier 2025',
    type: 'invoice',
    url: '/documents/facture-elec-jan2025.pdf',
    size: 512000,
    projectId: 'project1',
    contractorId: 'contractor3'
  },
  {
    name: 'Rapport inspection sécurité',
    type: 'report',
    url: '/documents/rapport-securite-dec2024.pdf',
    size: 1024000,
    projectId: 'project1'
  },
  {
    name: 'Certificat conformité Villa Neuilly',
    type: 'certificate',
    url: '/documents/certificat-villa-neuilly.pdf',
    size: 768000,
    projectId: 'project2'
  },
  {
    name: 'Plans architecturaux Centre Commercial',
    type: 'other',
    url: '/documents/plans-centre-commercial.pdf',
    size: 5242880,
    projectId: 'project3',
    contractorId: 'contractor2'
  }
];

// Helper function to create sample data with proper IDs
export const createSampleDataWithIds = (userId: string) => {
  const projectIds = ['proj_1', 'proj_2', 'proj_3', 'proj_4'];
  const contractorIds = ['cont_1', 'cont_2', 'cont_3', 'cont_4', 'cont_5'];

  const projects = sampleProjects.map((project, index) => ({
    ...project,
    id: projectIds[index],
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const units = sampleUnits.map((unit, index) => ({
    ...unit,
    id: `unit_${index + 1}`,
    projectId: unit.projectId === 'project1' ? projectIds[0] :
              unit.projectId === 'project2' ? projectIds[1] :
              unit.projectId === 'project3' ? projectIds[2] :
              projectIds[3],
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const messages = sampleMessages.map((message, index) => ({
    ...message,
    id: `msg_${index + 1}`,
    projectId: message.projectId === 'project1' ? projectIds[0] :
               message.projectId === 'project2' ? projectIds[1] :
               projectIds[2],
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const tasks = sampleTasks.map((task, index) => ({
    ...task,
    id: `task_${index + 1}`,
    projectId: task.projectId === 'project1' ? projectIds[0] :
               task.projectId === 'project2' ? projectIds[1] :
               task.projectId === 'project3' ? projectIds[2] :
               undefined,
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const contractors = sampleContractors.map((contractor, index) => ({
    ...contractor,
    id: contractorIds[index],
    activeProjects: contractor.activeProjects.map(projId => 
      projId === 'project1' ? projectIds[0] :
      projId === 'project2' ? projectIds[1] :
      projectIds[2]
    ),
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const documents = sampleDocuments.map((document, index) => ({
    ...document,
    id: `doc_${index + 1}`,
    projectId: document.projectId === 'project1' ? projectIds[0] :
               document.projectId === 'project2' ? projectIds[1] :
               projectIds[2],
    contractorId: document.contractorId === 'contractor1' ? contractorIds[0] :
                  document.contractorId === 'contractor2' ? contractorIds[1] :
                  document.contractorId === 'contractor3' ? contractorIds[2] :
                  undefined,
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  return {
    projects,
    units,
    messages,
    tasks,
    contractors,
    documents
  };
};
