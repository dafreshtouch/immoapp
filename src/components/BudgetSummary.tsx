import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Edit3, Check, X } from 'lucide-react';
import './BudgetSummary.css';

interface BudgetSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  onBudgetUpdate?: (newBudget: number) => void;
  canEdit?: boolean;
}

export function BudgetSummary({ totalIncome, totalExpenses, monthlyBudget, onBudgetUpdate, canEdit = false }: BudgetSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(monthlyBudget.toString());

  // Mettre à jour editValue quand monthlyBudget change
  React.useEffect(() => {
    setEditValue(monthlyBudget.toString());
  }, [monthlyBudget]);
  
  // Éviter les calculs avec des valeurs par défaut pendant le chargement
  const balance = totalIncome - totalExpenses;
  const budgetUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleEditStart = () => {
    setEditValue(monthlyBudget.toString());
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    const newBudget = parseFloat(editValue);
    if (!isNaN(newBudget) && newBudget > 0 && onBudgetUpdate) {
      try {
        await onBudgetUpdate(newBudget);
        setIsEditing(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du budget');
      }
    }
  };

  const handleEditCancel = () => {
    setEditValue(monthlyBudget.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div className="budget-summary">
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <h3>Revenus</h3>
            <p className="amount">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="card-icon">
            <TrendingDown size={24} />
          </div>
          <div className="card-content">
            <h3>Dépenses</h3>
            <p className="amount">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3>Solde</h3>
            <p className="amount">{formatCurrency(balance)}</p>
          </div>
        </div>

        <div className="summary-card budget">
          <div className="card-icon">
            <Target size={24} />
          </div>
          <div className="card-content">
            <div className="budget-header">
              <h3>Budget restant</h3>
            </div>
            <p className="amount">{formatCurrency(budgetRemaining)}</p>
          </div>
        </div>
      </div>

      <div className="budget-progress">
        <div className="progress-header" style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
          <h4 style={{ color: '#000', margin: 0 }}>Utilisation du budget mensuel</h4>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="progress-percentage" style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>{budgetUsed.toFixed(1)}%</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${budgetUsed > 100 ? 'over-budget' : budgetUsed > 80 ? 'warning' : 'normal'}`}
            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
          />
        </div>
        <div className="progress-info">
          <div className="budget-display">
            {isEditing ? (
              <div className="budget-edit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{color: '#000'}}>{formatCurrency(totalExpenses)} / </span>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #007bff',
                    borderRadius: '6px',
                    fontSize: '14px',
                    width: '120px',
                    color: '#000',
                    backgroundColor: '#fff'
                  }}
                  min="0"
                  step="100"
                  autoFocus
                  placeholder="Budget"
                />
                <span style={{ color: '#000' }}>€</span>
                <div className="edit-actions" style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={handleEditSave}
                    style={{
                      background: '#28a745',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Sauvegarder"
                  >
                    <Check size={14} />
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    style={{
                      background: '#dc3545',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Annuler"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span style={{color: '#000', fontSize: '18px', fontWeight: '600'}}>
                  {formatCurrency(totalExpenses)} / {formatCurrency(monthlyBudget)}
                </span>
                <button 
                  onClick={handleEditStart}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginLeft: '12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Modifier le budget"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <Edit3 size={14} />
                  Modifier
                </button>
              </>
            )}
          </div>
          {budgetUsed > 100 && (
            <span className="over-budget-text">Dépassement de {formatCurrency(totalExpenses - monthlyBudget)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
