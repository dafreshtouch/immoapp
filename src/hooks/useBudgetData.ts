import { useTransactions } from './useTransactions';
import { useFirestore } from './useFirestore';

interface MarketingCost {
  id: string;
  type: 'impression' | 'digital' | 'subscription';
  name: string;
  cost: number;
  createdAt?: any;
}

export function useBudgetData() {
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const { data: marketingCosts, loading: costsLoading, error: costsError } = useFirestore<MarketingCost>('marketingCosts');

  // Calcul des revenus depuis les transactions
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcul des dépenses depuis les transactions
  const transactionExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcul du total des coûts marketing
  const marketingExpenses = marketingCosts.reduce((sum, cost) => sum + cost.cost, 0);

  // Total des dépenses (transactions + marketing)
  const totalExpenses = transactionExpenses + marketingExpenses;

  // Solde net
  const netBalance = totalIncome - totalExpenses;

  // Répartition des coûts marketing par type
  const marketingBreakdown = {
    impression: marketingCosts
      .filter(cost => cost.type === 'impression')
      .reduce((sum, cost) => sum + cost.cost, 0),
    digital: marketingCosts
      .filter(cost => cost.type === 'digital')
      .reduce((sum, cost) => sum + cost.cost, 0),
    subscription: marketingCosts
      .filter(cost => cost.type === 'subscription')
      .reduce((sum, cost) => sum + cost.cost, 0)
  };

  return {
    // Données principales
    totalIncome,
    totalExpenses,
    netBalance,
    
    // Détail des dépenses
    transactionExpenses,
    marketingExpenses,
    marketingBreakdown,
    
    // Données brutes
    transactions,
    marketingCosts,
    
    // États de chargement
    loading: transactionsLoading || costsLoading,
    error: transactionsError || costsError
  };
}
