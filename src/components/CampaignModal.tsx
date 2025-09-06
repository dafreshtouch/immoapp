import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';
import { CampaignData } from '../hooks/useCampaigns';
import './CampaignModal.css';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<CampaignData>) => Promise<void>;
  campaign?: CampaignData | null;
  mode: 'create' | 'edit';
}

export function CampaignModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onUpdate, 
  campaign, 
  mode 
}: CampaignModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Facebook Ads',
    budget: 0,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    roi: 0,
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'paused' | 'completed'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campaign && mode === 'edit') {
      setFormData({
        name: campaign.name,
        platform: campaign.platform,
        budget: campaign.budget,
        spent: campaign.spent,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        conversions: campaign.conversions,
        roi: campaign.roi,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        platform: 'Facebook Ads',
        budget: 0,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roi: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [campaign, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la campagne est requis';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Le budget doit être supérieur à 0';
    }

    if (formData.spent < 0) {
      newErrors.spent = 'Le montant dépensé ne peut pas être négatif';
    }

    if (formData.spent > formData.budget) {
      newErrors.spent = 'Le montant dépensé ne peut pas dépasser le budget';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'create') {
        await onSave(formData);
      } else if (mode === 'edit' && campaign && onUpdate) {
        await onUpdate(campaign.id, formData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="campaign-modal-overlay">
      <div className="campaign-modal">
        <div className="campaign-modal-header">
          <h2>
            {mode === 'create' ? 'Nouvelle Campagne' : 'Modifier la Campagne'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="campaign-modal-form">
          <div className="form-grid">
            {/* Informations de base */}
            <div className="form-section">
              <h3>Informations générales</h3>
              
              <div className="form-group">
                <label htmlFor="name">Nom de la campagne *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Ex: Campagne Appartements Centre-ville"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="platform">Plateforme *</label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                >
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter Ads">Twitter Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Statut</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Actif</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
            </div>

            {/* Budget et dates */}
            <div className="form-section">
              <h3>Budget et planification</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">Budget total (€) *</label>
                  <div className="input-with-icon">
                    <DollarSign size={18} />
                    <input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                      className={errors.budget ? 'error' : ''}
                    />
                  </div>
                  {errors.budget && <span className="error-message">{errors.budget}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="spent">Montant dépensé (€)</label>
                  <div className="input-with-icon">
                    <DollarSign size={18} />
                    <input
                      id="spent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.spent}
                      onChange={(e) => handleInputChange('spent', parseFloat(e.target.value) || 0)}
                      className={errors.spent ? 'error' : ''}
                    />
                  </div>
                  {errors.spent && <span className="error-message">{errors.spent}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Date de début *</label>
                  <div className="input-with-icon">
                    <Calendar size={18} />
                    <input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={errors.startDate ? 'error' : ''}
                    />
                  </div>
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Date de fin</label>
                  <div className="input-with-icon">
                    <Calendar size={18} />
                    <input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={errors.endDate ? 'error' : ''}
                    />
                  </div>
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>
              </div>
            </div>

            {/* Métriques de performance */}
            <div className="form-section">
              <h3>Métriques de performance</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="impressions">Impressions</label>
                  <div className="input-with-icon">
                    <Target size={18} />
                    <input
                      id="impressions"
                      type="number"
                      min="0"
                      value={formData.impressions}
                      onChange={(e) => handleInputChange('impressions', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="clicks">Clics</label>
                  <div className="input-with-icon">
                    <Target size={18} />
                    <input
                      id="clicks"
                      type="number"
                      min="0"
                      value={formData.clicks}
                      onChange={(e) => handleInputChange('clicks', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="conversions">Conversions</label>
                  <div className="input-with-icon">
                    <Target size={18} />
                    <input
                      id="conversions"
                      type="number"
                      min="0"
                      value={formData.conversions}
                      onChange={(e) => handleInputChange('conversions', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="roi">ROI</label>
                  <div className="input-with-icon">
                    <TrendingUp size={18} />
                    <input
                      id="roi"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.roi}
                      onChange={(e) => handleInputChange('roi', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="campaign-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              <Save size={18} />
              {loading ? 'Sauvegarde...' : (mode === 'create' ? 'Créer' : 'Modifier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
