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

export interface GestionContractor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  specialty: 'plumbing' | 'electrical' | 'painting' | 'flooring' | 'roofing' | 'hvac' | 'general' | 'landscaping' | 'cleaning' | 'other';
  rating: number; // 1-5 stars
  status: 'active' | 'inactive' | 'blacklisted';
  certifications?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    expirationDate: Date;
  };
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  notes?: string;
  projectsCompleted: number;
  lastWorked?: Date;
  documents?: string[]; // document IDs
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useGestionContractors = () => {
  const { user } = useAuth();
  const [contractors, setContractors] = useState<GestionContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contractors
  const fetchContractors = async () => {
    if (!user) {
      console.log('useGestionContractors: No user authenticated');
      setContractors([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`useGestionContractors: Fetching contractors for user ${user.uid}`);
      const contractorsRef = collection(db, 'contractors');
      const q = query(
        contractorsRef,
        where('userId', '==', user.uid),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      console.log(`useGestionContractors: Found ${querySnapshot.docs.length} contractors`);

      const contractorsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastWorked: data.lastWorked?.toDate() || undefined,
          insurance: data.insurance ? {
            ...data.insurance,
            expirationDate: data.insurance.expirationDate?.toDate() || new Date()
          } : undefined,
        };
      }) as GestionContractor[];

      setContractors(contractorsData);
      setError(null);
      console.log('useGestionContractors: Contractors loaded successfully:', contractorsData);
    } catch (err) {
      console.error('Error fetching contractors:', err);
      setError(`Erreur lors du chargement des prestataires: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new contractor
  const addContractor = async (contractorData: Omit<GestionContractor, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'projectsCompleted'>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionContractors: Adding new contractor:', contractorData);
      const newContractor = {
        ...contractorData,
        userId: user.uid,
        projectsCompleted: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastWorked: contractorData.lastWorked ? Timestamp.fromDate(contractorData.lastWorked) : undefined,
        insurance: contractorData.insurance ? {
          ...contractorData.insurance,
          expirationDate: Timestamp.fromDate(contractorData.insurance.expirationDate)
        } : undefined,
      };

      const docRef = await addDoc(collection(db, 'contractors'), newContractor);
      console.log('useGestionContractors: Contractor added with ID:', docRef.id);
      
      await fetchContractors(); // Refresh data
      return docRef.id;
    } catch (err) {
      console.error('Error adding contractor:', err);
      throw new Error(`Erreur lors de l'ajout du prestataire: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update contractor
  const updateContractor = async (id: string, updates: Partial<Omit<GestionContractor, 'id' | 'createdAt' | 'userId'>>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionContractors: Updating contractor:', id, updates);
      const contractorRef = doc(db, 'contractors', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert dates to Timestamps
      if (updates.lastWorked) {
        updateData.lastWorked = Timestamp.fromDate(updates.lastWorked);
      }
      if (updates.insurance?.expirationDate) {
        updateData.insurance = {
          ...updates.insurance,
          expirationDate: Timestamp.fromDate(updates.insurance.expirationDate)
        };
      }

      await updateDoc(contractorRef, updateData);
      console.log('useGestionContractors: Contractor updated successfully');
      await fetchContractors(); // Refresh data
    } catch (err) {
      console.error('Error updating contractor:', err);
      throw new Error(`Erreur lors de la mise à jour du prestataire: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Delete contractor
  const deleteContractor = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionContractors: Deleting contractor:', id);
      await deleteDoc(doc(db, 'contractors', id));
      console.log('useGestionContractors: Contractor deleted successfully');
      
      await fetchContractors(); // Refresh data
    } catch (err) {
      console.error('Error deleting contractor:', err);
      throw new Error(`Erreur lors de la suppression du prestataire: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Get contractors by specialty
  const getContractorsBySpecialty = (specialty: GestionContractor['specialty']) => {
    return contractors.filter(contractor => contractor.specialty === specialty);
  };

  // Get available contractors
  const getAvailableContractors = () => {
    return contractors.filter(contractor => 
      contractor.availability === 'available' && contractor.status === 'active'
    );
  };

  // Get top rated contractors
  const getTopRatedContractors = (minRating: number = 4) => {
    return contractors
      .filter(contractor => contractor.rating >= minRating && contractor.status === 'active')
      .sort((a, b) => b.rating - a.rating);
  };

  // Get contractors with expiring insurance
  const getContractorsWithExpiringInsurance = (days: number = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return contractors.filter(contractor => 
      contractor.insurance?.expirationDate && 
      contractor.insurance.expirationDate <= futureDate &&
      contractor.insurance.expirationDate >= new Date()
    );
  };

  // Search contractors
  const searchContractors = (searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return contractors.filter(contractor =>
      contractor.name.toLowerCase().includes(term) ||
      contractor.company.toLowerCase().includes(term) ||
      contractor.specialty.toLowerCase().includes(term) ||
      contractor.email.toLowerCase().includes(term)
    );
  };

  // Update contractor rating
  const updateRating = async (id: string, rating: number) => {
    await updateContractor(id, { rating });
  };

  // Mark contractor as worked
  const markAsWorked = async (id: string) => {
    const contractor = contractors.find(c => c.id === id);
    if (contractor) {
      await updateContractor(id, {
        lastWorked: new Date(),
        projectsCompleted: contractor.projectsCompleted + 1
      });
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [user]);

  return {
    contractors,
    loading,
    error,
    addContractor,
    updateContractor,
    deleteContractor,
    fetchContractors,
    getContractorsBySpecialty,
    getAvailableContractors,
    getTopRatedContractors,
    getContractorsWithExpiringInsurance,
    searchContractors,
    updateRating,
    markAsWorked,
  };
};
