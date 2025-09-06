import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  type: 'building' | 'house' | 'complex' | 'land' | 'commercial' | 'mixed';
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  description?: string;
  totalUnits: number;
  status: 'planning' | 'construction' | 'completed' | 'on_hold';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  totalValue: number;
  
  // Identification du bien
  destination?: 'habitation' | 'commerce' | 'mixte' | 'industriel';
  totalSurface?: number; // Surface totale du projet
  constructionYear?: number;
  renovationYear?: number;
  
  // Informations légales
  propertyTitle?: string; // Titre de propriété
  urbanisticInfo?: string; // Renseignements urbanistiques
  zoning?: 'residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural';
  permits?: string[]; // Permis obtenus
  servitudes?: string; // Servitudes éventuelles
  
  // Caractéristiques techniques
  heatingType?: 'gas' | 'oil' | 'electric' | 'heat_pump' | 'solar' | 'wood' | 'other';
  roofType?: string;
  buildingMaterials?: string;
  isolation?: {
    walls?: boolean;
    roof?: boolean;
    doubleGlazing?: boolean;
  };
  
  // Informations financières
  cadastralIncome?: number; // Revenu cadastral
  registrationFees?: number; // Droits d'enregistrement
  notaryFees?: number;
  tva?: number;
  
  // Diagnostics et conformité
  energyCertificate?: string; // PEB/DPE
  electricalCompliance?: boolean;
  gasCompliance?: boolean;
  heatingCertificate?: boolean;
  asbestosCertificate?: boolean;
  soilAttestation?: boolean;
  
  // Informations générales détaillées
  branding?: string; // Nom commercial/branding du projet
  gpsCoordinates?: string; // Coordonnées GPS
  neighborhood?: string; // Quartier
  phases?: string; // Phasage du projet
  developer?: string; // Promoteur/société
  architect?: string; // Architecte
  engineeringFirm?: string; // Bureau d'étude
  stabilityEngineer?: string; // Ingénieur stabilité
  pebOffice?: string; // Bureau PEB
  generalContractor?: string; // Entreprise générale
  constructionMode?: 'turnkey' | 'separate_lots' | 'other'; // Mode de construction
  
  // Aspects techniques et urbanistiques
  urbanPermitNumber?: string; // Numéro du permis d'urbanisme
  urbanPermitDate?: Date; // Date du permis
  totalBuiltSurface?: number; // Surface totale construite
  numberOfLevels?: number; // Nombre de niveaux
  energyStandards?: string; // Normes énergétiques (PEB A, passif, NZEB)
  mainMaterials?: string; // Matériaux principaux
  exteriorDevelopment?: string; // Aménagements extérieurs
  localRegulationsCompliance?: string; // Conformité réglementations locales
  
  // Aspects légaux et administratifs
  divisionAct?: string; // Acte de division
  coOwnershipRegulations?: string; // Règlement de copropriété
  baseAct?: string; // Acte de base
  insurances?: string; // Assurances
  environmentalPermits?: string; // Autorisations environnementales
  soilStudy?: string; // Étude du sol
  pollutionCertificates?: string; // Attestations de dépollution
  
  // Informations financières étendues
  constructionCostPerSqm?: number; // Coût construction par m²
  financing?: string; // Mode de financement
  pricePerSqm?: number; // Prix de vente par m²
  estimatedRent?: number; // Loyer estimé
  averageRentalYield?: number; // Rendement locatif moyen
  taxes?: string; // Taxes et droits
  commonCharges?: number; // Charges communes estimées
  
  // Informations commerciales et marketing
  positioning?: string; // Positionnement (standing, luxe, etc.)
  targetClientele?: string; // Clientèle cible
  competitiveAdvantages?: string; // Avantages compétitifs
  marketingBranding?: string; // Branding et communication
  commercializationPlanning?: string; // Planning de commercialisation
  marketingSupports?: string; // Supports marketing
  
  // Planning et organisation
  permitSubmissionDate?: Date; // Dépôt du permis
  permitObtainedDate?: Date; // Obtention du permis
  constructionStartDate?: Date; // Démarrage chantier
  phaseProgress?: string; // Avancement par phases
  deliveryDate?: Date; // Livraison prévue
  salesMode?: 'vefa' | 'turnkey' | 'rental'; // Mode de vente
  legalGuarantees?: string; // Garanties légales
  
  // Environnement et valeur ajoutée
  accessibility?: string; // Accessibilité (transports, routes)
  proximity?: string; // Proximité (écoles, commerces, etc.)
  neighborhoodDevelopments?: string; // Aménagements de quartier
  energyStrategy?: string; // Stratégie énergétique
  environmentalImpact?: string; // Impact environnemental
  socialAddedValue?: string; // Valeur ajoutée sociale
  
  // Media et documents
  mainImage?: string;
  images: string[];
  galleryImages?: string[];
  documents: string[];
  plans?: string[]; // Plans architecte, cadastre
  
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
        };
      }) as Project[];
      
      // Sort by createdAt in memory instead of Firestore
      projectsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  // Add project
  const addProject = async (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const projectsRef = collection(db, 'projects');
      const newProject = {
        ...projectData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        startDate: projectData.startDate ? Timestamp.fromDate(projectData.startDate) : null,
        endDate: projectData.endDate ? Timestamp.fromDate(projectData.endDate) : null,
      };

      const docRef = await addDoc(projectsRef, newProject);
      await fetchProjects(); // Refresh the list
      return docRef.id;
    } catch (err) {
      console.error('Error adding project:', err);
      console.error('Error details:', err);
      throw new Error(`Erreur lors de la création du projet: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update project
  const updateProject = async (projectId: string, updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const projectRef = doc(db, 'projects', projectId);
      // Clean the updates object to remove undefined values
      const cleanedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const updateData: any = {
        ...cleanedUpdates,
        updatedAt: Timestamp.now(),
      };

      // Handle dates separately
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }

      await updateDoc(projectRef, updateData);
      await fetchProjects(); // Refresh the list
    } catch (err) {
      console.error('Error updating project:', err);
      throw new Error('Erreur lors de la mise à jour du projet');
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      await fetchProjects(); // Refresh the list
    } catch (err) {
      console.error('Error deleting project:', err);
      throw new Error('Erreur lors de la suppression du projet');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.uid]);

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects
  };
};
