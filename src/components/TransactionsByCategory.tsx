import React, { useState } from 'react';
import { Transaction } from '../hooks/useTransactions';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import './TransactionsByCategory.css';

interface TransactionsByCategoryProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

export function TransactionsByCategory({ transactions, onDelete, canEdit = false }: TransactionsByCategoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Grouper les transactions par catégorie
  const transactionsByCategory = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = [];
    }
    acc[transaction.category].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Calculer les totaux par catégorie
  const categoryTotals = Object.entries(transactionsByCategory).map(([category, categoryTransactions]) => {
    const income = categoryTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = categoryTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      category,
      transactions: categoryTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      income,
      expenses,
      net: income - expenses,
      count: categoryTransactions.length
    };
  }).sort((a, b) => b.count - a.count); // Trier par nombre de transactions

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getTypeColor = (type: 'income' | 'expense') => {
    return type === 'income' ? '#10b981' : '#ef4444';
  };

  const getTypeIcon = (type: 'income' | 'expense') => {
    return type === 'income' ? '+' : '-';
  };

  if (transactions.length === 0) {
    return (
      <div className="transactions-by-category">
        <div className="no-transactions">
          Aucune transaction disponible
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-by-category">
      <div className="category-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Catégories</span>
            <span className="stat-value">{categoryTotals.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total transactions</span>
            <span className="stat-value">{transactions.length}</span>
          </div>
        </div>
      </div>

      <div className="categories-list">
        {categoryTotals.map(({ category, transactions: categoryTransactions, income, expenses, net, count }) => {
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className="category-group">
              <div 
                className="category-header"
                onClick={() => toggleCategory(category)}
              >
                <div className="category-info">
                  <div className="category-toggle">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="category-details">
                    <h4 className="category-name">{category}</h4>
                    <span className="transaction-count">{count} transaction{count > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="category-totals">
                  {income > 0 && (
                    <div className="total-item income">
                      <span className="total-label">Revenus</span>
                      <span className="total-amount">{formatCurrency(income)}</span>
                    </div>
                  )}
                  {expenses > 0 && (
                    <div className="total-item expense">
                      <span className="total-label">Dépenses</span>
                      <span className="total-amount">{formatCurrency(expenses)}</span>
                    </div>
                  )}
                  <div className={`total-item net ${net >= 0 ? 'positive' : 'negative'}`}>
                    <span className="total-label">Net</span>
                    <span className="total-amount">{formatCurrency(net)}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="category-transactions">
                  {categoryTransactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-main">
                          <div className="transaction-type">
                            <span 
                              className={`type-indicator ${transaction.type}`}
                              style={{ color: getTypeColor(transaction.type) }}
                            >
                              {getTypeIcon(transaction.type)}
                            </span>
                          </div>
                          <div className="transaction-details">
                            <div className="transaction-description">{transaction.description}</div>
                            <div className="transaction-date">{formatDate(transaction.date)}</div>
                          </div>
                        </div>
                        
                        <div className="transaction-amount">
                          <span 
                            className={`amount ${transaction.type}`}
                            style={{ color: getTypeColor(transaction.type) }}
                          >
                            {getTypeIcon(transaction.type)}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      </div>

                      {canEdit && onDelete && transaction.source !== 'marketing' && (
                        <button
                          className="delete-transaction-btn"
                          onClick={() => onDelete(transaction.id)}
                          title="Supprimer cette transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
