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
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface CampaignData {
  id: string;
  platform: string;
  name: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
  createdAt?: any;
  updatedAt?: any;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const campaignsRef = collection(db, 'campaigns');
    const q = query(
      campaignsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const campaignsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CampaignData[];
        
        setCampaigns(campaignsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching campaigns:', error);
        setError('Erreur lors du chargement des campagnes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addCampaign = async (campaignData: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const docRef = await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('Campagne ajoutée avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la campagne:', error);
      throw error;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<CampaignData>) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const campaignRef = doc(db, 'campaigns', id);
      await updateDoc(campaignRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      console.log('Campagne mise à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la campagne:', error);
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      await deleteDoc(doc(db, 'campaigns', id));
      console.log('Campagne supprimée:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error);
      throw error;
    }
  };

  const updateCampaignMetrics = async (id: string, metrics: {
    spent?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    roi?: number;
  }) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const campaignRef = doc(db, 'campaigns', id);
      await updateDoc(campaignRef, {
        ...metrics,
        updatedAt: Timestamp.now()
      });
      
      console.log('Métriques de campagne mises à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des métriques:', error);
      throw error;
    }
  };

  const pauseCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'paused' });
  };

  const resumeCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'active' });
  };

  const completeCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'completed' });
  };

  return {
    campaigns,
    loading,
    error,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignMetrics,
    pauseCampaign,
    resumeCampaign,
    completeCampaign
  };
}
