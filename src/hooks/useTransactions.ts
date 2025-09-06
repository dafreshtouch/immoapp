import { useFirestore } from './useFirestore';
import { useMemo } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
  source?: 'manual' | 'marketing'; // Nouvelle propriété pour identifier la source
}

interface MarketingCost {
  id: string;
  type: 'impression' | 'digital' | 'subscription' | 'visual' | 'platform';
  name: string;
  description: string;
  cost: number;
  details: any;
  createdAt?: any;
  updatedAt?: any;
}

export function useTransactions() {
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addItem: addTransaction,
    updateItem: updateTransaction,
    deleteItem: deleteTransaction
  } = useFirestore<Transaction>('transactions');

  const {
    data: marketingCosts,
    loading: marketingLoading,
    error: marketingError
  } = useFirestore<MarketingCost>('marketingCosts');

  // Convertir les coûts marketing en transactions
  const marketingTransactions = useMemo(() => {
    return marketingCosts.map(cost => ({
      id: `marketing_${cost.id}`,
      type: 'expense' as const,
      amount: cost.cost,
      category: 'Marketing',
      description: `${cost.name} - ${cost.description}`,
      date: cost.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
      source: 'marketing' as const,
      createdAt: cost.createdAt,
      updatedAt: cost.updatedAt
    }));
  }, [marketingCosts]);

  // Combiner les transactions manuelles et marketing
  const allTransactions = useMemo(() => {
    return [...transactions, ...marketingTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, marketingTransactions]);

  const loading = transactionsLoading || marketingLoading;
  const error = transactionsError || marketingError;

  return {
    transactions: allTransactions,
    manualTransactions: transactions,
    marketingTransactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
}
