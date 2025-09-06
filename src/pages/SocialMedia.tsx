import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Plus, 
  Calendar,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Ruler
} from 'lucide-react';
import { SocialConnectModal } from '../components/SocialConnectModal';
import { SocialFormatsGuide } from '../components/SocialFormatsGuide';
import './SocialMedia.css';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube';
  content: string;
  scheduledDate?: Date;
  publishedDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube';
  username: string;
  followers: number;
  isConnected: boolean;
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' }
];

export function SocialMedia() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'analytics' | 'accounts' | 'formats'>('overview');
  const [loading, setLoading] = useState(true);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platforms[0] | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Charger les posts
      const postsQuery = query(
        collection(db, 'socialPosts'),
        where('userId', '==', user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData: SocialPost[] = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        publishedDate: doc.data().publishedDate?.toDate()
      })) as SocialPost[];

      // Charger les comptes
      const accountsQuery = query(
        collection(db, 'socialAccounts'),
        where('userId', '==', user.uid)
      );
      const accountsSnapshot = await getDocs(accountsQuery);
      const accountsData: SocialAccount[] = accountsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SocialAccount[];

      setPosts(postsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données sociales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalMetrics = () => {
    const totalFollowers = accounts.reduce((sum, account) => sum + account.followers, 0);
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.status === 'published');
    const totalEngagement = publishedPosts.reduce((sum, post) => {
      const metrics = post.metrics || {};
      return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
    }, 0);

    return { totalFollowers, totalPosts, totalEngagement };
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData ? platformData.icon : Share2;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData ? platformData.color : '#666';
  };

  const handleConnectClick = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    const account = accounts.find(acc => acc.platform === platformId);
    
    setSelectedPlatform(platform || null);
    setSelectedAccount(account || null);
    setConnectModalOpen(true);
  };

  const handleAccountUpdated = () => {
    loadData(); // Recharger les données après mise à jour
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette connexion ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'socialAccounts', accountId));
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la connexion');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Réseaux Sociaux</h1>
        <div className="loading">Chargement des données sociales...</div>
      </div>
    );
  }

  const metrics = getTotalMetrics();

  return (
    <div className="page-container">
      <h1 className="page-title">Réseaux Sociaux</h1>
      
      <div className="social-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Vue d'ensemble
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <Share2 size={18} />
          Publications
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={18} />
          Analytiques
        </button>
        <button
          className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <Users size={18} />
          Comptes
        </button>
        <button
          className={`tab-btn ${activeTab === 'formats' ? 'active' : ''}`}
          onClick={() => setActiveTab('formats')}
        >
          <Ruler size={18} />
          Formats
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-value">{metrics.totalFollowers.toLocaleString()}</span>
                <span className="metric-label">Abonnés total</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <Share2 size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-value">{metrics.totalPosts}</span>
                <span className="metric-label">Publications</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <Heart size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-value">{metrics.totalEngagement.toLocaleString()}</span>
                <span className="metric-label">Engagement total</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <Calendar size={24} />
              </div>
              <div className="metric-content">
                <span className="metric-value">{posts.filter(p => p.status === 'scheduled').length}</span>
                <span className="metric-label">Posts programmés</span>
              </div>
            </div>
          </div>

          <div className="platforms-overview">
            <h3>Comptes connectés</h3>
            <div className="platforms-grid">
              {platforms.map(platform => {
                const account = accounts.find(acc => acc.platform === platform.id);
                const Icon = platform.icon;
                
                return (
                  <div key={platform.id} className="platform-card">
                    <div className="platform-header">
                      <Icon size={24} style={{ color: platform.color }} />
                      <span className="platform-name">{platform.name}</span>
                    </div>
                    {account ? (
                      <div className="platform-stats">
                        <span className="username">@{account.username}</span>
                        <span className="followers">{account.followers.toLocaleString()} abonnés</span>
                        <button 
                          className="disconnect-btn-small"
                          onClick={() => handleDisconnectAccount(account.id)}
                          title="Supprimer la connexion"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="platform-disconnected">
                        <span>Non connecté</span>
                        <button 
                          className="connect-btn"
                          onClick={() => handleConnectClick(platform.id)}
                        >
                          Connecter
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="posts-section">
          <div className="posts-header">
            <h3>Gestion des publications</h3>
            <button className="create-post-btn">
              <Plus size={20} />
              Nouvelle publication
            </button>
          </div>
          
          {posts.length === 0 ? (
            <div className="empty-state">
              <Share2 size={64} />
              <h3>Aucune publication</h3>
              <p>Commencez par créer votre première publication sur les réseaux sociaux.</p>
              <button className="create-post-btn">
                <Plus size={20} />
                Créer une publication
              </button>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => {
                const Icon = getPlatformIcon(post.platform);
                const color = getPlatformColor(post.platform);
                
                return (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-platform">
                        <Icon size={18} style={{ color }} />
                        <span>{platforms.find(p => p.id === post.platform)?.name}</span>
                      </div>
                      <span className={`post-status ${post.status}`}>
                        {post.status === 'draft' && 'Brouillon'}
                        {post.status === 'scheduled' && 'Programmé'}
                        {post.status === 'published' && 'Publié'}
                      </span>
                    </div>
                    
                    <div className="post-content">
                      <p>{post.content}</p>
                    </div>
                    
                    {post.metrics && (
                      <div className="post-metrics">
                        <div className="metric">
                          <Eye size={14} />
                          <span>{post.metrics.views || 0}</span>
                        </div>
                        <div className="metric">
                          <Heart size={14} />
                          <span>{post.metrics.likes || 0}</span>
                        </div>
                        <div className="metric">
                          <MessageCircle size={14} />
                          <span>{post.metrics.comments || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h3>Analytiques des réseaux sociaux</h3>
          <div className="analytics-placeholder">
            <TrendingUp size={64} />
            <h4>Analytiques détaillées</h4>
            <p>Les graphiques et analyses détaillées de vos performances sur les réseaux sociaux apparaîtront ici.</p>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="accounts-section">
          <h3>Gestion des comptes</h3>
          <div className="accounts-grid">
            {platforms.map(platform => {
              const account = accounts.find(acc => acc.platform === platform.id);
              const Icon = platform.icon;
              
              return (
                <div key={platform.id} className="account-card">
                  <div className="account-header">
                    <Icon size={32} style={{ color: platform.color }} />
                    <div className="account-info">
                      <h4>{platform.name}</h4>
                      {account ? (
                        <span className="connected">Connecté</span>
                      ) : (
                        <span className="disconnected">Non connecté</span>
                      )}
                    </div>
                  </div>
                  
                  {account ? (
                    <div className="account-details">
                      <p><strong>@{account.username}</strong></p>
                      <p>{account.followers.toLocaleString()} abonnés</p>
                      <button 
                        className="disconnect-btn"
                        onClick={() => handleConnectClick(platform.id)}
                      >
                        Gérer
                      </button>
                    </div>
                  ) : (
                    <div className="account-connect">
                      <p>Connectez votre compte {platform.name} pour commencer à publier.</p>
                      <button 
                        className="connect-btn"
                        onClick={() => handleConnectClick(platform.id)}
                      >
                        Connecter
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'formats' && (
        <div className="formats-section">
          <SocialFormatsGuide />
        </div>
      )}

      <SocialConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        platform={selectedPlatform}
        existingAccount={selectedAccount}
        onAccountUpdated={handleAccountUpdated}
      />
    </div>
  );
}
