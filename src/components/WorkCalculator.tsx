import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Save, Home as HomeIcon } from 'lucide-react';
import './WorkCalculator.css';

interface MaterialPrice {
  id: string;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  description?: string;
}

interface WorkItem {
  id: string;
  room: string;
  category: string;
  description: string;
  surface: number;
  materialId: string;
  materialPrice: number;
  laborHours: number;
  laborRate: number;
  totalMaterial: number;
  totalLabor: number;
  total: number;
}

interface Project {
  id: string;
  name: string;
  propertyType: string;
  totalSurface: number;
  rooms: string[];
  workItems: WorkItem[];
  totalMaterials: number;
  totalLabor: number;
  totalCost: number;
  margin: number;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkCalculatorProps {
  project: Project | null;
  materials: MaterialPrice[];
  roomTypes: string[];
  workCategories: string[];
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const LABOR_RATES = {
  'Peinture': 25,
  'Sol': 35,
  'Mur': 30,
  'Électricité': 45,
  'Plomberie': 50,
  'Menuiserie': 40,
  'Autre': 30
};

export function WorkCalculator({ project, materials, roomTypes, workCategories, onSave, onCancel }: WorkCalculatorProps) {
  const [formData, setFormData] = useState<Project>({
    id: '',
    name: '',
    propertyType: 'Appartement',
    totalSurface: 0,
    rooms: [],
    workItems: [],
    totalMaterials: 0,
    totalLabor: 0,
    totalCost: 0,
    margin: 20,
    finalPrice: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [newRoom, setNewRoom] = useState('');

  useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  useEffect(() => {
    calculateTotals();
  }, [formData.workItems, formData.margin]);

  const calculateTotals = () => {
    const totalMaterials = formData.workItems.reduce((sum, item) => sum + item.totalMaterial, 0);
    const totalLabor = formData.workItems.reduce((sum, item) => sum + item.totalLabor, 0);
    const totalCost = totalMaterials + totalLabor;
    const finalPrice = totalCost * (1 + formData.margin / 100);

    setFormData(prev => ({
      ...prev,
      totalMaterials,
      totalLabor,
      totalCost,
      finalPrice
    }));
  };

  const addRoom = () => {
    if (newRoom && !formData.rooms.includes(newRoom)) {
      setFormData(prev => ({
        ...prev,
        rooms: [...prev.rooms, newRoom]
      }));
      setNewRoom('');
    }
  };

  const removeRoom = (room: string) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r !== room),
      workItems: prev.workItems.filter(item => item.room !== room)
    }));
  };

  const addWorkItem = () => {
    const newItem: WorkItem = {
      id: Date.now().toString(),
      room: formData.rooms[0] || '',
      category: 'Peinture',
      description: '',
      surface: 0,
      materialId: materials.find(m => m.category === 'Peinture')?.id || '',
      materialPrice: 0,
      laborHours: 0,
      laborRate: LABOR_RATES['Peinture'],
      totalMaterial: 0,
      totalLabor: 0,
      total: 0
    };

    setFormData(prev => ({
      ...prev,
      workItems: [...prev.workItems, newItem]
    }));
  };

  const updateWorkItem = (index: number, field: keyof WorkItem, value: any) => {
    const newItems = [...formData.workItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculer les totaux de l'item
    const item = newItems[index];
    
    if (field === 'materialId') {
      const material = materials.find(m => m.id === value);
      if (material) {
        item.materialPrice = material.pricePerUnit;
      }
    }

    if (field === 'category') {
      item.laborRate = LABOR_RATES[value as keyof typeof LABOR_RATES] || 30;
      // Mettre à jour les matériaux disponibles pour cette catégorie
      const categoryMaterials = materials.filter(m => m.category === value);
      if (categoryMaterials.length > 0) {
        item.materialId = categoryMaterials[0].id;
        item.materialPrice = categoryMaterials[0].pricePerUnit;
      }
    }

    // Recalculer les totaux
    item.totalMaterial = item.surface * item.materialPrice;
    item.totalLabor = item.laborHours * item.laborRate;
    item.total = item.totalMaterial + item.totalLabor;

    setFormData(prev => ({
      ...prev,
      workItems: newItems
    }));
  };

  const removeWorkItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workItems: prev.workItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getMaterialsByCategory = (category: string) => {
    return materials.filter(m => m.category === category);
  };

  return (
    <div className="work-calculator-overlay">
      <div className="work-calculator-container">
        <div className="calculator-header">
          <h2>{project ? 'Modifier le projet' : 'Nouveau projet'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="calculator-form">
          {/* Informations générales */}
          <div className="form-section">
            <h3>Informations générales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom du projet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type de bien</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                >
                  <option value="Appartement">Appartement</option>
                  <option value="Maison">Maison</option>
                  <option value="Studio">Studio</option>
                  <option value="Loft">Loft</option>
                  <option value="Bureau">Bureau</option>
                </select>
              </div>
              <div className="form-group">
                <label>Surface totale (m²)</label>
                <input
                  type="number"
                  value={formData.totalSurface}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalSurface: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Marge (%)</label>
                <input
                  type="number"
                  value={formData.margin}
                  onChange={(e) => setFormData(prev => ({ ...prev, margin: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Gestion des pièces */}
          <div className="form-section">
            <div className="section-header">
              <h3>Pièces</h3>
              <div className="add-room-controls">
                <select
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                >
                  <option value="">Sélectionner une pièce</option>
                  {roomTypes.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
                <button type="button" className="add-room-btn" onClick={addRoom}>
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
            </div>
            
            <div className="rooms-list">
              {formData.rooms.map((room, index) => (
                <div key={index} className="room-item">
                  <HomeIcon size={16} />
                  <span>{room}</span>
                  <button
                    type="button"
                    className="remove-room-btn"
                    onClick={() => removeRoom(room)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Travaux */}
          <div className="form-section">
            <div className="section-header">
              <h3>Travaux</h3>
              <button type="button" className="add-work-btn" onClick={addWorkItem}>
                <Plus size={16} />
                Ajouter un poste
              </button>
            </div>

            <div className="work-items-table">
              <div className="table-header">
                <div className="col-room">Pièce</div>
                <div className="col-category">Catégorie</div>
                <div className="col-description">Description</div>
                <div className="col-surface">Surface</div>
                <div className="col-material">Matériau</div>
                <div className="col-labor">Main d'œuvre</div>
                <div className="col-total">Total</div>
                <div className="col-actions">Actions</div>
              </div>

              {formData.workItems.map((item, index) => (
                <div key={item.id} className="table-row">
                  <div className="col-room">
                    <select
                      value={item.room}
                      onChange={(e) => updateWorkItem(index, 'room', e.target.value)}
                    >
                      {formData.rooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-category">
                    <select
                      value={item.category}
                      onChange={(e) => updateWorkItem(index, 'category', e.target.value)}
                    >
                      {workCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-description">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateWorkItem(index, 'description', e.target.value)}
                      placeholder="Description du travail"
                    />
                  </div>
                  
                  <div className="col-surface">
                    <input
                      type="number"
                      value={item.surface}
                      onChange={(e) => updateWorkItem(index, 'surface', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.1"
                      placeholder="m²"
                    />
                  </div>
                  
                  <div className="col-material">
                    <select
                      value={item.materialId}
                      onChange={(e) => updateWorkItem(index, 'materialId', e.target.value)}
                    >
                      {getMaterialsByCategory(item.category).map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.pricePerUnit}€/{material.unit})
                        </option>
                      ))}
                    </select>
                    <div className="material-cost">
                      {item.totalMaterial.toFixed(2)} €
                    </div>
                  </div>
                  
                  <div className="col-labor">
                    <div className="labor-inputs">
                      <input
                        type="number"
                        value={item.laborHours}
                        onChange={(e) => updateWorkItem(index, 'laborHours', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        placeholder="Heures"
                      />
                      <span>h × {item.laborRate}€/h</span>
                    </div>
                    <div className="labor-cost">
                      {item.totalLabor.toFixed(2)} €
                    </div>
                  </div>
                  
                  <div className="col-total">
                    <strong>{item.total.toFixed(2)} €</strong>
                  </div>
                  
                  <div className="col-actions">
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeWorkItem(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="form-section">
            <h3>Récapitulatif des coûts</h3>
            <div className="cost-summary">
              <div className="cost-breakdown">
                <div className="cost-row">
                  <span>Matériaux:</span>
                  <span>{formData.totalMaterials.toFixed(2)} €</span>
                </div>
                <div className="cost-row">
                  <span>Main d'œuvre:</span>
                  <span>{formData.totalLabor.toFixed(2)} €</span>
                </div>
                <div className="cost-row subtotal">
                  <span>Sous-total:</span>
                  <span>{formData.totalCost.toFixed(2)} €</span>
                </div>
                <div className="cost-row">
                  <span>Marge ({formData.margin}%):</span>
                  <span>{(formData.finalPrice - formData.totalCost).toFixed(2)} €</span>
                </div>
                <div className="cost-row total">
                  <span>Prix final:</span>
                  <span>{formData.finalPrice.toFixed(2)} €</span>
                </div>
              </div>
              
              <div className="cost-per-sqm">
                {formData.totalSurface > 0 && (
                  <div className="sqm-cost">
                    <span>Coût au m²:</span>
                    <span>{(formData.finalPrice / formData.totalSurface).toFixed(2)} €/m²</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="save-btn">
              <Save size={16} />
              {project ? 'Mettre à jour' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
