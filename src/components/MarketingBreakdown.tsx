import React from 'react';
import { FileText, Globe, CreditCard } from 'lucide-react';
import './MarketingBreakdown.css';

interface MarketingBreakdownProps {
  impressions: number;
  digital: number;
  subscriptions: number;
  total: number;
}

export function MarketingBreakdown({ impressions, digital, subscriptions, total }: MarketingBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getPercentage = (amount: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="marketing-breakdown">
      <h4>Détail des coûts marketing</h4>
      
      <div className="breakdown-items">
        <div className="breakdown-item">
          <div className="breakdown-item-main">
            <div className="item-icon impressions">
              <FileText size={20} />
            </div>
            <div className="item-content">
              <span className="item-label">Impressions</span>
              <div className="item-details">
                <span className="item-amount">{formatCurrency(impressions)}</span>
                <span className="item-percentage">{getPercentage(impressions)}%</span>
              </div>
            </div>
          </div>
          <div className="item-description">
            Brochures, flyers, supports imprimés
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-item-main">
            <div className="item-icon digital">
              <Globe size={20} />
            </div>
            <div className="item-content">
              <span className="item-label">Développement Digital</span>
              <div className="item-details">
                <span className="item-amount">{formatCurrency(digital)}</span>
                <span className="item-percentage">{getPercentage(digital)}%</span>
              </div>
            </div>
          </div>
          <div className="item-description">
            Sites web, plugins, développements
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-item-main">
            <div className="item-icon subscriptions">
              <CreditCard size={20} />
            </div>
            <div className="item-content">
              <span className="item-label">Abonnements</span>
              <div className="item-details">
                <span className="item-amount">{formatCurrency(subscriptions)}</span>
                <span className="item-percentage">{getPercentage(subscriptions)}%</span>
              </div>
            </div>
          </div>
          <div className="item-description">
            Licences logiciels, services SaaS
          </div>
        </div>
      </div>

      <div className="breakdown-total">
        <span>Total Marketing: {formatCurrency(total)}</span>
      </div>
    </div>
  );
}
