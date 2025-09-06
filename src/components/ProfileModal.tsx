import React, { useState, useEffect } from 'react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Save, 
  Camera, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import './ProfileModal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: 'David',
    lastName: 'Meynet',
    email: user?.email || '',
    phone: '',
    company: '',
    position: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile();
    }
  }, [isOpen, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileData({
          firstName: userData.firstName || 'David',
          lastName: userData.lastName || 'Meynet',
          email: user.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          position: userData.position || '',
          bio: userData.bio || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Mettre à jour le profil Firebase Auth
      await updateProfile(user, {
        displayName: `${profileData.firstName} ${profileData.lastName}`
      });

      // Mettre à jour les données dans Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        company: profileData.company,
        position: profileData.position,
        bio: profileData.bio,
        updatedAt: new Date()
      });

      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Ré-authentifier l'utilisateur
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Mettre à jour le mot de passe
      await updatePassword(user, passwordData.newPassword);

      setSuccess('Mot de passe mis à jour avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      if (error.code === 'auth/wrong-password') {
        setError('Mot de passe actuel incorrect');
      } else {
        setError('Erreur lors du changement de mot de passe');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <User size={24} />
            <h2>Gestion du profil</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Profil
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} />
            Sécurité
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

          {loading ? (
            <div className="loading-state">
              <Loader size={32} className="spinning" />
              <p>Chargement du profil...</p>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="profile-section">
                  <div className="profile-avatar">
                    <div className="avatar-placeholder">
                      <User size={48} />
                    </div>
                    <button className="avatar-upload">
                      <Camera size={16} />
                      Changer la photo
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">Prénom</label>
                      <input
                        id="firstName"
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Nom</label>
                      <input
                        id="lastName"
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Votre nom"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="disabled"
                      />
                      <span className="field-note">L'email ne peut pas être modifié</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Téléphone</label>
                      <input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="company">Entreprise</label>
                      <input
                        id="company"
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="position">Poste</label>
                      <input
                        id="position"
                        type="text"
                        value={profileData.position}
                        onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Votre poste"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="bio">Biographie</label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Parlez-nous de vous..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="security-section">
                  <h3>Changer le mot de passe</h3>
                  
                  <div className="form-group">
                    <label htmlFor="currentPassword">Mot de passe actuel</label>
                    <div className="password-input">
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Votre mot de passe actuel"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Nouveau mot de passe</label>
                    <div className="password-input">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Votre nouveau mot de passe"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <div className="password-input">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirmez votre nouveau mot de passe"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-requirements">
                    <h4>Exigences du mot de passe :</h4>
                    <ul>
                      <li>Au moins 6 caractères</li>
                      <li>Recommandé : mélange de lettres, chiffres et symboles</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          {activeTab === 'profile' ? (
            <button 
              className="save-btn"
              onClick={handleProfileSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader size={18} className="spinning" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Sauvegarder
                </>
              )}
            </button>
          ) : (
            <button 
              className="save-btn"
              onClick={handlePasswordChange}
              disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {saving ? (
                <>
                  <Loader size={18} className="spinning" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Changer le mot de passe
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
