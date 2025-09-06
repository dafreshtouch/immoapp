import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign } from 'lucide-react';
import './BudgetInsights.css';

interface BudgetInsightsProps {
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  marketingExpenses: number;
  transactionExpenses: number;
}

export function BudgetInsights({ 
  totalIncome, 
  totalExpenses, 
  monthlyBudget, 
  marketingExpenses, 
  transactionExpenses 
}: BudgetInsightsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const budgetUsage = (totalExpenses / monthlyBudget) * 100;
  const remainingBudget = monthlyBudget - totalExpenses;
  const dailyBudgetRemaining = remainingBudget / 30; // Approximation mensuelle
  const marketingPercentage = (marketingExpenses / totalExpenses) * 100;
  
  const insights = [
    {
      type: budgetUsage > 100 ? 'warning' : budgetUsage > 80 ? 'caution' : 'success',
      icon: budgetUsage > 100 ? AlertTriangle : budgetUsage > 80 ? TrendingUp : Target,
      title: budgetUsage > 100 ? 'Budget dépassé' : budgetUsage > 80 ? 'Attention au budget' : 'Budget sous contrôle',
      message: budgetUsage > 100 
        ? `Vous avez dépassé votre budget de ${formatCurrency(Math.abs(remainingBudget))}`
        : budgetUsage > 80 
        ? `Vous avez utilisé ${budgetUsage.toFixed(1)}% de votre budget mensuel`
        : `Il vous reste ${formatCurrency(remainingBudget)} sur votre budget mensuel`
    },
    {
      type: dailyBudgetRemaining < 0 ? 'warning' : dailyBudgetRemaining < 50 ? 'caution' : 'info',
      icon: Calendar,
      title: 'Budget quotidien restant',
      message: dailyBudgetRemaining < 0 
        ? 'Budget quotidien épuisé'
        : `Environ ${formatCurrency(dailyBudgetRemaining)} par jour jusqu'à la fin du mois`
    },
    {
      type: marketingPercentage > 40 ? 'caution' : 'info',
      icon: TrendingUp,
      title: 'Dépenses marketing',
      message: `${marketingPercentage.toFixed(1)}% de vos dépenses sont liées au marketing (${formatCurrency(marketingExpenses)})`
    },
    {
      type: totalIncome > totalExpenses ? 'success' : 'warning',
      icon: totalIncome > totalExpenses ? TrendingUp : TrendingDown,
      title: totalIncome > totalExpenses ? 'Solde positif' : 'Solde négatif',
      message: totalIncome > totalExpenses 
        ? `Vous avez un excédent de ${formatCurrency(totalIncome - totalExpenses)}`
        : `Vous avez un déficit de ${formatCurrency(Math.abs(totalIncome - totalExpenses))}`
    }
  ];

  const recommendations = [
    ...(budgetUsage > 90 ? [{
      icon: AlertTriangle,
      text: 'Réduisez les dépenses non essentielles pour respecter votre budget'
    }] : []),
    ...(marketingExpenses > transactionExpenses ? [{
      icon: TrendingUp,
      text: 'Vos coûts marketing dépassent vos autres dépenses, analysez le ROI'
    }] : []),
    ...(totalIncome < totalExpenses ? [{
      icon: DollarSign,
      text: 'Augmentez vos revenus ou réduisez vos dépenses pour équilibrer votre budget'
    }] : []),
    ...(remainingBudget > monthlyBudget * 0.3 ? [{
      icon: Target,
      text: 'Vous avez une marge confortable, considérez investir dans la croissance'
    }] : [])
  ];

  return (
    <div className="budget-insights">
      <h3>Analyses et recommandations</h3>
      
      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type}`}>
            <div className="insight-icon">
              <insight.icon size={20} />
            </div>
            <div className="insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.message}</p>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommandations</h4>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <rec.icon size={16} />
                <span>{rec.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Taux d'épargne</span>
          <span className="stat-value">
            {totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dépenses/Revenus</span>
          <span className="stat-value">
            {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Budget utilisé</span>
          <span className="stat-value">{budgetUsage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
