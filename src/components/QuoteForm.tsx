import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator } from 'lucide-react';
import './QuoteForm.css';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  projectTitle: string;
  items: QuoteItem[];
  taxRate: number;
  validityDays: number;
  notes: string;
}

interface QuoteFormProps {
  quote?: any;
  onSave: (data: QuoteFormData & { subtotal: number; taxAmount: number; total: number }) => void;
  onCancel: () => void;
}

export function QuoteForm({ quote, onSave, onCancel }: QuoteFormProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    projectTitle: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 20,
    validityDays: 30,
    notes: ''
  });

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  useEffect(() => {
    if (quote) {
      setFormData({
        clientName: quote.clientName || '',
        clientEmail: quote.clientEmail || '',
        clientPhone: quote.clientPhone || '',
        clientAddress: quote.clientAddress || '',
        projectTitle: quote.projectTitle || '',
        items: quote.items || [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: quote.taxRate || 20,
        validityDays: quote.validityDays || 30,
        notes: quote.notes || ''
      });
    }
  }, [quote]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setCalculations({ subtotal, taxAmount, total });
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculer le total de la ligne
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...calculations
    });
  };

  return (
    <div className="quote-form-overlay">
      <div className="quote-form-container">
        <div className="quote-form-header">
          <h2>{quote ? 'Modifier le devis' : 'Nouveau devis'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quote-form">
          {/* Informations client */}
          <div className="form-section">
            <h3>Informations client</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom du client *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Adresse</label>
                <textarea
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Informations projet */}
          <div className="form-section">
            <h3>Projet</h3>
            <div className="form-group">
              <label>Titre du projet *</label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Articles */}
          <div className="form-section">
            <div className="section-header">
              <h3>Articles</h3>
              <button type="button" className="add-item-btn" onClick={addItem}>
                <Plus size={16} />
                Ajouter un article
              </button>
            </div>
            
            <div className="items-table">
              <div className="table-header">
                <div className="col-description">Description</div>
                <div className="col-quantity">Quantité</div>
                <div className="col-price">Prix unitaire</div>
                <div className="col-total">Total</div>
                <div className="col-actions">Actions</div>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="table-row">
                  <div className="col-description">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description de l'article"
                      required
                    />
                  </div>
                  <div className="col-quantity">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-price">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-total">
                    <span className="total-amount">{item.total.toFixed(2)} €</span>
                  </div>
                  <div className="col-actions">
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculs */}
          <div className="form-section">
            <div className="calculations-section">
              <div className="tax-rate-input">
                <label>Taux de TVA (%)</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              
              <div className="calculations-summary">
                <div className="calc-row">
                  <span>Sous-total HT:</span>
                  <span>{calculations.subtotal.toFixed(2)} €</span>
                </div>
                <div className="calc-row">
                  <span>TVA ({formData.taxRate}%):</span>
                  <span>{calculations.taxAmount.toFixed(2)} €</span>
                </div>
                <div className="calc-row total-row">
                  <span>Total TTC:</span>
                  <span>{calculations.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="form-section">
            <h3>Options</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Validité (jours)</label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 30 })}
                  min="1"
                />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Notes ou conditions particulières..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="save-btn">
              <Calculator size={16} />
              {quote ? 'Mettre à jour' : 'Créer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
