import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import './TransactionForm.css';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
}

const expenseCategories = [
  'Marketing Digital',
  'Marketing Traditionnel',
  'Publicité Facebook/Google',
  'SEO/SEM',
  'Influenceurs',
  'Événements/Salons',
  'Infrastructure Web',
  'Hébergement/Domaines',
  'Outils/Logiciels',
  'Support Client',
  'Développement Web',
  'Design/UX',
  'Formation/Certification',
  'Alimentation',
  'Transport',
  'Logement',
  'Santé',
  'Loisirs',
  'Vêtements',
  'Éducation',
  'Autre'
];

const incomeCategories = [
  'Ventes Produits',
  'Services/Consulting',
  'Revenus Publicitaires',
  'Affiliations',
  'Abonnements/SaaS',
  'Formations/Cours',
  'Investissements',
  'Dividendes',
  'Salaire',
  'Freelance',
  'Bonus',
  'Autre'
];

export function TransactionForm({ isOpen, onClose, onSave }: TransactionFormProps) {
  const { categories: budgetCategories } = useBudgetCategories();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    onSave({
      type,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  // Utiliser les catégories de budget pour les dépenses ET les revenus
  const budgetCategoryNames = budgetCategories.map(cat => cat.name);
  const categories = budgetCategoryNames.length > 0 ? budgetCategoryNames : incomeCategories;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle transaction</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type de transaction</label>
              <div className="transaction-type-selector">
                <button
                  type="button"
                  className={`type-button ${type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => {
                    setType('expense');
                    setCategory('');
                  }}
                >
                  Dépense
                </button>
                <button
                  type="button"
                  className={`type-button ${type === 'income' ? 'active income' : ''}`}
                  onClick={() => {
                    setType('income');
                    setCategory('');
                  }}
                >
                  Revenu
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Montant (€) *</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Catégorie *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de la transaction"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="button">
                <Plus size={16} />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
