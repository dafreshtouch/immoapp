import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, Download, Upload, X } from 'lucide-react';
import { useStock, Stock } from '../hooks/useStock';
import './Supports.css';

export function Supports() {
  const { stocks, loading, error, addStock, updateStock, deleteStock } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupport, setEditingSupport] = useState<Stock | null>(null);

  const typeLabels = {
    brochure: 'Brochure',
    flyer: 'Flyer',
    carte_visite: 'Carte de visite',
    panneau: 'Panneau',
    autre: 'Autre'
  };

  const filteredSupports = stocks.filter((support: Stock) => {
    const matchesSearch = support.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         support.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || support.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalValue = stocks.reduce((sum: number, support: Stock) => sum + support.cost, 0);
  const totalQuantity = stocks.reduce((sum: number, support: Stock) => sum + support.quantity, 0);
  const totalUsed = stocks.reduce((sum: number, support: Stock) => sum + support.quantityUsed, 0);

  const handleEdit = (support: Stock) => {
    setEditingSupport(support);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce support ?')) {
      try {
        await deleteStock(id);
      } catch (err) {
        alert('Erreur lors de la suppression du support');
      }
    }
  };

  const handleSave = async (supportData: Omit<Stock, 'id'>) => {
    try {
      if (editingSupport) {
        // Modification d'un support existant
        await updateStock(editingSupport.id, supportData);
      } else {
        // Ajout d'un nouveau support
        await addStock(supportData);
      }
      setIsModalOpen(false);
      setEditingSupport(null);
    } catch (err) {
      alert('Erreur lors de la sauvegarde du support');
    }
  };

  const getStockStatus = (support: Stock) => {
    const remaining = support.quantity - support.quantityUsed;
    const percentage = (remaining / support.quantity) * 100;
    
    if (percentage <= 10) return 'critical';
    if (percentage <= 25) return 'low';
    return 'good';
  };

  return (
    <div className="page-container">
      <div className="supports-header">
        <div className="header-content">
          <h1 className="page-title">
            <Package size={28} />
            Gestion des Supports
          </h1>
          <p className="page-subtitle">Gérez votre stock de supports marketing et commerciaux</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingSupport(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} />
          Ajouter un support
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{filteredSupports.length}</span>
            <span className="stat-label">Types de supports</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Download size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalQuantity}</span>
            <span className="stat-label">Quantité totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Upload size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalUsed}</span>
            <span className="stat-label">Quantité utilisée</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span>€</span>
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalValue}€</span>
            <span className="stat-label">Valeur totale</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher un support..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-select">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="brochure">Brochures</option>
            <option value="flyer">Flyers</option>
            <option value="carte_visite">Cartes de visite</option>
            <option value="panneau">Panneaux</option>
            <option value="autre">Autres</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
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

      {/* Error State */}
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

      {/* Supports Grid */}
      {!loading && (
        <div className="supports-grid">
          {filteredSupports.map((support: Stock) => {
            const remaining = support.quantity - support.quantityUsed;
            const percentage = (remaining / support.quantity) * 100;
            const stockStatus = getStockStatus(support);

            return (
              <div key={support.id} className={`support-card ${stockStatus}`}>
                <div className="support-header">
                  <div className="support-type">
                    <Package size={18} />
                    <span>{typeLabels[support.type as keyof typeof typeLabels]}</span>
                  </div>
                <div className="support-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEdit(support)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => handleDelete(support.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="support-name">{support.name}</h3>
              
              {support.description && (
                <p className="support-description">{support.description}</p>
              )}

              <div className="support-details">
                <div className="detail-row">
                  <span className="detail-label">Fournisseur:</span>
                  <span className="detail-value">{support.supplier}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Coût:</span>
                  <span className="detail-value">{support.cost}€</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date d'ajout:</span>
                  <span className="detail-value">
                    {new Date(support.dateAdded).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="stock-info">
                <div className="stock-numbers">
                  <span className="stock-remaining">{remaining}</span>
                  <span className="stock-separator">/</span>
                  <span className="stock-total">{support.quantity}</span>
                  <span className="stock-label">restants</span>
                </div>
                <div className="stock-bar">
                  <div 
                    className="stock-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="stock-status-label">
                  {stockStatus === 'critical' && 'Stock critique'}
                  {stockStatus === 'low' && 'Stock faible'}
                  {stockStatus === 'good' && 'Stock correct'}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {!loading && filteredSupports.length === 0 && (
        <div className="empty-state">
          <Package size={64} />
          <h3>Aucun support trouvé</h3>
          <p>
            {searchTerm || filterType !== 'all'
              ? 'Aucun support ne correspond à vos critères de recherche.'
              : 'Commencez par ajouter votre premier support marketing.'}
          </p>
        </div>
      )}

      {/* Modal pour ajouter/modifier un support */}
      {isModalOpen && (
        <SupportModal
          support={editingSupport}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSupport(null);
          }}
        />
      )}
    </div>
  );
}

// Composant Modal pour ajouter/modifier un support
interface SupportModalProps {
  support: Stock | null;
  onSave: (support: Omit<Stock, 'id'>) => void;
  onClose: () => void;
}

function SupportModal({ support, onSave, onClose }: SupportModalProps) {
  const [formData, setFormData] = useState({
    name: support?.name || '',
    type: support?.type || 'brochure' as Stock['type'],
    quantity: support?.quantity || 0,
    quantityUsed: support?.quantityUsed || 0,
    cost: support?.cost || 0,
    supplier: support?.supplier || '',
    dateAdded: support?.dateAdded || new Date().toISOString().split('T')[0],
    description: support?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.supplier.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.quantity < 0 || formData.quantityUsed < 0 || formData.cost < 0) {
      alert('Les quantités et coûts ne peuvent pas être négatifs');
      return;
    }

    if (formData.quantityUsed > formData.quantity) {
      alert('La quantité utilisée ne peut pas être supérieure à la quantité totale');
      return;
    }

    onSave(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{support ? 'Modifier le support' : 'Ajouter un support'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="support-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nom du support *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Brochure Villa Moderne"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type de support *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as Stock['type'])}
                required
              >
                <option value="brochure">Brochure</option>
                <option value="flyer">Flyer</option>
                <option value="carte_visite">Carte de visite</option>
                <option value="panneau">Panneau</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantité totale *</label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantityUsed">Quantité utilisée</label>
              <input
                id="quantityUsed"
                type="number"
                min="0"
                max={formData.quantity}
                value={formData.quantityUsed}
                onChange={(e) => handleChange('quantityUsed', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost">Coût (€) *</label>
              <input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplier">Fournisseur *</label>
              <input
                id="supplier"
                type="text"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                placeholder="Ex: Imprimerie Dupont"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateAdded">Date d'ajout</label>
              <input
                id="dateAdded"
                type="date"
                value={formData.dateAdded}
                onChange={(e) => handleChange('dateAdded', e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description du support..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {support ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
