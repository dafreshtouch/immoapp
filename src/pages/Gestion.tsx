import React, { useState, useEffect } from 'react';
import './Gestion.css';
import { useAuth } from '../hooks/useAuth';
import { useAgendaTasks, AgendaTask } from '../hooks/useAgendaTasks';
import { Plus, Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'maintenance' | 'vacant';
  apartments: number;
  lastInspection: string;
}

interface Task {
  id: string;
  title: string;
  type: 'visit' | 'meeting' | 'maintenance' | 'administrative';
  date: string;
  time: string;
  property?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'report' | 'meeting_minutes';
  uploadDate: string;
  size: string;
  property?: string;
}

interface Provider {
  id: string;
  name: string;
  type: 'contractor' | 'architect' | 'cleaning' | 'security' | 'maintenance';
  contact: string;
  email: string;
  phone: string;
  rating: number;
  activeProjects: number;
}

const Gestion: React.FC = () => {
  const { user } = useAuth();
  const { tasks: agendaTasks, addTask, updateTask, deleteTask, completeTask, loading, error } = useAgendaTasks();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<AgendaTask | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: AgendaTask['type'];
    priority: AgendaTask['priority'];
    dueDate: string;
    dueTime: string;
    location: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    notes: string;
    estimatedDuration: number;
  }>({
    title: '',
    description: '',
    type: 'visit',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    location: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
    estimatedDuration: 60,
  });

  // Mock data initialization
  useEffect(() => {
    setProperties([
      {
        id: '1',
        name: 'Résidence Les Jardins',
        address: '15 Rue de la Paix, 75001 Paris',
        status: 'active',
        apartments: 24,
        lastInspection: '2024-01-15'
      },
      {
        id: '2',
        name: 'Immeuble Haussmann',
        address: '42 Boulevard Saint-Germain, 75005 Paris',
        status: 'maintenance',
        apartments: 18,
        lastInspection: '2024-01-10'
      }
    ]);

    setTasks([
      {
        id: '1',
        title: 'Visite appartement 3A',
        type: 'visit',
        date: '2024-01-25',
        time: '14:00',
        property: 'Résidence Les Jardins',
        status: 'pending'
      },
      {
        id: '2',
        title: 'AG Copropriété',
        type: 'meeting',
        date: '2024-01-28',
        time: '18:00',
        property: 'Immeuble Haussmann',
        status: 'pending'
      }
    ]);

    setMessages([
      {
        id: '1',
        from: 'M. Dupont',
        to: 'Gestionnaire',
        subject: 'Problème chauffage apt 2B',
        content: 'Le chauffage ne fonctionne plus depuis hier...',
        date: '2024-01-20',
        read: false,
        priority: 'high'
      }
    ]);

    setDocuments([
      {
        id: '1',
        name: 'Contrat_Location_3A.pdf',
        type: 'contract',
        uploadDate: '2024-01-15',
        size: '2.3 MB',
        property: 'Résidence Les Jardins'
      }
    ]);

    setProviders([
      {
        id: '1',
        name: 'Entreprise Martin',
        type: 'contractor',
        contact: 'Jean Martin',
        email: 'contact@martin-btp.fr',
        phone: '01 23 45 67 89',
        rating: 4.5,
        activeProjects: 2
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'maintenance': return '#ffc107';
      case 'vacant': return '#dc3545';
      case 'pending': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Propriétés</h3>
          <div className="stat-number">{properties.length}</div>
          <div className="stat-detail">
            {properties.filter(p => p.status === 'active').length} actives
          </div>
        </div>
        <div className="stat-card">
          <h3>Tâches en cours</h3>
          <div className="stat-number">{tasks.filter(t => t.status === 'pending').length}</div>
          <div className="stat-detail">À traiter aujourd'hui</div>
        </div>
        <div className="stat-card">
          <h3>Messages non lus</h3>
          <div className="stat-number">{messages.filter(m => !m.read).length}</div>
          <div className="stat-detail">Nouveaux messages</div>
        </div>
        <div className="stat-card">
          <h3>Prestataires actifs</h3>
          <div className="stat-number">{providers.filter(p => p.activeProjects > 0).length}</div>
          <div className="stat-detail">En mission</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>État des propriétés</h3>
          <div className="properties-list">
            {properties.map(property => (
              <div key={property.id} className="property-item">
                <div className="property-info">
                  <h4>{property.name}</h4>
                  <p>{property.address}</p>
                  <span className="apartment-count">{property.apartments} appartements</span>
                </div>
                <div className="property-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(property.status) }}
                  >
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Tâches urgentes</h3>
          <div className="tasks-list">
            {tasks.filter(t => t.status === 'pending').slice(0, 5).map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.date} à {task.time}</p>
                  {task.property && <span className="task-property">{task.property}</span>}
                </div>
                <div className="task-type">
                  <span className={`type-badge ${task.type}`}>
                    {task.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Update form data when editing task changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        type: editingTask.type || 'visit',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : '',
        dueTime: editingTask.dueTime || '',
        location: editingTask.location || '',
        clientName: editingTask.clientName || '',
        clientPhone: editingTask.clientPhone || '',
        clientEmail: editingTask.clientEmail || '',
        notes: editingTask.notes || '',
        estimatedDuration: editingTask.estimatedDuration || 60,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'visit',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        location: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        notes: '',
        estimatedDuration: 60,
      });
    }
  }, [editingTask]);

  const renderTaskModal = () => {

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        console.log('Gestion: Submitting task with data:', formData);
        
        const taskData = {
          ...formData,
          dueDate: new Date(formData.dueDate),
          status: 'pending' as const,
          isRecurring: false,
        };

        console.log('Gestion: Processed task data:', taskData);

        if (editingTask) {
          console.log('Gestion: Updating existing task:', editingTask.id);
          await updateTask(editingTask.id, taskData);
        } else {
          console.log('Gestion: Creating new task');
          await addTask(taskData);
        }

        console.log('Gestion: Task saved successfully');
        setShowTaskModal(false);
        setEditingTask(null);
      } catch (err) {
        console.error('Gestion: Erreur lors de la sauvegarde:', err);
        alert(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
            <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label>Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="visit">Visite</option>
                  <option value="meeting">Réunion</option>
                  <option value="inspection">Inspection</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="call">Appel</option>
                  <option value="document">Document</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Heure</label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Durée (min)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value)})}
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Lieu</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Adresse du rendez-vous"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="Détails de la tâche..."
              />
            </div>

            <div className="client-section">
              <h4>Informations client (optionnel)</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du client</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                placeholder="Notes supplémentaires..."
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowTaskModal(false)}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={!formData.title || !formData.dueDate}>
                {editingTask ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAgenda = () => (
    <div className="agenda-content">
      <div className="agenda-header">
        <h3>Planning centralisé</h3>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
        >
          <Plus size={16} />
          Ajouter une tâche
        </button>
      </div>
      
      <div className="agenda-filters">
        <select>
          <option value="all">Tous les types</option>
          <option value="visit">Visites</option>
          <option value="meeting">Réunions</option>
          <option value="inspection">Inspections</option>
          <option value="maintenance">Maintenance</option>
          <option value="call">Appels</option>
          <option value="document">Documents</option>
          <option value="other">Autre</option>
        </select>
        <input type="date" />
      </div>

      {loading && <div className="loading">Chargement des tâches...</div>}
      {error && <div className="error">{error}</div>}

      <div className="agenda-grid">
        {agendaTasks.map(task => (
          <div key={task.id} className="agenda-item">
            <div className="agenda-time">
              <div className="date-info">
                <Calendar size={16} />
                <span className="date">{task.dueDate.toLocaleDateString('fr-FR')}</span>
              </div>
              {task.dueTime && (
                <div className="time-info">
                  <Clock size={16} />
                  <span className="time">{task.dueTime}</span>
                </div>
              )}
            </div>
            
            <div className="agenda-details">
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className={`type-badge ${task.type}`}>
                  {task.type}
                </span>
              </div>
              
              {task.description && <p className="description">{task.description}</p>}
              
              {task.location && (
                <div className="location-info">
                  <MapPin size={14} />
                  <span>{task.location}</span>
                </div>
              )}
              
              {task.clientName && (
                <div className="client-info">
                  <User size={14} />
                  <span>{task.clientName}</span>
                  {task.clientPhone && (
                    <>
                      <Phone size={12} />
                      <span>{task.clientPhone}</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="task-meta">
                <span 
                  className={`status-badge ${task.status}`}
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status}
                </span>
                <span 
                  className={`priority-badge ${task.priority}`}
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
                {task.estimatedDuration && (
                  <span className="duration">{task.estimatedDuration}min</span>
                )}
              </div>
            </div>
            
            <div className="agenda-actions">
              <button 
                className="btn-edit"
                onClick={() => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
              >
                Modifier
              </button>
              {task.status !== 'completed' && (
                <button 
                  className="btn-complete"
                  onClick={() => completeTask(task.id)}
                >
                  Terminer
                </button>
              )}
              <button 
                className="btn-delete"
                onClick={() => {
                  if (confirm('Supprimer cette tâche ?')) {
                    deleteTask(task.id);
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        
        {agendaTasks.length === 0 && !loading && (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>Aucune tâche planifiée</h3>
            <p>Commencez par ajouter votre première tâche</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setEditingTask(null);
                setShowTaskModal(true);
              }}
            >
              <Plus size={16} />
              Créer une tâche
            </button>
          </div>
        )}
      </div>
      
      {showTaskModal && renderTaskModal()}
    </div>
  );

  const renderMessages = () => (
    <div className="messages-content">
      <div className="messages-header">
        <h3>Messagerie interne</h3>
        <button className="btn-primary">Nouveau message</button>
      </div>

      <div className="messages-filters">
        <select>
          <option value="all">Tous les messages</option>
          <option value="unread">Non lus</option>
          <option value="high">Priorité haute</option>
        </select>
      </div>

      <div className="messages-list">
        {messages.map(message => (
          <div key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`}>
            <div className="message-header">
              <div className="message-from">
                <strong>{message.from}</strong>
                <span className="message-date">{new Date(message.date).toLocaleDateString()}</span>
              </div>
              <div className="message-priority">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(message.priority) }}
                >
                  {message.priority}
                </span>
              </div>
            </div>
            <div className="message-subject">
              <h4>{message.subject}</h4>
            </div>
            <div className="message-preview">
              <p>{message.content.substring(0, 100)}...</p>
            </div>
            <div className="message-actions">
              <button className="btn-reply">Répondre</button>
              <button className="btn-archive">Archiver</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="documents-content">
      <div className="documents-header">
        <h3>Documents centralisés</h3>
        <button className="btn-primary">Télécharger un document</button>
      </div>

      <div className="documents-filters">
        <select>
          <option value="all">Tous les types</option>
          <option value="contract">Contrats</option>
          <option value="invoice">Factures</option>
          <option value="report">Rapports</option>
          <option value="meeting_minutes">PV de réunion</option>
        </select>
        <select>
          <option value="all">Toutes les propriétés</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>{property.name}</option>
          ))}
        </select>
      </div>

      <div className="documents-grid">
        {documents.map(document => (
          <div key={document.id} className="document-item">
            <div className="document-icon">
              📄
            </div>
            <div className="document-info">
              <h4>{document.name}</h4>
              <p>Type: {document.type}</p>
              <p>Taille: {document.size}</p>
              <p>Ajouté le: {new Date(document.uploadDate).toLocaleDateString()}</p>
              {document.property && <p>Propriété: {document.property}</p>}
            </div>
            <div className="document-actions">
              <button className="btn-download">Télécharger</button>
              <button className="btn-share">Partager</button>
              <button className="btn-delete">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProviders = () => (
    <div className="providers-content">
      <div className="providers-header">
        <h3>Gestion des prestataires</h3>
        <button className="btn-primary">Ajouter un prestataire</button>
      </div>

      <div className="providers-filters">
        <select>
          <option value="all">Tous les types</option>
          <option value="contractor">Entrepreneurs</option>
          <option value="architect">Architectes</option>
          <option value="cleaning">Nettoyage</option>
          <option value="security">Gardiennage</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="providers-grid">
        {providers.map(provider => (
          <div key={provider.id} className="provider-item">
            <div className="provider-header">
              <h4>{provider.name}</h4>
              <span className={`type-badge ${provider.type}`}>
                {provider.type}
              </span>
            </div>
            <div className="provider-info">
              <p><strong>Contact:</strong> {provider.contact}</p>
              <p><strong>Email:</strong> {provider.email}</p>
              <p><strong>Téléphone:</strong> {provider.phone}</p>
              <div className="provider-rating">
                <span>Note: {provider.rating}/5 ⭐</span>
              </div>
              <div className="provider-projects">
                <span>{provider.activeProjects} projets actifs</span>
              </div>
            </div>
            <div className="provider-actions">
              <button className="btn-contact">Contacter</button>
              <button className="btn-edit">Modifier</button>
              <button className="btn-history">Historique</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="gestion-page">
      <div className="page-header">
        <h1>Gestion</h1>
        <p>Gestion interne & communication quotidienne</p>
      </div>

      <div className="gestion-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Tableau de bord
        </button>
        <button 
          className={`tab-button ${activeTab === 'agenda' ? 'active' : ''}`}
          onClick={() => setActiveTab('agenda')}
        >
          Agenda
        </button>
        <button 
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messagerie
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button 
          className={`tab-button ${activeTab === 'providers' ? 'active' : ''}`}
          onClick={() => setActiveTab('providers')}
        >
          Prestataires
        </button>
      </div>

      <div className="gestion-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'agenda' && renderAgenda()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'providers' && renderProviders()}
      </div>
    </div>
  );
};

export default Gestion;
