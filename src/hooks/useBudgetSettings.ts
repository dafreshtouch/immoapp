import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

interface BudgetSettings {
  monthlyBudget: number;
  updatedAt?: any;
}

interface BudgetHistoryEntry {
  userId: string;
  previousBudget: number;
  newBudget: number;
  changedAt: Date;
  reason?: string;
}

export function useBudgetSettings() {
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setMonthlyBudget(2500);
      setLoading(false);
      return;
    }

    const loadBudgetSettings = async () => {
      try {
        const docRef = doc(db, 'budgetSettings', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as BudgetSettings;
          setMonthlyBudget(data.monthlyBudget || 2500);
        } else {
          // Créer le document avec la valeur par défaut
          await setDoc(docRef, {
            monthlyBudget: 2500,
            updatedAt: new Date(),
            userId: user.uid
          });
          setMonthlyBudget(2500);
          
          // Créer l'entrée d'historique initiale
          await saveBudgetHistory(0, 2500, 'Création du budget initial');
        }
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors du chargement des paramètres budget:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadBudgetSettings();
  }, [user]);

  const saveBudgetHistory = async (previousBudget: number, newBudget: number, reason?: string) => {
    if (!user) return;

    try {
      const historyEntry: BudgetHistoryEntry = {
        userId: user.uid,
        previousBudget,
        newBudget,
        changedAt: new Date(),
        reason: reason || 'Modification manuelle'
      };

      await addDoc(collection(db, 'budgetHistory'), historyEntry);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', err);
    }
  };

  const updateMonthlyBudget = async (newBudget: number, reason?: string) => {
    if (!user) {
      setError('Utilisateur non connecté');
      throw new Error('Utilisateur non connecté');
    }

    if (newBudget <= 0) {
      setError('Le budget doit être supérieur à 0');
      throw new Error('Le budget doit être supérieur à 0');
    }

    try {
      const previousBudget = monthlyBudget;
      
      // Sauvegarder dans budgetSettings
      const docRef = doc(db, 'budgetSettings', user.uid);
      await setDoc(docRef, {
        monthlyBudget: newBudget,
        updatedAt: new Date(),
        userId: user.uid
      });
      
      // Sauvegarder l'historique
      await saveBudgetHistory(previousBudget || 0, newBudget, reason);
      
      setMonthlyBudget(newBudget);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du budget:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    monthlyBudget,
    loading,
    error,
    updateMonthlyBudget
  };
}
