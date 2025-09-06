import React from 'react';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import './TransactionList.css';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  source?: 'manual' | 'marketing';
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <p>Aucune transaction enregistrée</p>
        <p>Commencez par ajouter votre première transaction !</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h3>Transactions récentes</h3>
      <div className="transactions">
        {sortedTransactions.map(transaction => (
          <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-icon">
              {transaction.type === 'income' ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            
            <div className="transaction-details">
              <div className="transaction-header">
                <span className="transaction-description">{transaction.description}</span>
                <span className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="transaction-meta">
                <span className="transaction-category">{transaction.category}</span>
                <span className="transaction-date">{formatDate(transaction.date)}</span>
              </div>
            </div>

            {transaction.source !== 'marketing' && (
              <button 
                className="delete-button"
                onClick={() => onDelete(transaction.id)}
                title="Supprimer la transaction"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
