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

export interface GestionDocument {
  id: string;
  name: string;
  description?: string;
  type: 'contract' | 'invoice' | 'permit' | 'plan' | 'photo' | 'report' | 'legal' | 'other';
  category: 'administrative' | 'technical' | 'financial' | 'legal' | 'marketing';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags?: string[];
  projectId?: string;
  unitId?: string;
  contractorId?: string;
  expirationDate?: Date;
  isConfidential: boolean;
  accessLevel: 'public' | 'restricted' | 'private';
  uploadedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useGestionDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<GestionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents
  const fetchDocuments = async (projectId?: string) => {
    if (!user) {
      console.log('useGestionDocuments: No user authenticated');
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`useGestionDocuments: Fetching documents for user ${user.uid}`);
      const documentsRef = collection(db, 'documents');
      let q;

      if (projectId) {
        q = query(
          documentsRef,
          where('userId', '==', user.uid),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          documentsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      console.log(`useGestionDocuments: Found ${querySnapshot.docs.length} documents`);

      const documentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expirationDate: data.expirationDate?.toDate() || undefined,
          approvedAt: data.approvedAt?.toDate() || undefined,
        };
      }) as GestionDocument[];

      setDocuments(documentsData);
      setError(null);
      console.log('useGestionDocuments: Documents loaded successfully:', documentsData);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(`Erreur lors du chargement des documents: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new document
  const addDocument = async (documentData: Omit<GestionDocument, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'version'>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionDocuments: Adding new document:', documentData);
      const newDocument = {
        ...documentData,
        userId: user.uid,
        version: 1,
        uploadedBy: user.displayName || user.email || 'Utilisateur',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        expirationDate: documentData.expirationDate ? Timestamp.fromDate(documentData.expirationDate) : undefined,
      };

      const docRef = await addDoc(collection(db, 'documents'), newDocument);
      console.log('useGestionDocuments: Document added with ID:', docRef.id);
      
      await fetchDocuments(); // Refresh data
      return docRef.id;
    } catch (err) {
      console.error('Error adding document:', err);
      throw new Error(`Erreur lors de l'ajout du document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update document
  const updateDocument = async (id: string, updates: Partial<Omit<GestionDocument, 'id' | 'createdAt' | 'userId'>>) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionDocuments: Updating document:', id, updates);
      const documentRef = doc(db, 'documents', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert dates to Timestamps
      if (updates.expirationDate) {
        updateData.expirationDate = Timestamp.fromDate(updates.expirationDate);
      }
      if (updates.approvedAt) {
        updateData.approvedAt = Timestamp.fromDate(updates.approvedAt);
      }

      await updateDoc(documentRef, updateData);
      console.log('useGestionDocuments: Document updated successfully');
      await fetchDocuments(); // Refresh data
    } catch (err) {
      console.error('Error updating document:', err);
      throw new Error(`Erreur lors de la mise à jour du document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      console.log('useGestionDocuments: Deleting document:', id);
      await deleteDoc(doc(db, 'documents', id));
      console.log('useGestionDocuments: Document deleted successfully');
      
      await fetchDocuments(); // Refresh data
    } catch (err) {
      console.error('Error deleting document:', err);
      throw new Error(`Erreur lors de la suppression du document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Approve document
  const approveDocument = async (id: string) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    await updateDocument(id, {
      status: 'approved',
      approvedBy: user.displayName || user.email || 'Utilisateur',
      approvedAt: new Date(),
    });
  };

  // Get documents by type
  const getDocumentsByType = (type: GestionDocument['type']) => {
    return documents.filter(document => document.type === type);
  };

  // Get documents by category
  const getDocumentsByCategory = (category: GestionDocument['category']) => {
    return documents.filter(document => document.category === category);
  };

  // Get documents by status
  const getDocumentsByStatus = (status: GestionDocument['status']) => {
    return documents.filter(document => document.status === status);
  };

  // Get expiring documents (within next 30 days)
  const getExpiringDocuments = (days: number = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return documents.filter(document => 
      document.expirationDate && 
      document.expirationDate <= futureDate &&
      document.expirationDate >= new Date()
    );
  };

  // Search documents
  const searchDocuments = (searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return documents.filter(document =>
      document.name.toLowerCase().includes(term) ||
      document.description?.toLowerCase().includes(term) ||
      document.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    approveDocument,
    fetchDocuments,
    getDocumentsByType,
    getDocumentsByCategory,
    getDocumentsByStatus,
    getExpiringDocuments,
    searchDocuments,
  };
};
