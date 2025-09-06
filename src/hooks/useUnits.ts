import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface Unit {
  id: string;
  projectId: string;
  name: string;
  type: 'apartment' | 'house' | 'commercial' | 'retail' | 'office' | 'parking' | 'storage' | 'land';
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  price: number;
  pricePerSqm?: number;
  charges?: number;
  availability: 'available' | 'reserved' | 'sold' | 'rented';
  condition: 'new' | 'excellent' | 'good' | 'to_renovate' | 'to_demolish';
  description?: string;
  
  // Identification complémentaire
  fullAddress?: string; // Adresse complète
  country?: string;
  destination?: 'habitation' | 'commerce' | 'mixte';
  hasElevator?: boolean;
  
  // Informations légales obligatoires
  propertyTitle?: string; // Titre de propriété
  energyCertificate?: string; // PEB/DPE
  electricalCompliance?: boolean; // Conformité électrique
  gasCompliance?: boolean; // Conformité gaz
  urbanisticInfo?: string; // Renseignements urbanistiques
  soilAttestation?: boolean; // Attestation du sol
  asbestosCertificate?: boolean; // Certificat d'amiante
  heatingCertificate?: boolean; // Certificat installation chauffage
  cadastralPlan?: string; // Plan cadastral
  mortgageStatus?: string; // État des hypothèques
  
  // Informations pour location
  leaseType?: 'residential' | 'student' | 'commercial' | 'short_term';
  leaseDuration?: string; // Durée du bail
  securityDeposit?: number; // Garantie locative
  leaseRegistered?: boolean; // Bail enregistré
  
  // Energy & Environment
  energyClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'not_specified';
  ghgEmissions?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'not_specified';
  heatingType?: 'gas' | 'oil' | 'electric' | 'heat_pump' | 'solar' | 'wood' | 'other';
  hotWaterSystem?: 'gas' | 'electric' | 'solar' | 'heat_pump' | 'other';
  orientation?: 'north' | 'south' | 'east' | 'west' | 'north_south' | 'east_west';
  
  // Construction
  constructionYear?: number;
  renovationYear?: number;
  buildingMaterials?: string;
  roofType?: string;
  isolation?: {
    walls?: boolean;
    roof?: boolean;
    doubleGlazing?: boolean;
  };
  
  // Features
  balcony?: boolean;
  balconyArea?: number;
  terrace?: boolean;
  terraceArea?: number;
  garden?: boolean;
  gardenArea?: number;
  cellar?: boolean;
  attic?: boolean;
  elevator?: boolean;
  parking?: boolean;
  parkingSpaces?: number;
  garage?: boolean;
  
  // Amenities
  furnished?: boolean;
  kitchenType?: 'none' | 'kitchenette' | 'open' | 'closed' | 'american';
  internetFiber?: boolean;
  airConditioning?: boolean;
  fireplace?: boolean;
  swimmingPool?: boolean;
  
  // Security & Access
  securitySystem?: boolean;
  intercom?: boolean;
  accessControl?: boolean;
  concierge?: boolean;
  
  // Commercial specific
  commercialLicense?: boolean;
  shopWindow?: boolean;
  storageRoom?: boolean;
  loadingDock?: boolean;
  
  // Financial
  propertyTax?: number;
  coOwnershipFees?: number;
  rentalYield?: number;
  cadastralIncome?: number; // Revenu cadastral
  registrationFees?: number; // Droits d'enregistrement
  notaryFees?: number;
  
  // Informations administratives
  permits?: string[]; // Permis d'urbanisme obtenus
  servitudes?: string; // Servitudes éventuelles
  zoning?: 'residential' | 'commercial' | 'mixed' | 'industrial';
  
  // Diagnostics spécifiques
  leadDiagnostic?: boolean; // Diagnostic plomb
  termitesDiagnostic?: boolean; // Diagnostic termites
  noiseDiagnostic?: boolean; // Diagnostic bruit
  
  // Informations pratiques
  accessibility?: {
    publicTransport?: string;
    schools?: string;
    shops?: string;
  };
  neighborhood?: string; // Type de quartier
  valueAppreciationPotential?: string; // Potentiel de valorisation
  
  // Informations supplémentaires utiles
  buildingName?: string; // Nom de l'immeuble/résidence
  floorDescription?: string; // Description de l'étage (rez, 1er, dernier...)
  exposureDetails?: string; // Détails exposition (vue, luminosité)
  noiseLevel?: 'very_quiet' | 'quiet' | 'moderate' | 'noisy'; // Niveau sonore
  proximityDetails?: {
    metro?: string; // Distance métro/tram
    shops?: string; // Commerces à proximité
    schools?: string; // Écoles proches
    parks?: string; // Parcs et espaces verts
  };
  
  // Caractéristiques spéciales
  uniqueFeatures?: string; // Caractéristiques uniques
  renovationNeeds?: string; // Travaux nécessaires
  investmentPotential?: string; // Potentiel d'investissement
  targetTenant?: string; // Locataire type visé
  
  // Informations de gestion
  managementCompany?: string; // Syndic/société de gestion
  buildingAge?: number; // Âge du bâtiment
  lastRenovation?: number; // Dernière rénovation
  futureWorks?: string; // Travaux prévus dans l'immeuble
  
  // Media
  images: string[];
  documents: string[];
  virtualTourUrl?: string;
  plans?: string[]; // Plans architecte, cadastre
  
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useUnits = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch units function
  const fetchUnits = useCallback(async (projectId?: string) => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('useUnits: Fetching units for user:', user.uid, 'projectId:', projectId);
      
      const unitsRef = collection(db, 'units');
      let q;
      
      if (projectId) {
        console.log('useUnits: Querying with projectId filter:', projectId);
        q = query(
          unitsRef,
          where('userId', '==', user.uid),
          where('projectId', '==', projectId)
        );
      } else {
        console.log('useUnits: Querying all units for user');
        q = query(
          unitsRef,
          where('userId', '==', user.uid)
        );
      }
      
      const querySnapshot = await getDocs(q);
      console.log('useUnits: Query returned', querySnapshot.docs.length, 'documents');
      
      const unitsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('useUnits: Processing unit:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Unit;
      });
      
      // Sort by createdAt in memory instead of Firestore
      unitsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('useUnits: Final units data:', unitsData);
      setUnits(unitsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching units:', err);
      setError('Erreur lors du chargement des unités');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add unit
  const addUnit = async (unitData: Omit<Unit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const unitsRef = collection(db, 'units');
      const newUnit = {
        ...unitData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        pricePerSqm: unitData.surface > 0 ? Math.round(unitData.price / unitData.surface) : 0,
      };

      const docRef = await addDoc(unitsRef, newUnit);
      
      // Force refresh by re-fetching all units
      await fetchUnits();
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding unit:', err);
      console.error('Error details:', err);
      throw new Error(`Erreur lors de la création de l'unité: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update unit
  const updateUnit = async (unitId: string, updates: Partial<Omit<Unit, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const unitRef = doc(db, 'units', unitId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Recalculate price per sqm if price or surface changed
      if (updates.price !== undefined || updates.surface !== undefined) {
        const currentUnit = units.find(u => u.id === unitId);
        if (currentUnit) {
          const newPrice = updates.price ?? currentUnit.price;
          const newSurface = updates.surface ?? currentUnit.surface;
          updateData.pricePerSqm = newSurface > 0 ? Math.round(newPrice / newSurface) : 0;
        }
      }

      await updateDoc(unitRef, updateData);
      await fetchUnits(); // Refresh the list
    } catch (err) {
      console.error('Error updating unit:', err);
      throw new Error('Erreur lors de la mise à jour de l\'unité');
    }
  };

  // Delete unit
  const deleteUnit = async (unitId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const unitRef = doc(db, 'units', unitId);
      await deleteDoc(unitRef);
      fetchUnits(); // Refresh the list
    } catch (err) {
      console.error('Error deleting unit:', err);
      throw new Error('Erreur lors de la suppression de l\'unité');
    }
  };

  // Get units by project
  const getUnitsByProject = (projectId: string) => {
    return units.filter(unit => unit.projectId === projectId);
  };

  // Auto-fetch units when user changes
  useEffect(() => {
    const loadUnits = async () => {
      if (user?.uid) {
        await fetchUnits();
      } else {
        setUnits([]);
        setLoading(false);
      }
    };
    
    loadUnits();
  }, [user?.uid, fetchUnits]);

  return { 
    units, 
    loading, 
    error, 
    fetchUnits, 
    addUnit, 
    updateUnit, 
    deleteUnit,
    getUnitsByProject
  };
};
