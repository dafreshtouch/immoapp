import React, { useState } from 'react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  Copy,
  Download,
  Ruler,
  Info,
  CheckCircle
} from 'lucide-react';
import './SocialFormatsGuide.css';

interface FormatData {
  name: string;
  dimensions: string;
  safeZone?: string;
  description?: string;
  performance?: 'best' | 'good' | 'standard';
}

interface AdditionalFormatData {
  name: string;
  dimensions: string;
  description?: string;
  performance?: 'best' | 'good' | 'standard';
}

interface PlatformFormats {
  id: string;
  name: string;
  icon: any;
  color: string;
  emoji: string;
  formats: FormatData[];
  tips?: string[];
}

const platformsData: PlatformFormats[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    emoji: '📘',
    formats: [
      { name: 'Photo de profil', dimensions: '320 × 320', safeZone: '280 × 280', description: 'Zone centrale visible' },
      { name: 'Photo de couverture (page)', dimensions: '1200 × 630', safeZone: '1080 × 540', description: 'Éviter les bords' },
      { name: 'Publication carrée', dimensions: '1080 × 1080', performance: 'good' },
      { name: 'Publication horizontale', dimensions: '1200 × 630', performance: 'standard' },
      { name: 'Story', dimensions: '1080 × 1920', safeZone: '1080 × 1680', description: 'Zone de sécurité haut/bas' },
      { name: 'Vidéo Reels', dimensions: '1080 × 1920', performance: 'best' }
    ],
    tips: [
      'Privilégier le format vertical pour plus d\'engagement',
      'Texte important dans la zone de sécurité',
      'Ratio 9:16 optimal pour les Reels'
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    emoji: '📸',
    formats: [
      { name: 'Photo de profil', dimensions: '320 × 320', safeZone: '280 × 280', description: 'Cercle visible' },
      { name: 'Publication carrée', dimensions: '1080 × 1080', performance: 'good' },
      { name: 'Publication portrait', dimensions: '1080 × 1350', performance: 'best', description: 'Le plus performant en 2025 🚀' },
      { name: 'Publication paysage', dimensions: '1080 × 608', performance: 'standard' },
      { name: 'Stories & Reels', dimensions: '1080 × 1920', safeZone: '1080 × 1680', performance: 'best' }
    ],
    tips: [
      'Format portrait 4:5 recommandé pour plus de visibilité',
      'Stories : zone de sécurité 120px haut/bas',
      'Reels : contenu principal au centre'
    ]
  },
  {
    id: 'twitter',
    name: 'X (ex-Twitter)',
    icon: Twitter,
    color: '#1DA1F2',
    emoji: '🐦',
    formats: [
      { name: 'Photo de profil', dimensions: '400 × 400', safeZone: '360 × 360', description: 'Cercle de recadrage' },
      { name: 'Image dans un post', dimensions: '1200 × 675', performance: 'good' },
      { name: 'Image carrée', dimensions: '1200 × 1200', performance: 'good' },
      { name: 'Image verticale', dimensions: '1080 × 1350', performance: 'best', description: 'Mieux affichée en 2025' },
      { name: 'Bannière de profil', dimensions: '1500 × 500', safeZone: '1350 × 450', description: 'Zone centrale visible' }
    ],
    tips: [
      'Format vertical prend plus de place dans le feed',
      'Éviter le texte important sur les bords de la bannière',
      'Ratio 16:9 pour les vidéos'
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    emoji: '💼',
    formats: [
      { name: 'Photo de profil', dimensions: '400 × 400', safeZone: '360 × 360', description: 'Cercle professionnel' },
      { name: 'Photo de couverture (profil)', dimensions: '1584 × 396', safeZone: '1400 × 300', description: 'Zone centrale' },
      { name: 'Image post carrée', dimensions: '1200 × 1200', performance: 'best' },
      { name: 'Image post paysage', dimensions: '1200 × 627', performance: 'good' },
      { name: 'Bannière entreprise', dimensions: '1128 × 191', safeZone: '1000 × 150', description: 'Logo au centre' }
    ],
    tips: [
      'Format carré privilégié pour les posts',
      'Contenu professionnel et épuré',
      'Éviter les éléments décoratifs excessifs'
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    emoji: '▶️',
    formats: [
      { name: 'Photo de profil', dimensions: '800 × 800', safeZone: '720 × 720', description: 'Cercle visible' },
      { name: 'Bannière de chaîne', dimensions: '2560 × 1440', safeZone: '1546 × 423', description: 'Zone mobile visible' },
      { name: 'Miniature vidéo', dimensions: '1280 × 720', safeZone: '1200 × 680', description: 'Ratio 16:9 obligatoire' }
    ],
    tips: [
      'Miniatures : texte lisible même en petit',
      'Bannière : zone de sécurité mobile cruciale',
      'Contraste élevé pour les miniatures'
    ]
  }
];

const additionalPlatforms: { name: string; emoji: string; formats: AdditionalFormatData[] }[] = [
  {
    name: 'TikTok',
    emoji: '🎵',
    formats: [
      { name: 'Photo de profil', dimensions: '200 × 200' },
      { name: 'Vidéo / Post', dimensions: '1080 × 1920', performance: 'best' },
      { name: 'Image carrousel', dimensions: '1080 × 1920' },
      { name: 'Miniature vidéo', dimensions: '1080 × 1920' }
    ]
  },
  {
    name: 'Pinterest',
    emoji: '📌',
    formats: [
      { name: 'Photo de profil', dimensions: '240 × 240' },
      { name: 'Épingles', dimensions: '1000 × 1500', description: 'Ratio 2:3 recommandé', performance: 'best' },
      { name: 'Épingles vidéo', dimensions: '1080 × 1920' },
      { name: 'Bannière de profil', dimensions: '800 × 450' }
    ]
  }
];

export function SocialFormatsGuide() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [copiedFormat, setCopiedFormat] = useState<string>('');

  const copyToClipboard = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(''), 2000);
  };

  const currentPlatform = platformsData.find(p => p.id === selectedPlatform);

  return (
    <div className="formats-guide">
      <div className="guide-header">
        <div className="header-content">
          <Ruler size={24} />
          <div>
            <h2>Guide des formats réseaux sociaux</h2>
            <p>Dimensions optimales avec marges de sécurité pour graphistes</p>
          </div>
        </div>
      </div>

      <div className="platform-selector">
        {platformsData.map(platform => {
          const Icon = platform.icon;
          return (
            <button
              key={platform.id}
              className={`platform-tab ${selectedPlatform === platform.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(platform.id)}
              style={{ '--platform-color': platform.color } as React.CSSProperties}
            >
              <span className="platform-emoji">{platform.emoji}</span>
              <Icon size={20} />
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>

      {currentPlatform && (
        <div className="platform-details">
          <div className="platform-header">
            <div className="platform-title">
              <span className="platform-emoji-large">{currentPlatform.emoji}</span>
              <h3>{currentPlatform.name}</h3>
            </div>
          </div>

          <div className="formats-grid">
            {currentPlatform.formats.map((format, index) => (
              <div key={index} className="format-card">
                <div className="format-header">
                  <h4>{format.name}</h4>
                  {format.performance && (
                    <span className={`performance-badge ${format.performance}`}>
                      {format.performance === 'best' && '🚀 Top'}
                      {format.performance === 'good' && '👍 Bon'}
                      {format.performance === 'standard' && '📊 Standard'}
                    </span>
                  )}
                </div>
                
                <div className="dimensions-section">
                  <div className="dimension-item">
                    <span className="dimension-label">Dimensions</span>
                    <div className="dimension-value">
                      <span className="dimension-text">{format.dimensions}</span>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(format.dimensions, format.name)}
                        title="Copier les dimensions"
                      >
                        {copiedFormat === format.name ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {format.safeZone && (
                    <div className="dimension-item safe-zone">
                      <span className="dimension-label">Zone de sécurité</span>
                      <div className="dimension-value">
                        <span className="dimension-text">{format.safeZone}</span>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(format.safeZone!, `${format.name} - Zone`)}
                          title="Copier la zone de sécurité"
                        >
                          {copiedFormat === `${format.name} - Zone` ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {format.description && (
                  <div className="format-description">
                    <Info size={14} />
                    <span>{format.description}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentPlatform.tips && (
            <div className="platform-tips">
              <h4>💡 Conseils pour {currentPlatform.name}</h4>
              <ul>
                {currentPlatform.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="additional-platforms">
        <h3>Autres plateformes</h3>
        <div className="additional-grid">
          {additionalPlatforms.map((platform, index) => (
            <div key={index} className="additional-platform">
              <div className="additional-header">
                <span className="platform-emoji">{platform.emoji}</span>
                <h4>{platform.name}</h4>
              </div>
              <div className="additional-formats">
                {platform.formats.map((format, formatIndex) => (
                  <div key={formatIndex} className="additional-format">
                    <span className="format-name">{format.name}</span>
                    <div className="format-dimensions">
                      <span>{format.dimensions}</span>
                      <button
                        className="copy-btn small"
                        onClick={() => copyToClipboard(format.dimensions, `${platform.name} - ${format.name}`)}
                      >
                        {copiedFormat === `${platform.name} - ${format.name}` ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                    {format.description && (
                      <span className="format-note">{format.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="golden-rules">
        <h3>👉 Règles d'or 2025</h3>
        <div className="rules-grid">
          <div className="rule-card">
            <h4>📱 Format vertical</h4>
            <p>Toujours privilégier le <strong>1080 × 1920</strong> pour Stories, Reels, Shorts et TikToks.</p>
          </div>
          <div className="rule-card">
            <h4>⬜ Format carré</h4>
            <p>Le <strong>1080 × 1080</strong> reste une valeur sûre pour tous les réseaux.</p>
          </div>
          <div className="rule-card">
            <h4>📊 Format portrait</h4>
            <p>Le <strong>1080 × 1350</strong> sur Instagram et X donne plus de visibilité.</p>
          </div>
          <div className="rule-card">
            <h4>🛡️ Zones de sécurité</h4>
            <p>Toujours respecter les marges pour éviter les recadrages automatiques.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
