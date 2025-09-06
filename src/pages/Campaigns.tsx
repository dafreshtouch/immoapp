import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, MousePointer, DollarSign, Target, Calendar, Filter, Download, RefreshCw, Plus, Edit, Trash2, Play, Pause, CheckCircle } from 'lucide-react';
import { useCampaigns, CampaignData } from '../hooks/useCampaigns';
import { CampaignModal } from '../components/CampaignModal';
import './Campaigns.css';


export function Campaigns() {
  const { 
    campaigns, 
    loading, 
    error, 
    addCampaign, 
    updateCampaign, 
    deleteCampaign, 
    pauseCampaign, 
    resumeCampaign, 
    completeCampaign 
  } = useCampaigns();
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCreateCampaign = () => {
    setModalMode('create');
    setSelectedCampaign(null);
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign: CampaignData) => {
    setModalMode('edit');
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      setActionLoading(id);
      try {
        await deleteCampaign(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la campagne');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleStatusChange = async (campaign: CampaignData, newStatus: 'active' | 'paused' | 'completed') => {
    setActionLoading(campaign.id);
    try {
      switch (newStatus) {
        case 'active':
          await resumeCampaign(campaign.id);
          break;
        case 'paused':
          await pauseCampaign(campaign.id);
          break;
        case 'completed':
          await completeCampaign(campaign.id);
          break;
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveCampaign = async (campaignData: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addCampaign(campaignData);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  };

  const handleUpdateCampaign = async (id: string, updates: Partial<CampaignData>) => {
    try {
      await updateCampaign(id, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  const exportCampaigns = () => {
    const csvContent = [
      ['Nom', 'Plateforme', 'Budget', 'Dépensé', 'Impressions', 'Clics', 'Conversions', 'ROI', 'Statut'].join(','),
      ...filteredCampaigns.map(campaign => [
        campaign.name,
        campaign.platform,
        campaign.budget,
        campaign.spent,
        campaign.impressions,
        campaign.clicks,
        campaign.conversions,
        campaign.roi,
        campaign.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campagnes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const platformMatch = selectedPlatform === 'all' || campaign.platform === selectedPlatform;
    const statusMatch = selectedStatus === 'all' || campaign.status === selectedStatus;
    return platformMatch && statusMatch;
  });

  const totalMetrics = filteredCampaigns.reduce((acc, campaign) => ({
    budget: acc.budget + campaign.budget,
    spent: acc.spent + campaign.spent,
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    conversions: acc.conversions + campaign.conversions
  }), { budget: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0 });

  const averageROI = filteredCampaigns.length > 0 
    ? filteredCampaigns.reduce((acc, campaign) => acc + campaign.roi, 0) / filteredCampaigns.length 
    : 0;

  const getCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const getConversionRate = (conversions: number, clicks: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0.00';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook Ads': return '📘';
      case 'Google Ads': return '🔍';
      case 'Instagram': return '📷';
      case 'LinkedIn': return '💼';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="campaigns-loading">
        <RefreshCw className="loading-spinner" />
        <p>Chargement des performances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaigns-container">
        <div className="campaigns-header">
          <div className="campaigns-title">
            <TrendingUp size={32} />
            <h1>Performance des Campagnes</h1>
          </div>
          
          <div className="campaigns-actions">
            <button className="btn-create" onClick={handleCreateCampaign}>
              <Plus size={18} />
              Nouvelle Campagne
            </button>
          </div>
        </div>

        <div className="error-message-container">
          <div className="error-message">
            <h3>⚠️ Configuration Firebase requise</h3>
            <p>Les règles Firebase pour les campagnes ne sont pas encore déployées.</p>
            
            <div className="solution-options">
              <div className="solution-option">
                <h4>Étape 1 : Créer l'index Firebase requis</h4>
                <p>Cliquez sur ce lien pour créer automatiquement l'index :</p>
                <a 
                  href="https://console.firebase.google.com/v1/r/project/immo-app-48914/firestore/indexes?create_composite=ClBwcm9qZWN0cy9pbW1vLWFwcC00ODkxNC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvY2FtcGFpZ25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI"
                  target="_blank"
                  className="index-link"
                >
                  🔗 Créer l'index Firebase automatiquement
                </a>
                <p><small>Attendez que l'index soit créé (quelques minutes) avant de passer à l'étape 2.</small></p>
              </div>
              
              <div className="solution-option">
                <h4>Étape 2 : Déployer les règles Firebase (Méthode simplifiée)</h4>
                <p>Allez sur <a href="https://console.firebase.google.com/project/immo-app-48914/firestore/rules" target="_blank" className="index-link">🔗 Firebase Console - Règles</a></p>
                <ol>
                  <li>Dans l'éditeur de règles, ajoutez ce code <strong>avant la dernière accolade</strong> :</li>
                  <pre><code>{`    // Règles pour la collection campaigns
    match /campaigns/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }`}</code></pre>
                  <li>Cliquez sur <strong>"Publier"</strong></li>
                  <li>Attendez la confirmation de déploiement</li>
                </ol>
              </div>
            </div>
            
            <button className="btn-refresh" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
              Actualiser après configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="campaigns-container">
      <div className="campaigns-header">
        <div className="campaigns-title">
          <TrendingUp size={32} />
          <h1>Performance des Campagnes</h1>
        </div>
        
        <div className="campaigns-actions">
          <button className="btn-create" onClick={handleCreateCampaign}>
            <Plus size={18} />
            Nouvelle Campagne
          </button>
          <button className="btn-export" onClick={exportCampaigns}>
            <Download size={18} />
            Exporter
          </button>
          <button className="btn-refresh" onClick={() => window.location.reload()}>
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="campaigns-filters">
        <div className="filter-group">
          <label>Plateforme:</label>
          <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
            <option value="all">Toutes les plateformes</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Statut:</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="paused">En pause</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Période:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">Année complète</option>
          </select>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="campaigns-metrics">
        <div className="metric-card">
          <div className="metric-icon budget">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>Budget Total</h3>
            <p className="metric-value">{totalMetrics.budget}€</p>
            <span className="metric-subtitle">Dépensé: {totalMetrics.spent}€</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon impressions">
            <Eye size={24} />
          </div>
          <div className="metric-content">
            <h3>Impressions</h3>
            <p className="metric-value">{totalMetrics.impressions.toLocaleString()}</p>
            <span className="metric-subtitle">Portée totale</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon clicks">
            <MousePointer size={24} />
          </div>
          <div className="metric-content">
            <h3>Clics</h3>
            <p className="metric-value">{totalMetrics.clicks.toLocaleString()}</p>
            <span className="metric-subtitle">CTR: {getCTR(totalMetrics.clicks, totalMetrics.impressions)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon conversions">
            <Target size={24} />
          </div>
          <div className="metric-content">
            <h3>Conversions</h3>
            <p className="metric-value">{totalMetrics.conversions}</p>
            <span className="metric-subtitle">Taux: {getConversionRate(totalMetrics.conversions, totalMetrics.clicks)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon roi">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>ROI Moyen</h3>
            <p className="metric-value">{averageROI.toFixed(1)}x</p>
            <span className="metric-subtitle">Retour sur investissement</span>
          </div>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="campaigns-list">
        <h2>Détail des Campagnes</h2>
        
        {filteredCampaigns.length === 0 ? (
          <div className="no-campaigns">
            <p>Aucune campagne trouvée avec les filtres sélectionnés.</p>
          </div>
        ) : (
          <div className="campaigns-table">
            {filteredCampaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <div className="campaign-platform">
                    <span className="platform-icon">{getPlatformIcon(campaign.platform)}</span>
                    <div>
                      <h3>{campaign.name}</h3>
                      <p>{campaign.platform}</p>
                    </div>
                  </div>
                  <div className="campaign-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(campaign.status) }}
                    >
                      {campaign.status === 'active' ? 'Actif' : 
                       campaign.status === 'paused' ? 'En pause' : 'Terminé'}
                    </span>
                  </div>
                </div>

                <div className="campaign-metrics">
                  <div className="campaign-metric">
                    <span className="metric-label">Budget</span>
                    <span className="metric-value">{campaign.budget}€</span>
                  </div>
                  <div className="campaign-metric">
                    <span className="metric-label">Dépensé</span>
                    <span className="metric-value">{campaign.spent}€</span>
                  </div>
                  <div className="campaign-metric">
                    <span className="metric-label">Impressions</span>
                    <span className="metric-value">{campaign.impressions.toLocaleString()}</span>
                  </div>
                  <div className="campaign-metric">
                    <span className="metric-label">Clics</span>
                    <span className="metric-value">{campaign.clicks}</span>
                  </div>
                  <div className="campaign-metric">
                    <span className="metric-label">CTR</span>
                    <span className="metric-value">{getCTR(campaign.clicks, campaign.impressions)}%</span>
                  </div>
                  <div className="campaign-metric">
                    <span className="metric-label">Conversions</span>
                    <span className="metric-value">{campaign.conversions}</span>
                  </div>
                  <div className="campaign-metric roi-metric">
                    <span className="metric-label">ROI</span>
                    <span className="metric-value">{campaign.roi}x</span>
                  </div>
                </div>

                <div className="campaign-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {((campaign.spent / campaign.budget) * 100).toFixed(1)}% du budget utilisé
                  </span>
                </div>

                <div className="campaign-actions">
                  <button 
                    className="btn-action edit"
                    onClick={() => handleEditCampaign(campaign)}
                    disabled={actionLoading === campaign.id}
                  >
                    <Edit size={16} />
                  </button>
                  
                  {campaign.status === 'active' ? (
                    <button 
                      className="btn-action pause"
                      onClick={() => handleStatusChange(campaign, 'paused')}
                      disabled={actionLoading === campaign.id}
                      title="Mettre en pause"
                    >
                      <Pause size={16} />
                    </button>
                  ) : campaign.status === 'paused' ? (
                    <button 
                      className="btn-action play"
                      onClick={() => handleStatusChange(campaign, 'active')}
                      disabled={actionLoading === campaign.id}
                      title="Reprendre"
                    >
                      <Play size={16} />
                    </button>
                  ) : null}
                  
                  {campaign.status !== 'completed' && (
                    <button 
                      className="btn-action complete"
                      onClick={() => handleStatusChange(campaign, 'completed')}
                      disabled={actionLoading === campaign.id}
                      title="Marquer comme terminé"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  
                  <button 
                    className="btn-action delete"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    disabled={actionLoading === campaign.id}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCampaign}
        onUpdate={handleUpdateCampaign}
        campaign={selectedCampaign}
        mode={modalMode}
      />
    </div>
  );
}
