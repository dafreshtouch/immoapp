import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Filter, Upload, Image, Video, FileText, Home, Palette, Play, X, Check, Eye } from 'lucide-react';
import { ImageViewer } from '../components/ImageViewer';
import './Media.css';

interface MediaItem {
  id: string;
  name: string;
  type: 'Architecture' | 'Design' | 'Motion' | 'Photos' | 'Plans' | 'Home staging';
  url: string;
  fileType: 'image' | 'video' | 'document';
  uploadDate: Date;
  description?: string;
  size?: number;
}

interface PendingFile {
  file: File;
  preview: string;
  type: 'Architecture' | 'Design' | 'Motion' | 'Photos' | 'Plans' | 'Home staging';
}

const mediaTypes = [
  { id: 'all', label: 'Tous', icon: Filter },
  { id: 'Architecture', label: 'Architecture', icon: Home },
  { id: 'Design', label: 'Design', icon: Palette },
  { id: 'Motion', label: 'Motion', icon: Play },
  { id: 'Photos', label: 'Photos', icon: Image },
  { id: 'Plans', label: 'Plans', icon: FileText },
  { id: 'Home staging', label: 'Home staging', icon: Home }
];

export function Media() {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadMediaItems();
  }, [user]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(mediaItems);
    } else {
      setFilteredItems(mediaItems.filter(item => item.type === activeFilter));
    }
  }, [mediaItems, activeFilter]);

  const loadMediaItems = async () => {
    if (!user) return;

    try {
      // Charger les métadonnées depuis Firestore
      const mediaQuery = query(
        collection(db, 'media'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(mediaQuery);
      const firestoreItems: MediaItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate() || new Date()
      })) as MediaItem[];

      // Pour l'instant, utiliser seulement Firestore jusqu'à ce que les règles Storage soient déployées
      setMediaItems(firestoreItems);
      
      // TODO: Réactiver après déploiement des règles Storage
      /*
      const storageRef = ref(storage, `media/${user.uid}`);
      try {
        const storageList = await listAll(storageRef);
        const storageItems: MediaItem[] = [];

        for (const itemRef of storageList.items) {
          const existsInFirestore = firestoreItems.some(item => 
            item.url && item.url.includes(itemRef.name)
          );

          if (!existsInFirestore) {
            const downloadURL = await getDownloadURL(itemRef);
            
            const storageItem: MediaItem = {
              id: itemRef.name,
              name: itemRef.name.replace(/^\d+_/, ''), 
              type: 'Photos',
              url: downloadURL,
              fileType: getFileTypeFromName(itemRef.name),
              uploadDate: new Date(),
              description: 'Fichier récupéré depuis Storage'
            };

            storageItems.push(storageItem);
          }
        }

        setMediaItems([...firestoreItems, ...storageItems]);
      } catch (storageError) {
        console.log('Règles Storage non déployées:', storageError);
        setMediaItems(firestoreItems);
      }
      */
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeFromName = (fileName: string): 'image' | 'video' | 'document' => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) return 'video';
    return 'document';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return Video;
      case 'document':
        return FileText;
      default:
        return Image;
    }
  };

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    // Créer les aperçus des fichiers
    const pendingFilesArray: PendingFile[] = [];
    
    for (const file of Array.from(files)) {
      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file)
        : '';
      
      pendingFilesArray.push({
        file,
        preview,
        type: 'Photos' // Type par défaut
      });
    }

    setPendingFiles(pendingFilesArray);
    setShowUploadModal(true);

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmUpload = async () => {
    if (!user || pendingFiles.length === 0) return;

    setUploading(true);
    setShowUploadModal(false);

    const uploadPromises = pendingFiles.map(async (pendingFile) => {
      try {
        // Créer une référence unique pour le fichier
        const fileName = `${Date.now()}_${pendingFile.file.name}`;
        const storageRef = ref(storage, `media/${user.uid}/${fileName}`);
        
        // Upload du fichier
        const snapshot = await uploadBytes(storageRef, pendingFile.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Sauvegarder les métadonnées dans Firestore
        const mediaData = {
          name: pendingFile.file.name,
          type: pendingFile.type,
          url: downloadURL,
          fileType: getFileType(pendingFile.file),
          userId: user.uid,
          uploadDate: serverTimestamp(),
          size: pendingFile.file.size,
          fileName: fileName
        };

        await addDoc(collection(db, 'media'), mediaData);
        
        return {
          id: fileName,
          ...mediaData,
          uploadDate: new Date()
        };
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        throw error;
      }
    });

    try {
      await Promise.all(uploadPromises);
      await loadMediaItems(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'upload des fichiers:', error);
    } finally {
      setUploading(false);
      setPendingFiles([]);
      // Nettoyer les URLs d'aperçu
      pendingFiles.forEach(pf => {
        if (pf.preview) URL.revokeObjectURL(pf.preview);
      });
    }
  };

  const cancelUpload = () => {
    // Nettoyer les URLs d'aperçu
    pendingFiles.forEach(pf => {
      if (pf.preview) URL.revokeObjectURL(pf.preview);
    });
    setPendingFiles([]);
    setShowUploadModal(false);
  };

  const updatePendingFileType = (index: number, newType: 'Architecture' | 'Design' | 'Motion' | 'Photos' | 'Plans' | 'Home staging') => {
    setPendingFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, type: newType } : file
    ));
  };

  // Fonctions pour la visionneuse d'images
  const openImageViewer = (index: number) => {
    const imageItems = filteredItems.filter(item => item.fileType === 'image');
    const imageIndex = imageItems.findIndex(item => item.id === filteredItems[index].id);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
      setShowImageViewer(true);
    }
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  const navigateImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Obtenir seulement les images pour la visionneuse
  const imageItems = filteredItems.filter(item => item.fileType === 'image');

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Média</h1>
        <div className="loading">Chargement de la galerie...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Média</h1>
      
      <div className="media-header">
        <div className="media-stats">
          <div className="stat">
            <span className="stat-value">{mediaItems.length}</span>
            <span className="stat-label">Fichiers total</span>
          </div>
          <div className="stat">
            <span className="stat-value">{filteredItems.length}</span>
            <span className="stat-label">Affichés</span>
          </div>
        </div>
        
        <button 
          className="upload-btn" 
          onClick={handleFileSelect}
          disabled={uploading}
        >
          <Upload size={20} />
          {uploading ? 'Upload en cours...' : 'Ajouter des médias'}
        </button>
      </div>

      <div className="media-filters">
        {mediaTypes.map(type => {
          const Icon = type.icon;
          const count = type.id === 'all' 
            ? mediaItems.length 
            : mediaItems.filter(item => item.type === type.id).length;
          
          return (
            <button
              key={type.id}
              className={`filter-btn ${activeFilter === type.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(type.id)}
            >
              <Icon size={18} />
              <span>{type.label}</span>
              <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="media-gallery">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Image size={64} />
            </div>
            <h3>Aucun média trouvé</h3>
            <p>
              {activeFilter === 'all' 
                ? 'Commencez par ajouter vos premiers médias à la galerie.'
                : `Aucun média de type "${activeFilter}" trouvé.`
              }
            </p>
            <button 
              className="upload-btn"
              onClick={handleFileSelect}
              disabled={uploading}
            >
              <Upload size={20} />
              {uploading ? 'Upload en cours...' : 'Ajouter des médias'}
            </button>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredItems.map((item, index) => {
              const FileIcon = getFileIcon(item.fileType);
              
              return (
                <div key={item.id} className="media-card">
                  <div 
                    className="media-preview"
                    onClick={() => item.fileType === 'image' ? openImageViewer(index) : undefined}
                    style={{ cursor: item.fileType === 'image' ? 'pointer' : 'default' }}
                  >
                    {item.fileType === 'image' ? (
                      <>
                        <img src={item.url} alt={item.name} />
                        <div className="image-overlay-icon">
                          <Eye size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="file-placeholder">
                        <FileIcon size={32} />
                      </div>
                    )}
                    <div className="media-overlay">
                      <span className="media-type">{item.type}</span>
                    </div>
                  </div>
                  
                  <div className="media-info">
                    <h4 className="media-name">{item.name}</h4>
                    {item.description && (
                      <p className="media-description">{item.description}</p>
                    )}
                    <div className="media-meta">
                      <span className="upload-date">
                        {item.uploadDate.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visionneuse d'images */}
      {showImageViewer && imageItems.length > 0 && (
        <ImageViewer
          images={imageItems}
          currentIndex={currentImageIndex}
          isOpen={showImageViewer}
          onClose={closeImageViewer}
          onNavigate={navigateImage}
        />
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Modal de confirmation d'upload */}
      {showUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h3>Confirmer l'import de {pendingFiles.length} fichier(s)</h3>
              <button className="close-btn" onClick={cancelUpload}>
                <X size={20} />
              </button>
            </div>
            
            <div className="upload-modal-content">
              {pendingFiles.map((pendingFile, index) => (
                <div key={index} className="pending-file-item">
                  <div className="file-preview">
                    {pendingFile.preview ? (
                      <img src={pendingFile.preview} alt={pendingFile.file.name} />
                    ) : (
                      <div className="file-placeholder">
                        {React.createElement(getFileIcon(getFileType(pendingFile.file)), { size: 32 })}
                      </div>
                    )}
                  </div>
                  
                  <div className="file-info">
                    <h4>{pendingFile.file.name}</h4>
                    <p>{(pendingFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    
                    <div className="file-type-selector">
                      <label>Type:</label>
                      <select 
                        value={pendingFile.type} 
                        onChange={(e) => updatePendingFileType(index, e.target.value as any)}
                      >
                        <option value="Architecture">Architecture</option>
                        <option value="Design">Design</option>
                        <option value="Motion">Motion</option>
                        <option value="Photos">Photos</option>
                        <option value="Plans">Plans</option>
                        <option value="Home staging">Home staging</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="upload-modal-actions">
              <button className="cancel-btn" onClick={cancelUpload}>
                <X size={18} />
                Annuler
              </button>
              <button className="confirm-btn" onClick={confirmUpload}>
                <Check size={18} />
                Confirmer l'import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
