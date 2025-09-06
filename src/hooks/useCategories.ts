import { useFirestore } from './useFirestore';
import { defaultCategories } from '../data/defaultCategories';
import { useAuth } from './useAuth';
import { useEffect, useRef } from 'react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  value: string;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useCategories() {
  const { user } = useAuth();
  const {
    data: categories,
    loading,
    error,
    addItem: addCategory,
    updateItem: updateCategory,
    deleteItem: deleteCategory
  } = useFirestore<Category>('eventCategories');

  const hasInitialized = useRef(false);

  // Initialiser les catégories par défaut UNIQUEMENT si aucune n'existe
  useEffect(() => {
    if (!user || loading || hasInitialized.current) {
      return;
    }

    // Attendre que les catégories soient complètement chargées
    if (categories.length === 0) {
      hasInitialized.current = true;

      const initializeCategories = async () => {
        console.log('Initializing default categories for user:', user.uid);
        
        try {
          // Double vérification - ne pas initialiser s'il y a déjà des catégories
          if (categories.length > 0) {
            console.log('Categories already exist, aborting initialization');
            return;
          }

          // Créer un Set pour éviter les doublons pendant l'ajout
          const addedValues = new Set<string>();
          const addedNames = new Set<string>();

          for (const category of defaultCategories) {
            const normalizedValue = category.value.toLowerCase().trim();
            const normalizedName = category.name.toLowerCase().trim();
            
            // Vérifier les doublons dans ce qui va être ajouté
            if (!addedValues.has(normalizedValue) && !addedNames.has(normalizedName)) {
              await addCategory({
                name: category.name,
                icon: category.icon,
                value: category.value
              });
              
              addedValues.add(normalizedValue);
              addedNames.add(normalizedName);
              
              console.log(`Added category: ${category.name}`);
              // Délai pour éviter les conditions de course
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              console.log(`Skipping duplicate category: ${category.name}`);
            }
          }
          console.log('Default categories initialized successfully');
        } catch (error) {
          console.error('Error initializing default categories:', error);
          hasInitialized.current = false;
        }
      };

      // Délai plus long pour s'assurer que toutes les catégories existantes sont chargées
      setTimeout(initializeCategories, 500);
    }
  }, [user?.uid, loading, categories.length]);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory
  };
}
