import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BudgetSummary } from '../components/BudgetSummary';
import { MarketingCosts } from '../components/MarketingCosts';
import { BudgetCategories } from '../components/BudgetCategories';
import { BudgetInsights } from '../components/BudgetInsights';
import { ROITracker } from '../components/ROITracker';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { MarketingBreakdown } from '../components/MarketingBreakdown';
import { TransactionsByCategory } from '../components/TransactionsByCategory';
import { TabbedTransactions } from '../components/TabbedTransactions';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { useAuth } from '../hooks/useAuth';
import { useBudgetData } from '../hooks/useBudgetData';
import { useBudgetSettings } from '../hooks/useBudgetSettings';
import { useTransactions, Transaction } from '../hooks/useTransactions';
import './Budget.css';

export function Budget() {
  const { user } = useAuth();
  const { 
    addTransaction: addTransactionToFirestore, 
    deleteTransaction: deleteTransactionFromFirestore 
  } = useTransactions();
  
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    transactionExpenses,
    marketingExpenses,
    marketingBreakdown,
    transactions,
    loading,
    error
  } = useBudgetData();
  
  const {
    monthlyBudget,
    updateMonthlyBudget,
    loading: budgetLoading
  } = useBudgetSettings();

  // État de chargement global - attendre que toutes les données soient chargées
  const isDataLoading = user ? (budgetLoading || loading || monthlyBudget === null) : false;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('marketing-costs');

  // Données d'exemple pour les utilisateurs non connectés
  const sampleTransactions: Transaction[] = [
    {
      id: 'sample-1',
      type: 'income',
      amount: 15000,
      category: 'Ventes Produits',
      description: 'Ventes e-commerce du mois',
      date: '2025-08-01'
    },
    {
      id: 'sample-2',
      type: 'expense',
      amount: 1720,
      category: 'Infrastructure Web',
      description: 'Hébergement et services cloud',
      date: '2025-08-02'
    },
    {
      id: 'sample-3',
      type: 'expense',
      amount: 1505,
      category: 'Développement Web',
      description: 'Freelance développeur',
      date: '2025-08-03'
    },
    {
      id: 'sample-4',
      type: 'expense',
      amount: 860,
      category: 'Transport',
      description: 'Déplacements professionnels',
      date: '2025-08-04'
    },
    {
      id: 'sample-5',
      type: 'expense',
      amount: 215,
      category: 'Autre',
      description: 'Frais divers',
      date: '2025-08-05'
    }
  ];

  // Données d'affichage - réelles pour utilisateurs connectés, génériques sinon
  const displayTransactions = user ? transactions : sampleTransactions;
  const displayIncome = user ? totalIncome : sampleTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const displayExpenses = user ? totalExpenses : sampleTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const displayMarketingExpenses = user ? marketingExpenses : 630; // Données cohérentes avec les coûts marketing affichés
  const displayTransactionExpenses = user ? transactionExpenses : 4300; // Total des dépenses transactions sample
  const displayMonthlyBudget = user ? monthlyBudget : 12000; // Budget générique

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des transactions');
      return;
    }

    try {
      await addTransactionToFirestore(transactionData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour supprimer des transactions');
      return;
    }

    try {
      await deleteTransactionFromFirestore(id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'marketing-costs':
        return (
          <div className="tab-content">
            <MarketingCosts />
            {user && (
              <MarketingBreakdown 
                impressions={marketingBreakdown.impression}
                digital={marketingBreakdown.digital}
                subscriptions={marketingBreakdown.subscription}
                total={marketingExpenses}
              />
            )}
          </div>
        );
      case 'recent-transactions':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <button 
                className="btn-primary"
                onClick={() => setIsFormOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                Nouvelle transaction
              </button>
            </div>
            <TabbedTransactions transactions={displayTransactions}>
              {(filteredTransactions) => (
                <TransactionList
                  transactions={filteredTransactions}
                  onDelete={handleDeleteTransaction}
                />
              )}
            </TabbedTransactions>
          </div>
        );
      case 'transactions-by-category':
        return (
          <div className="tab-content">
            <TabbedTransactions transactions={displayTransactions}>
              {(filteredTransactions) => (
                <TransactionsByCategory
                  transactions={filteredTransactions}
                  onDelete={handleDeleteTransaction}
                  canEdit={!!user}
                />
              )}
            </TabbedTransactions>
          </div>
        );
      case 'budget-by-category':
        return (
          <div className="tab-content">
            <BudgetCategories 
              totalBudget={displayMonthlyBudget!}
              marketingExpenses={displayMarketingExpenses}
              transactionExpenses={displayTransactionExpenses}
            />
          </div>
        );
      case 'insights':
        return (
          <div className="tab-content">
            <BudgetInsights
              totalIncome={displayIncome}
              totalExpenses={displayExpenses}
              monthlyBudget={displayMonthlyBudget!}
              marketingExpenses={displayMarketingExpenses}
              transactionExpenses={displayTransactionExpenses}
            />
          </div>
        );
      case 'roi-tracking':
        return (
          <div className="tab-content">
            <ROITracker transactions={displayTransactions} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="budget-page">
      <div className="page-header">
        <h1>Budget</h1>
      </div>

      {!isDataLoading && (
        <BudgetSummary 
          totalIncome={displayIncome}
          totalExpenses={displayExpenses}
          monthlyBudget={displayMonthlyBudget!}
          onBudgetUpdate={updateMonthlyBudget}
          canEdit={!!user}
        />
      )}
      
      {isDataLoading && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          padding: '40px', 
          borderRadius: '16px', 
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Chargement des données...
        </div>
      )}

      {!isDataLoading && (
        <>
          <div className="budget-tabs">
            <button 
              className={`tab-button ${activeTab === 'marketing-costs' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketing-costs')}
            >
              Coûts Marketing
            </button>
            <button 
              className={`tab-button ${activeTab === 'recent-transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent-transactions')}
            >
              Transactions récentes
            </button>
            <button 
              className={`tab-button ${activeTab === 'transactions-by-category' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions-by-category')}
            >
              Transactions par catégorie
            </button>
            <button 
              className={`tab-button ${activeTab === 'budget-by-category' ? 'active' : ''}`}
              onClick={() => setActiveTab('budget-by-category')}
            >
              Budget par catégorie
            </button>
            <button 
              className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              Analyses et recommandations
            </button>
            <button 
              className={`tab-button ${activeTab === 'roi-tracking' ? 'active' : ''}`}
              onClick={() => setActiveTab('roi-tracking')}
            >
              Suivi ROI
            </button>
          </div>

          <div className="budget-content">
            {renderTabContent()}
          </div>
        </>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          Erreur: {error}
        </div>
      )}

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAddTransaction}
      />
    </div>
  );
}
