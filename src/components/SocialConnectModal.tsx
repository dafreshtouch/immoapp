import React, { useState } from 'react';
import { addDoc, collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { X, Instagram, Facebook, Twitter, Linkedin, Youtube, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import './SocialConnectModal.css';

interface SocialConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: {
    id: string;
    name: string;
    icon: any;
    color: string;
  } | null;
  existingAccount?: {
    id: string;
    username: string;
    followers: number;
    isConnected: boolean;
  } | null;
  onAccountUpdated: () => void;
}

export function SocialConnectModal({ 
  isOpen, 
  onClose, 
  platform, 
  existingAccount, 
  onAccountUpdated 
}: SocialConnectModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: existingAccount?.username || '',
    accessToken: '',
    refreshToken: ''
  });

  if (!isOpen || !platform) return null;

  const handleConnect = async () => {
    if (!user || !formData.username.trim()) {
      setError('Veuillez renseigner le nom d\'utilisateur');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulation de l'authentification OAuth
      // En production, ceci serait remplacé par les vraies APIs OAuth
      const mockFollowers = Math.floor(Math.random() * 10000) + 100;
      
      const accountData = {
        userId: user.uid,
        platform: platform.id,
        username: formData.username,
        followers: mockFollowers,
        isConnected: true,
        accessToken: formData.accessToken || 'mock_access_token',
        refreshToken: formData.refreshToken || 'mock_refresh_token',
        connectedAt: new Date(),
        lastSync: new Date()
      };

      if (existingAccount) {
        // Mettre à jour le compte existant
        await updateDoc(doc(db, 'socialAccounts', existingAccount.id), accountData);
        setSuccess(`Compte ${platform.name} mis à jour avec succès !`);
      } else {
        // Créer un nouveau compte
        await addDoc(collection(db, 'socialAccounts'), accountData);
        setSuccess(`Compte ${platform.name} connecté avec succès !`);
      }

      setTimeout(() => {
        onAccountUpdated();
        onClose();
        setSuccess('');
        setFormData({ username: '', accessToken: '', refreshToken: '' });
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingAccount) return;

    setLoading(true);
    setError('');

    try {
      await deleteDoc(doc(db, 'socialAccounts', existingAccount.id));
      setSuccess(`Compte ${platform.name} déconnecté avec succès !`);
      
      setTimeout(() => {
        onAccountUpdated();
        onClose();
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setError('Erreur lors de la déconnexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    // Simulation de la redirection OAuth
    // En production, ceci redirigerait vers l'URL OAuth de la plateforme
    setError('');
    setLoading(true);
    
    // Simuler un délai d'authentification
    setTimeout(() => {
      const mockUsername = `user_${Math.random().toString(36).substr(2, 8)}`;
      setFormData(prev => ({
        ...prev,
        username: mockUsername,
        accessToken: 'oauth_access_token_' + Date.now(),
        refreshToken: 'oauth_refresh_token_' + Date.now()
      }));
      setLoading(false);
      setSuccess('Authentification OAuth réussie ! Vous pouvez maintenant connecter le compte.');
    }, 2000);
  };

  const Icon = platform.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="social-connect-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="platform-info">
            <Icon size={32} style={{ color: platform.color }} />
            <div>
              <h2>
                {existingAccount ? 'Gérer' : 'Connecter'} {platform.name}
              </h2>
              <p>
                {existingAccount 
                  ? 'Modifiez ou déconnectez votre compte'
                  : `Connectez votre compte ${platform.name} pour commencer à publier`
                }
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="alert error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert success">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {existingAccount && (
            <div className="current-account">
              <h3>Compte actuel</h3>
              <div className="account-details">
                <p><strong>@{existingAccount.username}</strong></p>
                <p>{existingAccount.followers.toLocaleString()} abonnés</p>
                <span className="status connected">Connecté</span>
              </div>
            </div>
          )}

          <div className="connect-methods">
            <div className="oauth-section">
              <h3>Connexion OAuth (Recommandée)</h3>
              <p>Connectez-vous de manière sécurisée via {platform.name}</p>
              <button 
                className="oauth-btn"
                onClick={handleOAuthConnect}
                disabled={loading}
                style={{ backgroundColor: platform.color }}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="spinning" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Icon size={20} />
                    Se connecter avec {platform.name}
                  </>
                )}
              </button>
            </div>

            <div className="divider">
              <span>ou</span>
            </div>

            <div className="manual-section">
              <h3>Connexion manuelle</h3>
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder={`Votre nom d'utilisateur ${platform.name}`}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="accessToken">Token d'accès (optionnel)</label>
                <input
                  id="accessToken"
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="Token d'accès API"
                  disabled={loading}
                />
              </div>

              <div className="api-info">
                <p>
                  <strong>Note :</strong> Pour une intégration complète, vous devrez obtenir 
                  un token d'accès depuis les paramètres développeur de {platform.name}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {existingAccount ? (
            <>
              <button 
                className="disconnect-btn"
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="spinning" />
                    Déconnexion...
                  </>
                ) : (
                  'Déconnecter'
                )}
              </button>
              <button 
                className="update-btn"
                onClick={handleConnect}
                disabled={loading || !formData.username.trim()}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="spinning" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </>
          ) : (
            <>
              <button className="cancel-btn" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button 
                className="connect-btn"
                onClick={handleConnect}
                disabled={loading || !formData.username.trim()}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="spinning" />
                    Connexion...
                  </>
                ) : (
                  'Connecter'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
