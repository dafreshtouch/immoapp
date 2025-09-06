import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { useCategories, Category } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { cleanupDuplicateCategories } from '../utils/cleanupCategories';
import './CategoryManager.css';

export function CategoryManager() {
  const { user } = useAuth();
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📝',
    value: ''
  });
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Référence pour éviter les nettoyages multiples
  const hasCleanedRef = React.useRef(false);

  // Nettoyer les doublons à chaque changement de catégories
  useEffect(() => {
    if (user && !loading && categories.length > 0) {
      // Vérifier s'il y a des doublons potentiels
      const hasPotentialDuplicates = checkForDuplicates();
      
      if (hasPotentialDuplicates && !hasCleanedRef.current) {
        hasCleanedRef.current = true;
        console.log('Doublons détectés, nettoyage en cours...');
        setTimeout(() => {
          cleanupDuplicates();
        }, 300);
      }
    }
  }, [user, loading, categories]);

  const checkForDuplicates = () => {
    const seenValues = new Set<string>();
    const seenNames = new Set<string>();
    
    for (const category of categories) {
      const normalizedValue = category.value.toLowerCase().trim();
      const normalizedName = category.name.toLowerCase().trim();
      
      if (seenValues.has(normalizedValue) || seenNames.has(normalizedName)) {
        return true;
      }
      seenValues.add(normalizedValue);
      seenNames.add(normalizedName);
    }
    return false;
  };

  const cleanupDuplicates = async () => {
    try {
      console.log(`Nettoyage automatique: ${categories.length} catégories trouvées`);
      
      // Identifier les doublons par valeur ET par nom (normalisés)
      const seenValues = new Set<string>();
      const seenNames = new Set<string>();
      const duplicatesToDelete: string[] = [];
      
      // Trier par date de création pour garder les plus anciennes
      const sortedCategories = [...categories].sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      });
      
      sortedCategories.forEach(category => {
        const normalizedValue = category.value.toLowerCase().trim();
        const normalizedName = category.name.toLowerCase().trim();
        
        const isDuplicateValue = seenValues.has(normalizedValue);
        const isDuplicateName = seenNames.has(normalizedName);
        
        if (isDuplicateValue || isDuplicateName) {
          duplicatesToDelete.push(category.id);
          console.log(`Doublon automatique détecté: ${category.name} (${category.value}) - ID: ${category.id}`);
        } else {
          seenValues.add(normalizedValue);
          seenNames.add(normalizedName);
        }
      });
      
      console.log(`${duplicatesToDelete.length} doublons automatiques à supprimer`);
      
      // Supprimer tous les doublons silencieusement
      if (duplicatesToDelete.length > 0) {
        for (const duplicateId of duplicatesToDelete) {
          try {
            await deleteCategory(duplicateId);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (deleteError) {
            console.error(`Erreur suppression automatique ${duplicateId}:`, deleteError);
          }
        }
        console.log(`Nettoyage automatique terminé: ${duplicatesToDelete.length} doublons supprimés`);
      }
      
    } catch (error) {
      console.error('Erreur lors du nettoyage automatique:', error);
    }
  };

  const handleDrasticCleanup = async () => {
    if (!user || isCleaningUp) return;
    
    const confirmed = window.confirm(
      'ATTENTION: Cette action va supprimer TOUTES les catégories existantes et les recréer. ' +
      'Tous les événements existants pourraient être affectés. Continuer ?'
    );
    
    if (!confirmed) return;
    
    setIsCleaningUp(true);
    try {
      console.log('Démarrage du nettoyage drastique...');
      
      // Supprimer TOUTES les catégories existantes
      const deletePromises = categories.map(category => deleteCategory(category.id));
      await Promise.all(deletePromises);
      
      console.log('Toutes les catégories supprimées, attente...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser les références
      hasCleanedRef.current = false;
      
      alert('Toutes les catégories ont été supprimées. La page va se recharger pour recréer les catégories par défaut.');
      window.location.reload();
      
    } catch (error) {
      console.error('Erreur lors du nettoyage drastique:', error);
      alert('Erreur lors du nettoyage drastique.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleAddCategory = async () => {
    if (!user || !newCategory.name.trim()) return;

    try {
      const value = newCategory.value.trim() || 
        newCategory.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

      // Vérifier si une catégorie avec cette valeur ou ce nom existe déjà
      const existingCategory = categories.find(cat => 
        cat.value === value || cat.name.toLowerCase() === newCategory.name.toLowerCase()
      );
      if (existingCategory) {
        alert('Une catégorie avec ce nom ou cette valeur existe déjà.');
        return;
      }

      await addCategory({
        name: newCategory.name.trim(),
        icon: newCategory.icon,
        value: value
      });

      setNewCategory({ name: '', icon: '📝', value: '' });
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return;

    try {
      await updateCategory(id, updates);
      setEditingId(null);
    } catch (error) {
      console.error('Erreur lors de la modification de la catégorie:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="category-manager">
        <h3>Gestion des catégories d'événements</h3>
        <p>Veuillez vous connecter pour gérer les catégories d'événements.</p>
      </div>
    );
  }

  return (
    <div className="category-manager">
      <div className="category-header">
        <button 
          className="add-category-btn"
          onClick={() => setIsAddingCategory(true)}
        >
          <Plus size={16} />
          Ajouter une catégorie
        </button>
        <button 
          className="cleanup-btn"
          onClick={handleDrasticCleanup}
          disabled={isCleaningUp}
          style={{
            marginLeft: '10px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isCleaningUp ? 'not-allowed' : 'pointer',
            opacity: isCleaningUp ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} className={isCleaningUp ? 'rotating' : ''} />
          {isCleaningUp ? 'Nettoyage...' : 'NETTOYER TOUT'}
        </button>
      </div>

      {loading && (
        <div className="loading">Chargement des catégories...</div>
      )}

      {error && (
        <div className="error">Erreur: {error}</div>
      )}

      <div className="categories-list">
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            isEditing={editingId === category.id}
            onEdit={() => setEditingId(category.id)}
            onSave={(updates) => handleUpdateCategory(category.id, updates)}
            onCancel={() => setEditingId(null)}
            onDelete={() => handleDeleteCategory(category.id)}
          />
        ))}

        {isAddingCategory && (
          <div className="category-item editing">
            <div className="category-form">
              <input
                type="text"
                placeholder="Icône (emoji)"
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                className="icon-input"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="name-input"
                autoFocus
              />
              <input
                type="text"
                placeholder="Valeur (optionnel)"
                value={newCategory.value}
                onChange={(e) => setNewCategory(prev => ({ ...prev, value: e.target.value }))}
                className="value-input"
              />
            </div>
            <div className="category-actions">
              <button onClick={handleAddCategory} className="save-btn">
                <Save size={14} />
              </button>
              <button onClick={() => setIsAddingCategory(false)} className="cancel-btn">
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Category>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function CategoryItem({ category, isEditing, onEdit, onSave, onCancel, onDelete }: CategoryItemProps) {
  const [editData, setEditData] = useState({
    name: category.name,
    icon: category.icon,
    value: category.value
  });

  useEffect(() => {
    setEditData({
      name: category.name,
      icon: category.icon,
      value: category.value
    });
  }, [category]);

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="category-item editing">
        <div className="category-form">
          <input
            type="text"
            value={editData.icon}
            onChange={(e) => setEditData(prev => ({ ...prev, icon: e.target.value }))}
            className="icon-input"
            maxLength={2}
          />
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="name-input"
          />
          <input
            type="text"
            value={editData.value}
            onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
            className="value-input"
          />
        </div>
        <div className="category-actions">
          <button onClick={handleSave} className="save-btn">
            <Save size={14} />
          </button>
          <button onClick={onCancel} className="cancel-btn">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-item">
      <div className="category-info">
        <span className="category-icon">{category.icon}</span>
        <span className="category-name">{category.name}</span>
        <span className="category-value">({category.value})</span>
      </div>
      <div className="category-actions">
        <button onClick={onEdit} className="edit-btn">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="delete-btn">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
