import React, { useState } from 'react';
import { Transaction } from '../hooks/useTransactions';
import './TabbedTransactions.css';

interface TabbedTransactionsProps {
  transactions: Transaction[];
  children: (filteredTransactions: Transaction[]) => React.ReactNode;
}

export function TabbedTransactions({ transactions, children }: TabbedTransactionsProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'expenses' | 'income'>('global');

  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'expenses':
        return transactions.filter(t => t.type === 'expense');
      case 'income':
        return transactions.filter(t => t.type === 'income');
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const getTransactionCount = (type: 'global' | 'expenses' | 'income') => {
    switch (type) {
      case 'expenses':
        return transactions.filter(t => t.type === 'expense').length;
      case 'income':
        return transactions.filter(t => t.type === 'income').length;
      default:
        return transactions.length;
    }
  };

  return (
    <div className="tabbed-transactions">
      <div className="transaction-tabs">
        <button
          className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          Global ({getTransactionCount('global')})
        </button>
        <button
          className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Dépenses ({getTransactionCount('expenses')})
        </button>
        <button
          className={`tab-button ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Revenus ({getTransactionCount('income')})
        </button>
      </div>
      
      <div className="tab-content">
        {children(filteredTransactions)}
      </div>
    </div>
  );
}
