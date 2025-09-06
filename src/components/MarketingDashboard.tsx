import React, { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, Calendar, DollarSign, Users, Eye, Share2, Target, BarChart3, Plus, Activity } from 'lucide-react';
import './MarketingDashboard.css';

export function MarketingDashboard() {
  const { user } = useAuth();
  const { events } = useEvents();
  const [marketingMetrics, setMarketingMetrics] = useState<any>({});

  // Calculate marketing metrics
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });

    const totalBudget = monthlyEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
    const campaignCount = monthlyEvents.length;
    const avgCostPerEvent = campaignCount > 0 ? totalBudget / campaignCount : 0;

    setMarketingMetrics({
      totalBudget,
      campaignCount,
      avgCostPerEvent,
      monthlyEvents
    });
  }, [events]);

  // Mock data for marketing analytics
  const campaignData = [
    { name: 'Facebook Ads', impressions: 15420, clicks: 892, cost: 450, roi: 3.2 },
    { name: 'Google Ads', impressions: 8750, clicks: 654, cost: 380, roi: 2.8 },
    { name: 'Instagram', impressions: 12300, clicks: 743, cost: 290, roi: 4.1 },
    { name: 'LinkedIn', impressions: 5600, clicks: 234, cost: 180, roi: 2.1 }
  ];

  const monthlyPerformance = [
    { month: 'Jan', leads: 45, conversions: 12, budget: 1200 },
    { month: 'Fév', leads: 52, conversions: 15, budget: 1350 },
    { month: 'Mar', leads: 38, conversions: 9, budget: 980 },
    { month: 'Avr', leads: 61, conversions: 18, budget: 1580 },
    { month: 'Mai', leads: 48, conversions: 14, budget: 1220 },
    { month: 'Jun', leads: 67, conversions: 22, budget: 1750 }
  ];

  const maxLeads = Math.max(...monthlyPerformance.map(d => d.leads));

  const recentActivities = [
    {
      id: 1,
      type: 'campaign',
      title: 'Nouvelle campagne lancée',
      description: 'Facebook Ads - Promotion appartements',
      time: 'Il y a 1h',
      icon: Share2,
      color: '#3B82F6'
    },
    {
      id: 2,
      type: 'lead',
      title: 'Nouveau lead qualifié',
      description: 'Contact via Instagram - Intéressé T3',
      time: 'Il y a 3h',
      icon: Target,
      color: '#10B981'
    },
    {
      id: 3,
      type: 'event',
      title: 'Événement programmé',
      description: 'Visite virtuelle demain 15h',
      time: 'Il y a 5h',
      icon: Calendar,
      color: '#F59E0B'
    }
  ];

  return (
    <div className="marketing-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Marketing</h1>
          <p>Bienvenue, {user?.displayName || 'Marketeur'}</p>
        </div>
      </div>

      {/* Marketing Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-label">BUDGET MENSUEL</div>
            <div className="metric-value">{marketingMetrics.totalBudget?.toLocaleString() || 0}€</div>
          </div>
          <div className="metric-change positive">+8%</div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-label">CAMPAGNES ACTIVES</div>
            <div className="metric-value">{marketingMetrics.campaignCount || 0}</div>
          </div>
          <div className="metric-change positive">+3</div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-label">IMPRESSIONS</div>
            <div className="metric-value">42.1K</div>
          </div>
          <div className="metric-change positive">+12%</div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-label">LEADS GÉNÉRÉS</div>
            <div className="metric-value">67</div>
          </div>
          <div className="metric-change positive">+15%</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Performance Chart */}
        <div className="dashboard-card performance-chart">
          <div className="card-header">
            <h3>Performance Mensuelle</h3>
            <div className="chart-metrics">
              <div className="chart-value leads">67 Leads</div>
              <div className="chart-value conversions">22 Conversions</div>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color leads"></div>
                <span>Leads</span>
              </div>
              <div className="legend-item">
                <div className="legend-color conversions"></div>
                <span>Conversions</span>
              </div>
              <div className="legend-item">
                <div className="legend-color budget"></div>
                <span>Budget (×100€)</span>
              </div>
            </div>
            <div className="chart-bars">
              {monthlyPerformance.map((data, index) => {
                const maxConversions = Math.max(...monthlyPerformance.map(d => d.conversions));
                const maxBudget = Math.max(...monthlyPerformance.map(d => d.budget));
                const isCurrentMonth = index === monthlyPerformance.length - 1;
                
                return (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-bars-group">
                      {/* Leads Bar */}
                      <div 
                        className={`chart-bar leads ${isCurrentMonth ? 'current' : ''}`}
                        style={{ 
                          height: `${(data.leads / maxLeads) * 100}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                        data-value={data.leads}
                      >
                        <div className="bar-tooltip">
                          <div className="tooltip-title">{data.month}</div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">Leads:</span>
                            <span className="tooltip-value">{data.leads}</span>
                          </div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">Conversions:</span>
                            <span className="tooltip-value">{data.conversions}</span>
                          </div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">Budget:</span>
                            <span className="tooltip-value">{data.budget}€</span>
                          </div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">Taux:</span>
                            <span className="tooltip-value">{((data.conversions / data.leads) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Conversions Bar */}
                      <div 
                        className={`chart-bar conversions ${isCurrentMonth ? 'current' : ''}`}
                        style={{ 
                          height: `${(data.conversions / maxConversions) * 80}%`,
                          animationDelay: `${index * 0.1 + 0.05}s`
                        }}
                        data-value={data.conversions}
                      ></div>
                      
                      {/* Budget Bar (scaled down) */}
                      <div 
                        className={`chart-bar budget ${isCurrentMonth ? 'current' : ''}`}
                        style={{ 
                          height: `${((data.budget / 100) / (maxBudget / 100)) * 60}%`,
                          animationDelay: `${index * 0.1 + 0.1}s`
                        }}
                        data-value={Math.round(data.budget / 100)}
                      ></div>
                    </div>
                    <div className="chart-label">{data.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="dashboard-card campaigns-performance">
          <div className="card-header">
            <h3>Performance des Campagnes</h3>
            <div className="campaigns-summary">
              <span className="total-campaigns">{campaignData.length} campagnes</span>
            </div>
          </div>
          <div className="campaigns-content">
            <div className="campaigns-list-compact">
              {campaignData.map((campaign, index) => {
                const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(1);
                
                return (
                  <div key={index} className="campaign-item-compact" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="campaign-compact-header">
                      <div className={`platform-icon-small ${campaign.name.toLowerCase().replace(' ', '-')}`}>
                        {campaign.name === 'Facebook Ads' && '📘'}
                        {campaign.name === 'Google Ads' && '🔍'}
                        {campaign.name === 'Instagram' && '📷'}
                        {campaign.name === 'LinkedIn' && '💼'}
                      </div>
                      <div className="campaign-compact-info">
                        <div className="campaign-name-small">{campaign.name}</div>
                        <div className="campaign-stats-small">
                          {(campaign.impressions / 1000).toFixed(1)}K imp • {campaign.clicks} clics
                        </div>
                      </div>
                    </div>
                    <div className="campaign-compact-metrics">
                      <div className="compact-metric">
                        <span className="compact-label">ROI</span>
                        <span className={`compact-value ${campaign.roi >= 3 ? 'positive' : campaign.roi >= 2 ? 'neutral' : 'negative'}`}>
                          {campaign.roi}x
                        </span>
                      </div>
                      <div className="compact-metric">
                        <span className="compact-label">Coût</span>
                        <span className="compact-value">{campaign.cost}€</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="campaigns-details-panel">
              <div className="details-header">
                <h4>Analyse Détaillée</h4>
              </div>
              
              <div className="performance-overview">
                {campaignData.map((campaign, index) => {
                  const maxImpressions = Math.max(...campaignData.map(c => c.impressions));
                  const maxClicks = Math.max(...campaignData.map(c => c.clicks));
                  const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
                  const performanceScore = (campaign.roi * 20) + (parseFloat(ctr) * 2);
                  
                  return (
                    <div key={index} className="performance-detail-item">
                      <div className="detail-platform-name">{campaign.name}</div>
                      
                      <div className="detail-bars">
                        <div className="detail-bar">
                          <div className="detail-bar-info">
                            <span className="detail-label">Impressions</span>
                            <span className="detail-value">{campaign.impressions.toLocaleString()}</span>
                          </div>
                          <div className="detail-progress-bar">
                            <div 
                              className="detail-progress-fill impressions"
                              style={{ 
                                width: `${(campaign.impressions / maxImpressions) * 100}%`,
                                animationDelay: `${index * 0.1 + 0.2}s`
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="detail-bar">
                          <div className="detail-bar-info">
                            <span className="detail-label">Clics</span>
                            <span className="detail-value">{campaign.clicks}</span>
                          </div>
                          <div className="detail-progress-bar">
                            <div 
                              className="detail-progress-fill clicks"
                              style={{ 
                                width: `${(campaign.clicks / maxClicks) * 100}%`,
                                animationDelay: `${index * 0.1 + 0.3}s`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-kpis">
                        <div className="detail-kpi">
                          <span className="detail-kpi-label">CTR</span>
                          <span className="detail-kpi-value">{ctr}%</span>
                        </div>
                        <div className="detail-kpi">
                          <span className="detail-kpi-label">CPC</span>
                          <span className="detail-kpi-value">{(campaign.cost / campaign.clicks).toFixed(2)}€</span>
                        </div>
                        <div className="detail-kpi">
                          <span className="detail-kpi-label">Score</span>
                          <span className="detail-kpi-value performance-score">{Math.round(performanceScore)}/100</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Statut des Unités */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Statut des Unités</h3>
          </div>
          <div className="status-overview">
            <div className="status-item">
              <div className="status-indicator available"></div>
              <div className="status-info">
                <div className="status-label">Disponibles</div>
                <div className="status-value">10</div>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator sold"></div>
              <div className="status-info">
                <div className="status-label">Vendues</div>
                <div className="status-value">1</div>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator reserved"></div>
              <div className="status-info">
                <div className="status-label">Louées</div>
                <div className="status-value">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Marketing Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Activités Récentes</h3>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="activity-item">
                  <div 
                    className="activity-icon"
                    style={{ backgroundColor: activity.color }}
                  >
                    <IconComponent size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Actions Rapides</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn">
              <Share2 size={20} />
              <span>Publier sur les réseaux</span>
            </button>
            <button className="action-btn">
              <Calendar size={20} />
              <span>Planifier événement</span>
            </button>
            <button className="action-btn">
              <BarChart3 size={20} />
              <span>Voir analytics</span>
            </button>
            <button className="action-btn">
              <Target size={20} />
              <span>Créer campagne</span>
            </button>
          </div>
        </div>

        {/* Performance du Mois */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Performance du Mois</h3>
          </div>
          <div className="performance-metrics">
            <div className="metric-row">
              <span className="metric-label">Taux de conversion</span>
              <span className="metric-value positive">24% <small>+3%</small></span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Temps moyen de vente</span>
              <span className="metric-value neutral">45j <small>-1j</small></span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Prix moyen</span>
              <span className="metric-value negative">451152€ <small>-6%</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
