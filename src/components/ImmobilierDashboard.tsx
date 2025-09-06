import React, { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useUnits } from '../hooks/useUnits';
import { useAuth } from '../hooks/useAuth';
import { Building2, Home as HomeIcon, Euro, TrendingUp, Plus, Activity, Calendar, Users, MapPin, Key } from 'lucide-react';
import './ImmobilierDashboard.css';

export function ImmobilierDashboard() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { units } = useUnits();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Calculate metrics
  const totalProjects = projects.length;
  const totalUnits = units.length;
  const totalValue = units.reduce((sum, unit) => sum + (unit.price || 0), 0);
  const availableUnits = units.filter(unit => unit.availability === 'available').length;
  const soldUnits = units.filter(unit => unit.availability === 'sold').length;
  const rentedUnits = units.filter(unit => unit.availability === 'rented').length;

  // Mock chart data for monthly revenue
  const monthlyData = [
    { month: 'Jan', value: 28000 },
    { month: 'Fév', value: 25000 },
    { month: 'Mar', value: 22000 },
    { month: 'Avr', value: 18000 },
    { month: 'Mai', value: 15000 },
    { month: 'Jun', value: 12000 }
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  // Recent projects data
  const recentProjects = projects.slice(0, 3).map(project => ({
    ...project,
    unitsCount: units.filter(unit => unit.projectId === project.id).length,
    soldCount: units.filter(unit => unit.projectId === project.id && unit.availability === 'sold').length
  }));

  useEffect(() => {
    // Mock recent activity
    const activities = [
      {
        id: 1,
        type: 'project',
        title: 'Nouveau projet créé',
        description: 'Résidence Les Jardins ajoutée',
        time: 'Il y a 2h',
        icon: Building2,
        color: '#10B981'
      },
      {
        id: 2,
        type: 'unit',
        title: 'Unité vendue',
        description: 'Appartement A1 - 250 000€',
        time: 'Il y a 5h',
        icon: HomeIcon,
        color: '#3B82F6'
      },
      {
        id: 3,
        type: 'meeting',
        title: 'Rendez-vous client',
        description: 'Visite prévue demain 14h',
        time: 'Il y a 1j',
        icon: Calendar,
        color: '#F59E0B'
      },
      {
        id: 4,
        type: 'contract',
        title: 'Contrat signé',
        description: 'Villa B3 - Compromis de vente',
        time: 'Il y a 2j',
        icon: Key,
        color: '#8B5CF6'
      }
    ];
    setRecentActivity(activities);
  }, []);

  return (
    <div className="immobilier-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Immobilier</h1>
          <p>Bienvenue, {user?.displayName || 'Agent'}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Plus size={16} />
            Nouveau projet
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon orange">
            <Building2 size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Projets</div>
            <div className="metric-value">{totalProjects}</div>
            <div className="metric-change positive">+12%</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon green">
            <HomeIcon size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Unités Totales</div>
            <div className="metric-value">{totalUnits}</div>
            <div className="metric-change positive">+8%</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon blue">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Disponibles</div>
            <div className="metric-value">{availableUnits}</div>
            <div className="metric-change neutral">-2%</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon purple">
            <Euro size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Valeur Portfolio</div>
            <div className="metric-value">{(totalValue / 1000000).toFixed(1)}M€</div>
            <div className="metric-change positive">+15%</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Revenus Mensuels</h3>
            <div className="chart-value">€ 28,000</div>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {monthlyData.map((data, index) => (
                <div key={index} className="chart-bar-container">
                  <div className="chart-label">{data.month}</div>
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${(data.value / maxValue) * 100}%`,
                      backgroundColor: index === monthlyData.length - 1 ? '#3B82F6' : '#E5E7EB'
                    }}
                  >
                    {index === monthlyData.length - 1 && (
                      <div className="chart-tooltip">
                        €{data.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="dashboard-card projects-card">
          <div className="card-header">
            <h3>Projets Récents</h3>
          </div>
          <div className="projects-list">
            {recentProjects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="project-info">
                  <div className="project-name">{project.name}</div>
                  <div className="project-location">
                    <MapPin size={14} />
                    {project.city}
                  </div>
                </div>
                <div className="project-stats">
                  <div className="project-units">{project.unitsCount} unités</div>
                  <div className="project-sold">{project.soldCount} vendues</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Units Status */}
        <div className="dashboard-card status-card">
          <div className="card-header">
            <h3>Statut des Unités</h3>
          </div>
          <div className="status-list">
            <div className="status-item">
              <div className="status-info">
                <div className="status-label">Disponibles</div>
                <div className="status-value">{availableUnits}</div>
              </div>
              <div className="status-indicator available"></div>
            </div>
            <div className="status-item">
              <div className="status-info">
                <div className="status-label">Vendues</div>
                <div className="status-value">{soldUnits}</div>
              </div>
              <div className="status-indicator sold"></div>
            </div>
            <div className="status-item">
              <div className="status-info">
                <div className="status-label">Louées</div>
                <div className="status-value">{rentedUnits}</div>
              </div>
              <div className="status-indicator rented"></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3>Activités Récentes</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => {
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
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>Actions Rapides</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn">
              <Building2 size={20} />
              <span>Nouveau projet</span>
            </button>
            <button className="action-btn">
              <HomeIcon size={20} />
              <span>Ajouter unité</span>
            </button>
            <button className="action-btn">
              <Calendar size={20} />
              <span>Planifier visite</span>
            </button>
            <button className="action-btn">
              <TrendingUp size={20} />
              <span>Voir rapports</span>
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="dashboard-card performance-card">
          <div className="card-header">
            <h3>Performance du Mois</h3>
          </div>
          <div className="performance-metrics">
            <div className="performance-item">
              <div className="performance-label">Taux de conversion</div>
              <div className="performance-value">24%</div>
              <div className="performance-trend positive">+3%</div>
            </div>
            <div className="performance-item">
              <div className="performance-label">Temps moyen de vente</div>
              <div className="performance-value">45j</div>
              <div className="performance-trend positive">-5j</div>
            </div>
            <div className="performance-item">
              <div className="performance-label">Prix moyen</div>
              <div className="performance-value">{Math.round(totalValue / totalUnits || 0).toLocaleString()}€</div>
              <div className="performance-trend positive">+8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
