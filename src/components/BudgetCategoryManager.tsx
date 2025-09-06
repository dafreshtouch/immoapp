import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useBudgetCategories, CategoryBudget } from '../hooks/useBudgetCategories';
import { useAuth } from '../hooks/useAuth';
import './BudgetCategoryManager.css';

export function BudgetCategoryManager() {
  const { user } = useAuth();
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useBudgetCategories();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3b82f6',
    allocated: 0
  });

  // Catégories par défaut pour le budget
  const defaultBudgetCategories = [
    { name: 'Marketing', color: '#8b5cf6', allocated: 2500 },
    { name: 'Opérationnel', color: '#06b6d4', allocated: 2500 },
    { name: 'Personnel', color: '#10b981', allocated: 5000 },
    { name: 'Équipement', color: '#f59e0b', allocated: 500 },
    { name: 'Divers', color: '#ef4444', allocated: 200 }
  ];

  const handleAddCategory = async () => {
    if (!user || !newCategory.name.trim()) return;

    try {
      await addCategory({
        name: newCategory.name,
        color: newCategory.color,
        allocated: newCategory.allocated
      });

      setNewCategory({ name: '', color: '#3b82f6', allocated: 0 });
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<CategoryBudget>) => {
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

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie de budget ?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="budget-category-manager">
        <h3>Gestion des catégories de budget</h3>
        <p>Veuillez vous connecter pour gérer les catégories de budget.</p>
      </div>
    );
  }

  return (
    <div className="budget-category-manager">
      <div className="category-header">
        <button 
          className="add-category-btn"
          onClick={() => setIsAddingCategory(true)}
        >
          <Plus size={16} />
          Ajouter une catégorie de budget
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
          <BudgetCategoryItem
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
          <div className="budget-category-item editing">
            <div className="category-form">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="name-input"
                autoFocus
              />
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="color-input"
              />
              <input
                type="number"
                placeholder="Budget alloué"
                value={newCategory.allocated}
                onChange={(e) => setNewCategory(prev => ({ ...prev, allocated: Number(e.target.value) }))}
                className="budget-input"
                min="0"
                step="50"
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

interface BudgetCategoryItemProps {
  category: CategoryBudget;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<CategoryBudget>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function BudgetCategoryItem({ category, isEditing, onEdit, onSave, onCancel, onDelete }: BudgetCategoryItemProps) {
  const [editData, setEditData] = useState({
    name: category.name,
    color: category.color,
    allocated: category.allocated
  });

  useEffect(() => {
    setEditData({
      name: category.name,
      color: category.color,
      allocated: category.allocated
    });
  }, [category]);

  const handleSave = () => {
    onSave(editData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isEditing) {
    return (
      <div className="budget-category-item editing">
        <div className="category-form">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="name-input"
          />
          <input
            type="color"
            value={editData.color}
            onChange={(e) => setEditData(prev => ({ ...prev, color: e.target.value }))}
            className="color-input"
          />
          <input
            type="number"
            value={editData.allocated}
            onChange={(e) => setEditData(prev => ({ ...prev, allocated: Number(e.target.value) }))}
            className="budget-input"
            min="0"
            step="50"
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
    <div className="budget-category-item">
      <div className="category-info">
        <div 
          className="category-color" 
          style={{ backgroundColor: category.color }}
        ></div>
        <span className="category-name">{category.name}</span>
        <span className="category-budget">
          {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
        </span>
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
