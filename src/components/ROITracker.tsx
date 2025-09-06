import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import './ROITracker.css';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ROITrackerProps {
  transactions: Transaction[];
}

interface ROIData {
  category: string;
  investment: number;
  revenue: number;
  roi: number;
  color: string;
}

export function ROITracker({ transactions }: ROITrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateROI = (investment: number, revenue: number) => {
    if (investment === 0) return 0;
    return ((revenue - investment) / investment) * 100;
  };

  // Calcul des investissements et revenus par catégorie
  const marketingInvestment = transactions
    .filter(t => t.type === 'expense' && ['Marketing Digital', 'Publicité Facebook/Google', 'SEO/SEM', 'Influenceurs'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const marketingRevenue = transactions
    .filter(t => t.type === 'income' && ['Ventes Produits', 'Services/Consulting', 'Revenus Publicitaires'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0) * 0.6; // Attribution 60% au marketing

  const webInvestment = transactions
    .filter(t => t.type === 'expense' && ['Infrastructure Web', 'Développement Web', 'Design/UX'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const webRevenue = transactions
    .filter(t => t.type === 'income' && ['Abonnements/SaaS', 'Formations/Cours'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const supportInvestment = transactions
    .filter(t => t.type === 'expense' && ['Support Client', 'Outils/Logiciels'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const supportRevenue = transactions
    .filter(t => t.type === 'income' && ['Services/Consulting'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0) * 0.3; // Attribution 30% au support

  const roiData: ROIData[] = [
    {
      category: 'Marketing Digital',
      investment: marketingInvestment,
      revenue: marketingRevenue,
      roi: calculateROI(marketingInvestment, marketingRevenue),
      color: '#e74c3c'
    },
    {
      category: 'Infrastructure Web',
      investment: webInvestment,
      revenue: webRevenue,
      roi: calculateROI(webInvestment, webRevenue),
      color: '#3498db'
    },
    {
      category: 'Support & Outils',
      investment: supportInvestment,
      revenue: supportRevenue,
      roi: calculateROI(supportInvestment, supportRevenue),
      color: '#2ecc71'
    }
  ];

  const totalInvestment = roiData.reduce((sum, item) => sum + item.investment, 0);
  const totalRevenue = roiData.reduce((sum, item) => sum + item.revenue, 0);
  const globalROI = calculateROI(totalInvestment, totalRevenue);

  return (
    <div className="roi-tracker">
      <h3>Suivi du ROI par secteur</h3>
      
      <div className="roi-summary">
        <div className="roi-summary-card global">
          <div className="roi-icon">
            <Percent size={24} />
          </div>
          <div className="roi-content">
            <h4>ROI Global</h4>
            <p className={`roi-value ${globalROI >= 0 ? 'positive' : 'negative'}`}>
              {globalROI.toFixed(1)}%
            </p>
            <span className="roi-details">
              {formatCurrency(totalRevenue)} / {formatCurrency(totalInvestment)}
            </span>
          </div>
        </div>
      </div>

      <div className="roi-categories">
        {roiData.map((item) => (
          <div key={item.category} className="roi-category-card">
            <div className="roi-category-header">
              <div className="category-info">
                <div 
                  className="category-indicator" 
                  style={{ backgroundColor: item.color }}
                />
                <h5>{item.category}</h5>
              </div>
              <div className={`roi-percentage ${item.roi >= 0 ? 'positive' : 'negative'}`}>
                {item.roi >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {item.roi.toFixed(1)}%
              </div>
            </div>

            <div className="roi-metrics">
              <div className="metric">
                <span className="metric-label">Investissement</span>
                <span className="metric-value investment">
                  {formatCurrency(item.investment)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Revenus attribués</span>
                <span className="metric-value revenue">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Profit/Perte</span>
                <span className={`metric-value ${item.revenue - item.investment >= 0 ? 'profit' : 'loss'}`}>
                  {formatCurrency(item.revenue - item.investment)}
                </span>
              </div>
            </div>

            <div className="roi-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(Math.abs(item.roi), 100)}%`,
                    backgroundColor: item.roi >= 0 ? '#28a745' : '#dc3545'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="roi-insights">
        <h4>Insights & Recommandations</h4>
        <div className="insights-list">
          {globalROI > 20 && (
            <div className="insight positive">
              <TrendingUp size={16} />
              <span>Excellent ROI global ! Continuez sur cette lancée.</span>
            </div>
          )}
          {roiData.some(item => item.roi < 0) && (
            <div className="insight warning">
              <TrendingDown size={16} />
              <span>Certains secteurs sont en perte. Analysez et optimisez.</span>
            </div>
          )}
          {marketingInvestment > 0 && marketingRevenue / marketingInvestment > 2 && (
            <div className="insight positive">
              <DollarSign size={16} />
              <span>Le marketing digital performe bien. Augmentez le budget.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
