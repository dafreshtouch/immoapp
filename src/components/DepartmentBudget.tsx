import React, { useState } from 'react';
import { TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import './DepartmentBudget.css';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface DepartmentBudgetProps {
  transactions: Transaction[];
}

interface DepartmentData {
  name: string;
  budget: number;
  spent: number;
  color: string;
  icon: React.ReactNode;
}

export function DepartmentBudget({ transactions }: DepartmentBudgetProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const marketingCategories = ['Marketing Digital', 'Marketing Traditionnel', 'Publicité Facebook/Google', 'SEO/SEM', 'Influenceurs', 'Événements/Salons'];
  const webCategories = ['Infrastructure Web', 'Hébergement/Domaines', 'Développement Web', 'Design/UX'];
  const supportCategories = ['Support Client', 'Outils/Logiciels', 'Formation/Certification'];

  const calculateDepartmentSpent = (categories: string[]) => {
    return transactions
      .filter(t => t.type === 'expense' && categories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const departments: DepartmentData[] = [
    {
      name: 'Marketing',
      budget: 5000,
      spent: calculateDepartmentSpent(marketingCategories),
      color: '#e74c3c',
      icon: <TrendingUp size={20} />
    },
    {
      name: 'Web & Tech',
      budget: 3000,
      spent: calculateDepartmentSpent(webCategories),
      color: '#3498db',
      icon: <Target size={20} />
    },
    {
      name: 'Support',
      budget: 1500,
      spent: calculateDepartmentSpent(supportCategories),
      color: '#2ecc71',
      icon: <CheckCircle size={20} />
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusIcon = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return <AlertTriangle size={16} className="status-icon over-budget" />;
    if (percentage > 80) return <AlertTriangle size={16} className="status-icon warning" />;
    return <CheckCircle size={16} className="status-icon good" />;
  };

  return (
    <div className="department-budget">
      <div className="department-header">
        <h3>Budgets par département</h3>
        <select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="period-selector"
        >
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      <div className="department-cards">
        {departments.map((dept) => {
          const percentage = (dept.spent / dept.budget) * 100;
          const remaining = dept.budget - dept.spent;

          return (
            <div key={dept.name} className="department-card">
              <div className="department-card-header">
                <div className="department-info">
                  <div className="department-icon" style={{ backgroundColor: dept.color }}>
                    {dept.icon}
                  </div>
                  <div>
                    <h4>{dept.name}</h4>
                    <p className="department-budget-text">
                      Budget: {formatCurrency(dept.budget)}
                    </p>
                  </div>
                </div>
                {getStatusIcon(dept.spent, dept.budget)}
              </div>

              <div className="department-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: dept.color 
                    }}
                  />
                </div>
                <div className="progress-info">
                  <span className="spent">{formatCurrency(dept.spent)}</span>
                  <span className="percentage">{percentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="department-footer">
                <div className={`remaining ${remaining < 0 ? 'negative' : 'positive'}`}>
                  {remaining >= 0 ? 'Restant: ' : 'Dépassement: '}
                  {formatCurrency(Math.abs(remaining))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="department-summary">
        <div className="summary-item">
          <span className="label">Total budgets:</span>
          <span className="value">{formatCurrency(departments.reduce((sum, d) => sum + d.budget, 0))}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total dépensé:</span>
          <span className="value">{formatCurrency(departments.reduce((sum, d) => sum + d.spent, 0))}</span>
        </div>
        <div className="summary-item">
          <span className="label">Efficacité globale:</span>
          <span className="value">
            {((departments.reduce((sum, d) => sum + d.spent, 0) / departments.reduce((sum, d) => sum + d.budget, 0)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
