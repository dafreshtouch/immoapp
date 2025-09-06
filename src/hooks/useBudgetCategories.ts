import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { useTransactions, Transaction } from './useTransactions';

export interface CategoryBudget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface BudgetCategoriesSettings {
  categories: CategoryBudget[];
  updatedAt?: any;
}

const defaultCategories: CategoryBudget[] = [
  { id: '1', name: 'Marketing', allocated: 3000, spent: 0, color: '#8b5cf6' },
  { id: '2', name: 'Opérationnel', allocated: 2400, spent: 0, color: '#06b6d4' },
  { id: '3', name: 'Personnel', allocated: 4200, spent: 0, color: '#10b981' },
  { id: '4', name: 'Équipement', allocated: 1200, spent: 0, color: '#f59e0b' },
  { id: '5', name: 'Divers', allocated: 1200, spent: 0, color: '#ef4444' }
];

export function useBudgetCategories(marketingExpenses = 0, transactionExpenses = 0) {
  const [categories, setCategories] = useState<CategoryBudget[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { transactions } = useTransactions();

  // Charger les catégories depuis Firebase
  useEffect(() => {
    if (!user) {
      setCategories(defaultCategories);
      setLoading(false);
      return;
    }

    const loadCategories = async () => {
      try {
        const docRef = doc(db, 'budgetCategories', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as BudgetCategoriesSettings;
          setCategories(data.categories || defaultCategories);
        } else {
          // Créer le document avec les valeurs par défaut
          await setDoc(docRef, {
            categories: defaultCategories,
            updatedAt: new Date(),
            userId: user.uid
          });
          setCategories(defaultCategories);
        }
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors du chargement des catégories budget:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadCategories();
  }, [user]);

  // Fonction pour mapper les catégories de transactions aux catégories de budget
  const mapTransactionToCategory = (transactionCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      // Marketing
      'Marketing Digital': 'Marketing',
      'Marketing Traditionnel': 'Marketing',
      'Publicité Facebook/Google': 'Marketing',
      'SEO/SEM': 'Marketing',
      
      // Opérationnel
      'Infrastructure Web': 'Opérationnel',
      'Hébergement/Domaines': 'Opérationnel',
      'Outils/Logiciels': 'Opérationnel',
      'Support Client': 'Opérationnel',
      
      // Personnel
      'Événements/Salons': 'Personnel',
      'Formation/Certification': 'Personnel',
      'Développement Web': 'Personnel',
      'Design/UX': 'Personnel',
      
      // Équipement
      'Alimentation': 'Équipement',
      'Transport': 'Équipement',
      'Logement': 'Équipement',
      
      // Divers
      'Santé': 'Divers',
      'Loisirs': 'Divers',
      'Vêtements': 'Divers',
      'Éducation': 'Divers',
      'Autre': 'Divers'
    };
    
    return categoryMap[transactionCategory] || 'Divers';
  };

  // Calculer les dépenses réelles par catégorie depuis les transactions
  const calculateCategoryExpenses = () => {
    // Initialiser avec toutes les catégories de budget
    const expensesByCategory: { [key: string]: number } = {};
    categories.forEach(cat => {
      expensesByCategory[cat.name] = cat.name === 'Marketing' ? marketingExpenses : 0;
    });

    // Additionner les transactions par catégorie exacte
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        // Utiliser directement la catégorie de la transaction si elle existe dans les catégories de budget
        const categoryExists = categories.find(cat => cat.name === transaction.category);
        if (categoryExists && transaction.category !== 'Marketing') {
          expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
        } else if (!categoryExists) {
          // Si la catégorie n'existe pas, l'ajouter à "Divers" si cette catégorie existe
          const diversCategory = categories.find(cat => cat.name === 'Divers');
          if (diversCategory) {
            expensesByCategory['Divers'] = (expensesByCategory['Divers'] || 0) + transaction.amount;
          }
        }
      });

    return expensesByCategory;
  };

  // Mettre à jour les dépenses réelles
  useEffect(() => {
    const expensesByCategory = calculateCategoryExpenses();
    
    setCategories(prev => prev.map(cat => ({
      ...cat,
      spent: expensesByCategory[cat.name] || 0
    })));
  }, [marketingExpenses, transactions]);

  const updateCategoryBudget = async (categoryId: string, newAmount: number) => {
    if (!user) {
      setError('Utilisateur non connecté');
      throw new Error('Utilisateur non connecté');
    }

    if (newAmount < 0) {
      setError('Le budget doit être positif');
      throw new Error('Le budget doit être positif');
    }

    try {
      const updatedCategories = categories.map(cat => 
        cat.id === categoryId ? { ...cat, allocated: newAmount } : cat
      );

      // Sauvegarder dans Firebase
      const docRef = doc(db, 'budgetCategories', user.uid);
      await setDoc(docRef, {
        categories: updatedCategories,
        updatedAt: new Date(),
        userId: user.uid
      });
      
      setCategories(updatedCategories);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      setError(err.message);
      throw err;
    }
  };

  const addCategory = async (newCategory: { name: string; color: string; allocated: number }) => {
    if (!user) {
      setError('Utilisateur non connecté');
      throw new Error('Utilisateur non connecté');
    }

    if (!newCategory.name.trim()) {
      setError('Le nom de la catégorie est requis');
      throw new Error('Le nom de la catégorie est requis');
    }

    if (newCategory.allocated < 0) {
      setError('Le budget doit être positif');
      throw new Error('Le budget doit être positif');
    }

    try {
      // Générer un nouvel ID unique
      const newId = `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const categoryToAdd: CategoryBudget = {
        id: newId,
        name: newCategory.name.trim(),
        color: newCategory.color,
        allocated: newCategory.allocated,
        spent: 0
      };

      const updatedCategories = [...categories, categoryToAdd];

      // Sauvegarder dans Firebase
      const docRef = doc(db, 'budgetCategories', user.uid);
      await setDoc(docRef, {
        categories: updatedCategories,
        updatedAt: new Date(),
        userId: user.uid
      });
      
      setCategories(updatedCategories);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de la catégorie:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!user) {
      setError('Utilisateur non connecté');
      throw new Error('Utilisateur non connecté');
    }

    try {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);

      // Sauvegarder dans Firebase
      const docRef = doc(db, 'budgetCategories', user.uid);
      await setDoc(docRef, {
        categories: updatedCategories,
        updatedAt: new Date(),
        userId: user.uid
      });
      
      setCategories(updatedCategories);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<CategoryBudget>) => {
    if (!user) {
      setError('Utilisateur non connecté');
      throw new Error('Utilisateur non connecté');
    }

    try {
      const updatedCategories = categories.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      );

      // Sauvegarder dans Firebase
      const docRef = doc(db, 'budgetCategories', user.uid);
      await setDoc(docRef, {
        categories: updatedCategories,
        updatedAt: new Date(),
        userId: user.uid
      });
      
      setCategories(updatedCategories);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    updateCategoryBudget,
    addCategory,
    deleteCategory,
    updateCategory
  };
}
