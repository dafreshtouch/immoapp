import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { QuoteForm } from '../components/QuoteForm';
import './Quotes.css';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  projectTitle: string;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validityDays: number;
  notes: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export function Quotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Charger les devis depuis Firestore
    loadQuotes();
  }, [user]);

  const loadQuotes = async () => {
    // TODO: Implémenter le chargement depuis Firestore
    // Pour l'instant, on utilise des données de test
    const mockQuotes: Quote[] = [
      {
        id: '1',
        quoteNumber: 'DEV-2024-001',
        clientName: 'Jean Dupont',
        clientEmail: 'jean.dupont@email.com',
        clientPhone: '01 23 45 67 89',
        clientAddress: '123 Rue de la Paix, 75001 Paris',
        projectTitle: 'Rénovation appartement',
        items: [
          { description: 'Peinture salon', quantity: 1, unitPrice: 800, total: 800 },
          { description: 'Parquet chambre', quantity: 20, unitPrice: 45, total: 900 }
        ],
        subtotal: 1700,
        taxRate: 20,
        taxAmount: 340,
        total: 2040,
        validityDays: 30,
        notes: 'Devis valable 30 jours',
        status: 'draft',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
    setQuotes(mockQuotes);
  };

  const handleCreateQuote = () => {
    setEditingQuote(null);
    setIsFormOpen(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setIsFormOpen(true);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      // TODO: Supprimer de Firestore
      setQuotes(quotes.filter(q => q.id !== quoteId));
    }
  };

  const handleSaveQuote = async (quoteData: Partial<Quote>) => {
    if (editingQuote) {
      // Modification
      const updatedQuote = { ...editingQuote, ...quoteData, updatedAt: new Date() };
      setQuotes(quotes.map(q => q.id === editingQuote.id ? updatedQuote : q));
    } else {
      // Création
      const newQuote: Quote = {
        id: Date.now().toString(),
        quoteNumber: `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        ...quoteData
      } as Quote;
      setQuotes([...quotes, newQuote]);
    }
    setIsFormOpen(false);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'sent': return '#3b82f6';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

  if (!user) {
    return (
      <div className="quotes-page">
        <div className="auth-required">
          <h2>Connexion requise</h2>
          <p>Veuillez vous connecter pour accéder à la gestion des devis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quotes-page">
      <div className="quotes-header">
        <div className="header-content">
          <h1>Gestion des Devis</h1>
          <button className="create-quote-btn" onClick={handleCreateQuote}>
            <Plus size={20} />
            Nouveau Devis
          </button>
        </div>
        
        <div className="quotes-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher par client, projet ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Refusé</option>
          </select>
        </div>
      </div>

      <div className="quotes-list">
        {filteredQuotes.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>Aucun devis trouvé</h3>
            <p>Créez votre premier devis pour commencer.</p>
            <button className="create-first-quote-btn" onClick={handleCreateQuote}>
              Créer un devis
            </button>
          </div>
        ) : (
          <div className="quotes-grid">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="quote-card">
                <div className="quote-header">
                  <div className="quote-info">
                    <h3>{quote.quoteNumber}</h3>
                    <p className="client-name">{quote.clientName}</p>
                    <p className="project-title">{quote.projectTitle}</p>
                  </div>
                  <div className="quote-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(quote.status) }}
                    >
                      {getStatusLabel(quote.status)}
                    </span>
                  </div>
                </div>
                
                <div className="quote-details">
                  <div className="quote-amount">
                    <span className="amount">{quote.total.toLocaleString('fr-FR')} €</span>
                    <span className="tax-info">TTC</span>
                  </div>
                  <div className="quote-date">
                    Créé le {quote.createdAt.toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="quote-actions">
                  <button 
                    className="action-btn view-btn"
                    title="Voir"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditQuote(quote)}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn download-btn"
                    title="Télécharger PDF"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteQuote(quote.id)}
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

      {isFormOpen && (
        <QuoteForm
          quote={editingQuote}
          onSave={handleSaveQuote}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
