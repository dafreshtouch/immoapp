import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Plus, Edit3 } from 'lucide-react';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import './BudgetCategories.css';

interface BudgetCategoriesProps {
  totalBudget: number;
  marketingExpenses?: number;
  transactionExpenses?: number;
}

export function BudgetCategories({ totalBudget, marketingExpenses = 0, transactionExpenses = 0 }: BudgetCategoriesProps) {
  const { categories, loading, error, updateCategoryBudget } = useBudgetCategories(marketingExpenses, transactionExpenses);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const unallocated = totalBudget - totalAllocated;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getUsagePercentage = (spent: number, allocated: number) => {
    return allocated > 0 ? (spent / allocated) * 100 : 0;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return '#ef4444';
    if (percentage > 80) return '#f59e0b';
    return '#10b981';
  };

  const handleEditStart = (categoryId: string, currentAmount: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentAmount.toString());
  };

  const handleEditSave = async (categoryId: string) => {
    const newAmount = parseFloat(editValue);
    if (!isNaN(newAmount) && newAmount >= 0) {
      try {
        await updateCategoryBudget(categoryId, newAmount);
        setEditingCategory(null);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du budget');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: cat.allocated,
    color: cat.color
  }));

  const barData = categories.map(cat => ({
    name: cat.name,
    alloué: cat.allocated,
    dépensé: cat.spent,
    pourcentage: getUsagePercentage(cat.spent, cat.allocated)
  }));

  if (loading) {
    return (
      <div className="budget-categories">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Chargement des catégories...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-categories">
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="budget-categories">
      <div className="categories-header">
        <h3>Budget par catégorie</h3>
        <div className="budget-overview">
          <div className="overview-item">
            <span className="label">Total alloué:</span>
            <span className="value">{formatCurrency(totalAllocated)}</span>
          </div>
          <div className="overview-item">
            <span className="label">Non alloué:</span>
            <span className={`value ${unallocated < 0 ? 'negative' : 'positive'}`}>
              {formatCurrency(unallocated)}
            </span>
          </div>
        </div>
      </div>

      <div className="categories-content">
        <div className="categories-list">
          {categories.map(category => {
            const percentage = getUsagePercentage(category.spent, category.allocated);
            const statusColor = getStatusColor(percentage);
            
            return (
              <div 
                key={category.id} 
                className="category-item"
                style={{
                  background: `linear-gradient(90deg, ${category.color} ${Math.min(percentage, 100)}%, #374151 ${Math.min(percentage, 100)}%)`,
                  borderColor: `${category.color}`
                }}
              >
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-header">
                      <span className="category-name">{category.name}</span>
                    </div>
                    <div className="category-amounts">
                      {editingCategory === category.id ? (
                        <div className="edit-amount-container">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave(category.id);
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            className="edit-amount-input"
                            autoFocus
                          />
                          <button 
                            className="save-edit-btn"
                            onClick={() => handleEditSave(category.id)}
                            title="Sauvegarder"
                          >
                            ✓
                          </button>
                          <button 
                            className="cancel-edit-btn"
                            onClick={handleEditCancel}
                            title="Annuler"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="spent-amount">
                            {formatCurrency(category.spent)}
                          </span>
                          <span 
                            className="allocated-amount clickable"
                            onClick={() => handleEditStart(category.id, category.allocated)}
                            title="Cliquer pour modifier"
                          >
                            / {formatCurrency(category.allocated)}
                          </span>
                          <button 
                            className="edit-category-btn"
                            onClick={() => handleEditStart(category.id, category.allocated)}
                            title="Modifier le budget alloué"
                          >
                            <Edit3 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="category-percentage">
                  {percentage.toFixed(1)}%
                  {percentage > 100 && (
                    <AlertTriangle size={14} color="#ef4444" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {unallocated < 0 && (
        <div className="budget-alert">
          <AlertTriangle size={16} />
          <span>
            Attention: Vous avez sur-alloué votre budget de {formatCurrency(Math.abs(unallocated))}
          </span>
        </div>
      )}
    </div>
  );
}
