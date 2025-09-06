import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, FileText, Globe, CreditCard, Camera, Building } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import './MarketingCosts.css';

interface MarketingCost {
  id: string;
  type: 'impression' | 'digital' | 'subscription' | 'visual' | 'platform';
  name: string;
  description: string;
  cost: number;
  date?: string;
  details: {
    // Pour impressions
    pages?: number;
    paperWeight?: string;
    binding?: string;
    quantity?: number;
    // Pour abonnements
    subscriptionDuration?: string;
    renewalDate?: string;
    // Pour visuels virtuels
    visualType?: 'visite-virtuelle' | 'home-staging-virtuel' | 'plan-3d' | 'video-drone' | 'photo-360';
    software?: string;
    renderTime?: number;
    resolution?: string;
    // Pour plateformes immobilières
    platform?: 'leboncoin' | 'seloger' | 'pap' | 'orpi' | 'century21' | 'laforet' | 'guy-hoquet' | 'facebook-ads' | 'google-ads' | 'instagram-ads' | 'linkedin-ads';
    campaignDuration?: string;
    audience?: string;
    targeting?: string[];
  };
  createdAt?: any;
  updatedAt?: any;
}

export function MarketingCosts() {
  const { user } = useAuth();
  const { data: costs, loading, error, addItem, updateItem, deleteItem } = useFirestore<MarketingCost>('marketingCosts');
  
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'impression' | 'digital' | 'subscription' | 'visual' | 'platform'>('all');
  const [editingCost, setEditingCost] = useState<Partial<MarketingCost>>({});
  
  const [newCost, setNewCost] = useState<Partial<MarketingCost>>({
    type: 'digital',
    name: '',
    description: '',
    cost: 0,
    details: {},
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddCost = async () => {
    if (!user || !newCost.name?.trim()) return;

    try {
      await addItem({
        ...newCost,
        type: activeTab === 'all' ? 'digital' : activeTab
      } as Omit<MarketingCost, 'id'>);

      setNewCost({
        type: activeTab === 'all' ? 'digital' : activeTab,
        name: '',
        description: '',
        cost: 0,
        details: {}
      });
      setIsAddingCost(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du coût:', error);
    }
  };

  const handleEditStart = (cost: MarketingCost) => {
    setEditingId(cost.id);
    setEditingCost(cost);
  };

  const handleEditSave = async () => {
    if (!user || !editingId) return;

    try {
      await updateItem(editingId, editingCost);
      setEditingId(null);
      setEditingCost({});
    } catch (error) {
      console.error('Erreur lors de la modification du coût:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingCost({});
  };

  const handleUpdateCost = async (id: string, updates: Partial<MarketingCost>) => {
    if (!user) return;

    try {
      await updateItem(id, updates);
      setEditingId(null);
    } catch (error) {
      console.error('Erreur lors de la modification du coût:', error);
    }
  };

  const handleDeleteCost = async (id: string) => {
    if (!user) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coût ?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Erreur lors de la suppression du coût:', error);
      }
    }
  };

  const getTotalByType = (type: string) => {
    return costs
      .filter(cost => cost.type === type)
      .reduce((total, cost) => total + cost.cost, 0);
  };

  const getTotalCosts = () => {
    return costs.reduce((total, cost) => total + cost.cost, 0);
  };

  // Données génériques pour les utilisateurs non connectés
  const sampleCosts = [
    {
      id: 'sample-1',
      type: 'digital' as const,
      name: 'Site Web',
      description: 'Modules WordPress',
      cost: 220,
      details: { modules: ['WooCommerce', 'SEO'] }
    },
    {
      id: 'sample-2', 
      type: 'subscription' as const,
      name: 'Abonnements',
      description: 'Outils marketing',
      cost: 15,
      details: { subscriptionDuration: 'mensuel' }
    },
    {
      id: 'sample-3',
      type: 'impression' as const,
      name: 'Impressions',
      description: 'Flyers et brochures',
      cost: 400,
      details: { pages: 4, quantity: 500 }
    }
  ];

  const displayCosts = user ? costs : sampleCosts;
  const getSampleTotalByType = (type: string) => {
    return sampleCosts
      .filter(cost => cost.type === type)
      .reduce((total, cost) => total + cost.cost, 0);
  };
  const getSampleTotalCosts = () => {
    return sampleCosts.reduce((total, cost) => total + cost.cost, 0);
  };

  if (!user) {
    return (
      <div className="marketing-costs">
        <div className="costs-header">
          <h3>Coûts Marketing</h3>
          <div className="total-cost">
            Total: {getSampleTotalCosts().toFixed(2)} €
          </div>
        </div>

        <div className="cost-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            <FileText size={16} />
            Tous ({getSampleTotalCosts().toFixed(2)} €)
          </button>
          <button className={`tab-btn ${activeTab === 'digital' ? 'active' : ''}`} onClick={() => setActiveTab('digital')}>
            <Globe size={16} />
            Sites Web ({getSampleTotalByType('digital').toFixed(2)} €)
          </button>
          <button className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => setActiveTab('subscription')}>
            <CreditCard size={16} />
            Abonnements ({getSampleTotalByType('subscription').toFixed(2)} €)
          </button>
          <button className={`tab-btn ${activeTab === 'impression' ? 'active' : ''}`} onClick={() => setActiveTab('impression')}>
            <FileText size={16} />
            Impressions ({getSampleTotalByType('impression').toFixed(2)} €)
          </button>
        </div>

        <div className="costs-content">
          <div className="costs-list">
            {sampleCosts
              .filter(cost => activeTab === 'all' || cost.type === activeTab)
              .map(cost => (
                <div key={cost.id} className="cost-item">
                  <div className="cost-info">
                    <h4>{cost.name}</h4>
                    <p>{cost.description}</p>
                    <div className="cost-details">
                      {cost.type === 'impression' && (
                        <span>
                          {cost.details.pages} pages • Qté: {cost.details.quantity}
                        </span>
                      )}
                      {cost.type === 'digital' && (
                        <span>
                          {cost.details.modules?.length ? `Modules: ${cost.details.modules.join(', ')}` : ''}
                        </span>
                      )}
                      {cost.type === 'subscription' && (
                        <span>
                          {cost.details.subscriptionDuration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="cost-amount">
                    {cost.cost.toFixed(2)} €
                  </div>
                </div>
              ))}
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: 'rgba(0,0,0,0.6)',
            fontStyle: 'italic'
          }}>
            Connectez-vous pour gérer vos coûts marketing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-costs">
      <div className="costs-header">
        <h3>Coûts Marketing</h3>
        <div className="total-cost">
          Total: {getTotalCosts().toFixed(2)} €
        </div>
      </div>

      <div className="cost-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FileText size={16} />
          Tous ({getTotalCosts().toFixed(2)} €)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'digital' ? 'active' : ''}`}
          onClick={() => setActiveTab('digital')}
        >
          <Globe size={16} />
          Sites Web ({getTotalByType('digital').toFixed(2)} €)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
          onClick={() => setActiveTab('visual')}
        >
          <Camera size={16} />
          Visuels Virtuels ({getTotalByType('visual').toFixed(2)} €)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'platform' ? 'active' : ''}`}
          onClick={() => setActiveTab('platform')}
        >
          <Building size={16} />
          Plateformes ({getTotalByType('platform').toFixed(2)} €)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <CreditCard size={16} />
          Abonnements ({getTotalByType('subscription').toFixed(2)} €)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'impression' ? 'active' : ''}`}
          onClick={() => setActiveTab('impression')}
        >
          <FileText size={16} />
          Impressions ({getTotalByType('impression').toFixed(2)} €)
        </button>
      </div>

      <div className="costs-content">
        {activeTab !== 'all' && (
          <div className="costs-actions">
            <button 
              className="add-cost-btn"
              onClick={() => setIsAddingCost(true)}
            >
              <Plus size={16} />
              Ajouter {activeTab === 'digital' ? 'un site web' : 
                       activeTab === 'visual' ? 'un visuel virtuel' :
                       activeTab === 'platform' ? 'une plateforme' :
                       activeTab === 'subscription' ? 'un abonnement' :
                       'une impression'}
            </button>
          </div>
        )}

        {loading && <div className="loading">Chargement...</div>}
        {error && <div className="error">Erreur: {error}</div>}

        {isAddingCost && (
          <div className="cost-form">
            <h4>Nouveau {activeTab === 'digital' ? 'site web' : 
                          activeTab === 'visual' ? 'visuel virtuel' :
                          activeTab === 'platform' ? 'plateforme immobilière' :
                          activeTab === 'subscription' ? 'abonnement' :
                          'projet d\'impression'}</h4>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Nom du projet"
                value={newCost.name || ''}
                onChange={(e) => setNewCost(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="input-with-suffix">
                <input
                  type="number"
                  placeholder="Coût"
                  value={newCost.cost || 0}
                  onChange={(e) => setNewCost(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                />
                <span className="input-suffix">€</span>
              </div>
            </div>

            <textarea
              placeholder="Description"
              value={newCost.description || ''}
              onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
            />

            {activeTab === 'impression' && (
              <div className="impression-details">
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Nombre de pages"
                    value={newCost.details?.pages || ''}
                    onChange={(e) => setNewCost(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, pages: parseInt(e.target.value) || 0 }
                    }))}
                  />
                  <input
                    type="text"
                    placeholder="Grammage (ex: 250g/m²)"
                    value={newCost.details?.paperWeight || ''}
                    onChange={(e) => setNewCost(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, paperWeight: e.target.value }
                    }))}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Reliure (ex: agrafé, spirale)"
                    value={newCost.details?.binding || ''}
                    onChange={(e) => setNewCost(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, binding: e.target.value }
                    }))}
                  />
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={newCost.details?.quantity || ''}
                    onChange={(e) => setNewCost(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, quantity: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <input
                type="date"
                placeholder="Date"
                value={newCost.date || ''}
                onChange={(e) => setNewCost(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {activeTab === 'subscription' && (
              <div className="subscription-details">
                <div className="form-row">
                  <select
                    value={newCost.details?.subscriptionDuration || ''}
                    onChange={(e) => setNewCost(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, subscriptionDuration: e.target.value }
                    }))}
                  >
                    <option value="">Durée</option>
                    <option value="mensuel">Mensuel</option>
                    <option value="annuel">Annuel</option>
                    <option value="ponctuel">Ponctuel</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Date de renouvellement"
                    value={newCost.details?.renewalDate || ''}
                    onChange={(e) => setNewCost(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, renewalDate: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button onClick={handleAddCost} className="save-btn">
                <Save size={16} />
                Enregistrer
              </button>
              <button onClick={() => setIsAddingCost(false)} className="cancel-btn">
                <X size={16} />
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="costs-list">
          {costs
            .filter(cost => activeTab === 'all' || cost.type === activeTab)
            .map(cost => (
              <div key={cost.id} className="cost-item">
                {editingId === cost.id ? (
                  // Mode édition
                  <div className="cost-form">
                    <div className="form-row">
                      <input
                        type="text"
                        value={editingCost.name || ''}
                        onChange={(e) => setEditingCost(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom du projet"
                      />
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          value={editingCost.cost || 0}
                          onChange={(e) => setEditingCost(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                          placeholder="Coût"
                        />
                        <span className="input-suffix">€</span>
                      </div>
                    </div>
                    
                    <textarea
                      value={editingCost.description || ''}
                      onChange={(e) => setEditingCost(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                    />

                    {cost.type === 'impression' && (
                      <div className="impression-details">
                        <div className="form-row">
                          <input
                            type="number"
                            placeholder="Nombre de pages"
                            value={editingCost.details?.pages || ''}
                            onChange={(e) => setEditingCost(prev => ({ 
                              ...prev, 
                              details: { ...prev.details, pages: parseInt(e.target.value) || 0 }
                            }))}
                          />
                          <input
                            type="text"
                            placeholder="Grammage"
                            value={editingCost.details?.paperWeight || ''}
                            onChange={(e) => setEditingCost(prev => ({ 
                              ...prev, 
                              details: { ...prev.details, paperWeight: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="form-row">
                          <input
                            type="text"
                            placeholder="Reliure"
                            value={editingCost.details?.binding || ''}
                            onChange={(e) => setEditingCost(prev => ({ 
                              ...prev, 
                              details: { ...prev.details, binding: e.target.value }
                            }))}
                          />
                          <input
                            type="number"
                            placeholder="Quantité"
                            value={editingCost.details?.quantity || ''}
                            onChange={(e) => setEditingCost(prev => ({ 
                              ...prev, 
                              details: { ...prev.details, quantity: parseInt(e.target.value) || 0 }
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <input
                        type="date"
                        value={editingCost.date || ''}
                        onChange={(e) => setEditingCost(prev => ({ ...prev, date: e.target.value }))}
                        placeholder="Date"
                      />
                    </div>

                    {cost.type === 'subscription' && (
                      <div className="subscription-details">
                        <div className="form-row">
                          <select
                            value={editingCost.details?.subscriptionDuration || ''}
                            onChange={(e) => setEditingCost(prev => ({ 
                              ...prev, 
                              details: { ...prev.details, subscriptionDuration: e.target.value }
                            }))}
                          >
                            <option value="">Durée</option>
                            <option value="mensuel">Mensuel</option>
                            <option value="annuel">Annuel</option>
                            <option value="ponctuel">Ponctuel</option>
                          </select>
                          <input
                            type="date"
                            value={editingCost.details?.renewalDate || ''}
                            onChange={(e) => setEditingCost(prev => ({ 
                              ...prev, 
                              details: { ...prev.details, renewalDate: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-actions">
                      <button onClick={handleEditSave} className="save-btn">
                        <Save size={16} />
                        Sauvegarder
                      </button>
                      <button onClick={handleEditCancel} className="cancel-btn">
                        <X size={16} />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <>
                    <div className="cost-info">
                      <h4>{cost.name}</h4>
                      <p>{cost.description}</p>
                      <div className="cost-details">
                        {cost.type === 'impression' && (
                          <span>
                            {cost.details.pages} pages • {cost.details.paperWeight} • {cost.details.binding} • Qté: {cost.details.quantity}
                          </span>
                        )}
                        {cost.type === 'digital' && cost.date && (
                          <span>
                            Date: {new Date(cost.date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {cost.type === 'subscription' && (
                          <span>
                            {cost.details.subscriptionDuration} 
                            {cost.details.renewalDate ? ` • Renouvellement: ${cost.details.renewalDate}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="cost-amount">
                      {cost.cost.toFixed(2)} €
                    </div>
                    <div className="cost-actions">
                      <button 
                        onClick={() => handleEditStart(cost)}
                        className="edit-btn"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCost(cost.id)}
                        className="delete-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
