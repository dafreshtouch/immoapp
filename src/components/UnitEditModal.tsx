import React, { useState, useEffect } from 'react';
import { X, Home, Building, MapPin, Ruler, Bed, Bath, Calendar, FileText, Shield, Wrench, DollarSign, Zap, Wifi, Car, TreePine, Waves, Dumbbell, ShoppingCart, Camera, Users, FileCheck, Euro, Save } from 'lucide-react';
import { useUnits, Unit } from '../hooks/useUnits';
import './UnitEditModal.css';

interface UnitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit;
  onSave: (updatedUnit: Unit) => void;
}

export function UnitEditModal({ isOpen, onClose, unit, onSave }: UnitEditModalProps) {
  const { updateUnit } = useUnits();
  const [formData, setFormData] = useState({
    // Informations de base
    name: '',
    type: 'apartment',
    destination: 'habitation',
    fullAddress: '',
    country: '',
    surface: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    availability: 'available',
    condition: 'good',
    constructionYear: '',
    renovationYear: '',
    description: '',
    
    // Informations légales
    propertyTitle: '',
    energyCertificate: '',
    energyClass: 'not_specified',
    ghgEmissions: 'not_specified',
    urbanisticInfo: '',
    zoning: 'residential',
    cadastralPlan: '',
    mortgageStatus: '',
    servitudes: '',
    electricalCompliance: false,
    gasCompliance: false,
    heatingCertificate: false,
    soilAttestation: false,
    asbestosCertificate: false,
    leadDiagnostic: false,
    termitesDiagnostic: false,
    noiseDiagnostic: false,
    
    // Caractéristiques techniques
    heatingType: 'gas',
    hotWaterSystem: 'gas',
    orientation: 'south',
    buildingMaterials: '',
    roofType: '',
    kitchenType: 'none',
    isolationWalls: false,
    isolationRoof: false,
    doubleGlazing: false,
    hasElevator: false,
    internetFiber: false,
    airConditioning: false,
    
    // Informations financières
    price: '',
    pricePerSqm: '',
    charges: '',
    propertyTax: '',
    coOwnershipFees: '',
    rentalYield: '',
    cadastralIncome: '',
    registrationFees: '',
    notaryFees: '',
    
    // Caractéristiques et équipements
    balcony: false,
    balconyArea: '',
    terrace: false,
    terraceArea: '',
    garden: false,
    gardenArea: '',
    cellar: false,
    attic: false,
    parking: false,
    parkingSpaces: '',
    garage: false,
    furnished: false,
    fireplace: false,
    swimmingPool: false,
    securitySystem: false,
    intercom: false,
    accessControl: false,
    concierge: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        // Informations de base
        name: unit.name || '',
        type: unit.type || 'apartment',
        destination: unit.destination || 'habitation',
        fullAddress: unit.fullAddress || '',
        country: unit.country || '',
        surface: unit.surface?.toString() || '',
        rooms: unit.rooms?.toString() || '',
        bedrooms: unit.bedrooms?.toString() || '',
        bathrooms: unit.bathrooms?.toString() || '',
        floor: unit.floor?.toString() || '',
        availability: unit.availability || 'available',
        condition: unit.condition || 'good',
        constructionYear: unit.constructionYear?.toString() || '',
        renovationYear: unit.renovationYear?.toString() || '',
        description: unit.description || '',
        
        // Informations légales
        propertyTitle: unit.propertyTitle || '',
        energyCertificate: unit.energyCertificate || '',
        energyClass: unit.energyClass || 'not_specified',
        ghgEmissions: unit.ghgEmissions || 'not_specified',
        urbanisticInfo: unit.urbanisticInfo || '',
        zoning: unit.zoning || 'residential',
        cadastralPlan: unit.cadastralPlan || '',
        mortgageStatus: unit.mortgageStatus || '',
        servitudes: unit.servitudes || '',
        electricalCompliance: unit.electricalCompliance || false,
        gasCompliance: unit.gasCompliance || false,
        heatingCertificate: unit.heatingCertificate || false,
        soilAttestation: unit.soilAttestation || false,
        asbestosCertificate: unit.asbestosCertificate || false,
        leadDiagnostic: unit.leadDiagnostic || false,
        termitesDiagnostic: unit.termitesDiagnostic || false,
        noiseDiagnostic: unit.noiseDiagnostic || false,
        
        // Caractéristiques techniques
        heatingType: unit.heatingType || 'gas',
        hotWaterSystem: unit.hotWaterSystem || 'gas',
        orientation: unit.orientation || 'south',
        buildingMaterials: unit.buildingMaterials || '',
        roofType: unit.roofType || '',
        kitchenType: unit.kitchenType || 'none',
        isolationWalls: unit.isolation?.walls || false,
        isolationRoof: unit.isolation?.roof || false,
        doubleGlazing: unit.isolation?.doubleGlazing || false,
        hasElevator: unit.hasElevator || false,
        internetFiber: unit.internetFiber || false,
        airConditioning: unit.airConditioning || false,
        
        // Informations financières
        price: unit.price?.toString() || '',
        pricePerSqm: unit.pricePerSqm?.toString() || '',
        charges: unit.charges?.toString() || '',
        propertyTax: unit.propertyTax?.toString() || '',
        coOwnershipFees: unit.coOwnershipFees?.toString() || '',
        rentalYield: unit.rentalYield?.toString() || '',
        cadastralIncome: unit.cadastralIncome?.toString() || '',
        registrationFees: unit.registrationFees?.toString() || '',
        notaryFees: unit.notaryFees?.toString() || '',
        
        // Caractéristiques et équipements
        balcony: unit.balcony || false,
        balconyArea: unit.balconyArea?.toString() || '',
        terrace: unit.terrace || false,
        terraceArea: unit.terraceArea?.toString() || '',
        garden: unit.garden || false,
        gardenArea: unit.gardenArea?.toString() || '',
        cellar: unit.cellar || false,
        attic: unit.attic || false,
        parking: unit.parking || false,
        parkingSpaces: unit.parkingSpaces?.toString() || '',
        garage: unit.garage || false,
        furnished: unit.furnished || false,
        fireplace: unit.fireplace || false,
        swimmingPool: unit.swimmingPool || false,
        securitySystem: unit.securitySystem || false,
        intercom: unit.intercom || false,
        accessControl: unit.accessControl || false,
        concierge: unit.concierge || false
      });
    }
  }, [unit]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Fonction pour nettoyer les valeurs undefined
      const cleanData = (obj: any) => {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'object' && !Array.isArray(value)) {
              const cleanedNested = cleanData(value);
              if (Object.keys(cleanedNested).length > 0) {
                cleaned[key] = cleanedNested;
              }
            } else {
              cleaned[key] = value;
            }
          }
        }
        return cleaned;
      };

      const rawData = {
        // Informations de base
        name: formData.name,
        type: formData.type as Unit['type'],
        destination: formData.destination as Unit['destination'],
        fullAddress: formData.fullAddress,
        country: formData.country,
        surface: Number(formData.surface) || 0,
        rooms: Number(formData.rooms) || 1,
        bedrooms: Number(formData.bedrooms) || 1,
        bathrooms: Number(formData.bathrooms) || 1,
        floor: Number(formData.floor) || 0,
        availability: formData.availability as Unit['availability'],
        condition: formData.condition as Unit['condition'],
        constructionYear: formData.constructionYear ? Number(formData.constructionYear) : null,
        renovationYear: formData.renovationYear ? Number(formData.renovationYear) : null,
        description: formData.description,
        
        // Informations légales
        propertyTitle: formData.propertyTitle,
        energyCertificate: formData.energyCertificate,
        energyClass: formData.energyClass as Unit['energyClass'],
        ghgEmissions: formData.ghgEmissions as Unit['ghgEmissions'],
        urbanisticInfo: formData.urbanisticInfo,
        zoning: formData.zoning as Unit['zoning'],
        cadastralPlan: formData.cadastralPlan,
        mortgageStatus: formData.mortgageStatus,
        servitudes: formData.servitudes,
        electricalCompliance: formData.electricalCompliance,
        gasCompliance: formData.gasCompliance,
        heatingCertificate: formData.heatingCertificate,
        soilAttestation: formData.soilAttestation,
        asbestosCertificate: formData.asbestosCertificate,
        leadDiagnostic: formData.leadDiagnostic,
        termitesDiagnostic: formData.termitesDiagnostic,
        noiseDiagnostic: formData.noiseDiagnostic,
        
        // Caractéristiques techniques
        heatingType: formData.heatingType as Unit['heatingType'],
        hotWaterSystem: formData.hotWaterSystem as Unit['hotWaterSystem'],
        orientation: formData.orientation as Unit['orientation'],
        buildingMaterials: formData.buildingMaterials,
        roofType: formData.roofType,
        kitchenType: formData.kitchenType as Unit['kitchenType'],
        isolation: {
          walls: formData.isolationWalls,
          roof: formData.isolationRoof,
          doubleGlazing: formData.doubleGlazing
        },
        hasElevator: formData.hasElevator,
        internetFiber: formData.internetFiber,
        airConditioning: formData.airConditioning,
        
        // Informations financières
        price: Number(formData.price) || 0,
        pricePerSqm: formData.pricePerSqm ? Number(formData.pricePerSqm) : null,
        charges: formData.charges ? Number(formData.charges) : null,
        propertyTax: formData.propertyTax ? Number(formData.propertyTax) : null,
        coOwnershipFees: formData.coOwnershipFees ? Number(formData.coOwnershipFees) : null,
        rentalYield: formData.rentalYield ? Number(formData.rentalYield) : null,
        cadastralIncome: formData.cadastralIncome ? Number(formData.cadastralIncome) : null,
        registrationFees: formData.registrationFees ? Number(formData.registrationFees) : null,
        notaryFees: formData.notaryFees ? Number(formData.notaryFees) : null,
        
        // Caractéristiques et équipements
        balcony: formData.balcony,
        balconyArea: formData.balconyArea ? Number(formData.balconyArea) : null,
        terrace: formData.terrace,
        terraceArea: formData.terraceArea ? Number(formData.terraceArea) : null,
        garden: formData.garden,
        gardenArea: formData.gardenArea ? Number(formData.gardenArea) : null,
        cellar: formData.cellar,
        attic: formData.attic,
        parking: formData.parking,
        parkingSpaces: formData.parkingSpaces ? Number(formData.parkingSpaces) : null,
        garage: formData.garage,
        furnished: formData.furnished,
        fireplace: formData.fireplace,
        swimmingPool: formData.swimmingPool,
        securitySystem: formData.securitySystem,
        intercom: formData.intercom,
        accessControl: formData.accessControl,
        concierge: formData.concierge
      };

      const updatedData = cleanData(rawData);

      await updateUnit(unit.id, updatedData);
      
      const updatedUnit = {
        ...unit,
        ...updatedData
      };
      onSave(updatedUnit as Unit);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'unité:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="unit-edit-modal">
        <div className="modal-header">
          <h2>Modifier l'unité</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-sections">
            {/* Section Informations de base */}
            <div className="form-section">
              <div className="section-header">
                <Home className="section-icon" size={20} />
                <h4>Informations de base</h4>
              </div>
              <div className="form-cards">
                <div className="form-card">
                  <h5><Building size={16} /> Identification</h5>
                  <div className="form-grid compact">
                    <div className="form-group">
                      <label htmlFor="name">Nom de l'unité *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Type</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="apartment">Appartement</option>
                        <option value="house">Maison</option>
                        <option value="commercial">Commercial</option>
                        <option value="office">Bureau</option>
                        <option value="retail">Commerce</option>
                        <option value="storage">Stockage</option>
                        <option value="parking">Parking</option>
                        <option value="land">Terrain</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="destination">Destination</label>
                      <select
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                      >
                        <option value="habitation">Habitation</option>
                        <option value="commercial">Commercial</option>
                        <option value="mixte">Mixte</option>
                        <option value="industriel">Industriel</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <h5><MapPin size={16} /> Localisation</h5>
                  <div className="form-grid compact">

                    <div className="form-group full-width">
                      <label htmlFor="fullAddress">Adresse complète</label>
                      <input
                        type="text"
                        id="fullAddress"
                        name="fullAddress"
                        value={formData.fullAddress}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="country">Pays</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <h5><Building size={16} /> Caractéristiques</h5>
                  <div className="form-grid compact">

                    <div className="form-group">
                      <label htmlFor="surface">Surface (m²) *</label>
                      <input
                        type="number"
                        id="surface"
                        name="surface"
                        value={formData.surface}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="rooms">Pièces</label>
                      <input
                        type="number"
                        id="rooms"
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bedrooms">Chambres</label>
                      <input
                        type="number"
                        id="bedrooms"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bathrooms">SdB</label>
                      <input
                        type="number"
                        id="bathrooms"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="floor">Étage</label>
                      <input
                        type="number"
                        id="floor"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="availability">Disponibilité</label>
                      <select
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                      >
                        <option value="available">Disponible</option>
                        <option value="reserved">Réservé</option>
                        <option value="sold">Vendu</option>
                        <option value="rented">Loué</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="condition">État</label>
                      <select
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                      >
                        <option value="new">Neuf</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Bon</option>
                        <option value="to_renovate">À rénover</option>
                        <option value="to_demolish">À démolir</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="constructionYear">Construction</label>
                      <input
                        type="number"
                        id="constructionYear"
                        name="constructionYear"
                        value={formData.constructionYear}
                        onChange={handleInputChange}
                        min="1800"
                        max="2030"
                        placeholder="Année"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="renovationYear">Rénovation</label>
                      <input
                        type="number"
                        id="renovationYear"
                        name="renovationYear"
                        value={formData.renovationYear}
                        onChange={handleInputChange}
                        min="1800"
                        max="2030"
                        placeholder="Année"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-card full-width">
                  <h5><FileText size={16} /> Description</h5>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Description détaillée de l'unité..."
                  />
                </div>
              </div>
            </div>

            {/* Section Informations légales */}
            <div className="form-section">
              <div className="section-header">
                <Shield className="section-icon" size={20} />
                <h4>Informations légales</h4>
              </div>
              <div className="form-cards">
                <div className="form-card">
                  <h5><FileCheck size={16} /> Certifications</h5>
                  <div className="form-grid compact">
                <div className="form-group">
                  <label htmlFor="propertyTitle">Titre de propriété</label>
                  <input
                    type="text"
                    id="propertyTitle"
                    name="propertyTitle"
                    value={formData.propertyTitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="energyCertificate">Certificat énergétique</label>
                  <input
                    type="text"
                    id="energyCertificate"
                    name="energyCertificate"
                    value={formData.energyCertificate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="energyClass">Classe énergétique</label>
                  <select
                    id="energyClass"
                    name="energyClass"
                    value={formData.energyClass}
                    onChange={handleInputChange}
                  >
                    <option value="not_specified">Non spécifié</option>
                    <option value="A++">A++</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ghgEmissions">Émissions GES</label>
                  <select
                    id="ghgEmissions"
                    name="ghgEmissions"
                    value={formData.ghgEmissions}
                    onChange={handleInputChange}
                  >
                    <option value="not_specified">Non spécifié</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="urbanisticInfo">Informations urbanistiques</label>
                  <input
                    type="text"
                    id="urbanisticInfo"
                    name="urbanisticInfo"
                    value={formData.urbanisticInfo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zoning">Zonage</label>
                  <select
                    id="zoning"
                    name="zoning"
                    value={formData.zoning}
                    onChange={handleInputChange}
                  >
                    <option value="residential">Résidentiel</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industriel</option>
                    <option value="mixed">Mixte</option>
                    <option value="agricultural">Agricole</option>
                  </select>
                </div>

                    <div className="form-group">
                      <label htmlFor="cadastralPlan">Plan cadastral</label>
                      <input
                        type="text"
                        id="cadastralPlan"
                        name="cadastralPlan"
                        value={formData.cadastralPlan}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="mortgageStatus">Statut hypothécaire</label>
                      <input
                        type="text"
                        id="mortgageStatus"
                        name="mortgageStatus"
                        value={formData.mortgageStatus}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-card full-width">
                  <h5><FileText size={16} /> Servitudes</h5>
                  <textarea
                    id="servitudes"
                    name="servitudes"
                    value={formData.servitudes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Servitudes et restrictions..."
                  />
                </div>

                <div className="form-card">
                  <h5><Shield size={16} /> Conformités</h5>
                  <div className="checkbox-grid">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="electricalCompliance"
                        checked={formData.electricalCompliance}
                        onChange={handleCheckboxChange}
                      />
                      Conformité électrique
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="gasCompliance"
                        checked={formData.gasCompliance}
                        onChange={handleCheckboxChange}
                      />
                      Conformité gaz
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        name="electricalCompliance"
                        checked={formData.electricalCompliance}
                        onChange={handleCheckboxChange}
                      />
                      Conformité électrique
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Caractéristiques techniques */}
            <div className="form-section">
              <div className="section-header">
                <Wrench className="section-icon" size={20} />
                <h4>Caractéristiques techniques</h4>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="heatingType">Type de chauffage</label>
                  <select
                    id="heatingType"
                    name="heatingType"
                    value={formData.heatingType}
                    onChange={handleInputChange}
                  >
                    <option value="central">Central</option>
                    <option value="individual">Individuel</option>
                    <option value="electric">Électrique</option>
                    <option value="gas">Gaz</option>
                    <option value="oil">Fioul</option>
                    <option value="heat_pump">Pompe à chaleur</option>
                    <option value="wood">Bois</option>
                    <option value="solar">Solaire</option>
                    <option value="none">Aucun</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hotWaterSystem">Système eau chaude</label>
                  <select
                    id="hotWaterSystem"
                    name="hotWaterSystem"
                    value={formData.hotWaterSystem}
                    onChange={handleInputChange}
                  >
                    <option value="central">Central</option>
                    <option value="individual">Individuel</option>
                    <option value="electric">Électrique</option>
                    <option value="gas">Gaz</option>
                    <option value="solar">Solaire</option>
                    <option value="heat_pump">Pompe à chaleur</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="orientation">Orientation</label>
                  <select
                    id="orientation"
                    name="orientation"
                    value={formData.orientation}
                    onChange={handleInputChange}
                  >
                    <option value="north">Nord</option>
                    <option value="south">Sud</option>
                    <option value="east">Est</option>
                    <option value="west">Ouest</option>
                    <option value="north_south">Nord-Sud</option>
                    <option value="east_west">Est-Ouest</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="buildingMaterials">Matériaux de construction</label>
                  <input
                    type="text"
                    id="buildingMaterials"
                    name="buildingMaterials"
                    value={formData.buildingMaterials}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roofType">Type de toiture</label>
                  <input
                    type="text"
                    id="roofType"
                    name="roofType"
                    value={formData.roofType}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="kitchenType">Type de cuisine</label>
                  <select
                    id="kitchenType"
                    name="kitchenType"
                    value={formData.kitchenType}
                    onChange={handleInputChange}
                  >
                    <option value="equipped">Équipée</option>
                    <option value="fitted">Aménagée</option>
                    <option value="open">Ouverte</option>
                    <option value="separate">Séparée</option>
                    <option value="none">Aucune</option>
                  </select>
                </div>
              </div>

              <div className="checkbox-grid">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isolationWalls"
                    checked={formData.isolationWalls}
                    onChange={handleCheckboxChange}
                  />
                  Isolation murs
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isolationRoof"
                    checked={formData.isolationRoof}
                    onChange={handleCheckboxChange}
                  />
                  Isolation toiture
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="doubleGlazing"
                    checked={formData.doubleGlazing}
                    onChange={handleCheckboxChange}
                  />
                  Double vitrage
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="hasElevator"
                    checked={formData.hasElevator}
                    onChange={handleCheckboxChange}
                  />
                  Ascenseur
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="internetFiber"
                    checked={formData.internetFiber}
                    onChange={handleCheckboxChange}
                  />
                  Fibre optique
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="airConditioning"
                    checked={formData.airConditioning}
                    onChange={handleCheckboxChange}
                  />
                  Climatisation
                </label>
              </div>
            </div>

            {/* Section Informations financières */}
            <div className="form-section">
              <div className="section-header">
                <Euro className="section-icon" size={20} />
                <h4>Informations financières</h4>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="price">Prix (€) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pricePerSqm">Prix au m² (€)</label>
                  <input
                    type="number"
                    id="pricePerSqm"
                    name="pricePerSqm"
                    value={formData.pricePerSqm}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="charges">Charges (€/mois)</label>
                  <input
                    type="number"
                    id="charges"
                    name="charges"
                    value={formData.charges}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="propertyTax">Taxe foncière (€/an)</label>
                  <input
                    type="number"
                    id="propertyTax"
                    name="propertyTax"
                    value={formData.propertyTax}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="coOwnershipFees">Charges copropriété (€/mois)</label>
                  <input
                    type="number"
                    id="coOwnershipFees"
                    name="coOwnershipFees"
                    value={formData.coOwnershipFees}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rentalYield">Rendement locatif (%)</label>
                  <input
                    type="number"
                    id="rentalYield"
                    name="rentalYield"
                    value={formData.rentalYield}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cadastralIncome">Revenu cadastral (€)</label>
                  <input
                    type="number"
                    id="cadastralIncome"
                    name="cadastralIncome"
                    value={formData.cadastralIncome}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registrationFees">Frais d'enregistrement (€)</label>
                  <input
                    type="number"
                    id="registrationFees"
                    name="registrationFees"
                    value={formData.registrationFees}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notaryFees">Frais de notaire (€)</label>
                  <input
                    type="number"
                    id="notaryFees"
                    name="notaryFees"
                    value={formData.notaryFees}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section Équipements et caractéristiques */}
            <div className="form-section">
              <div className="section-header">
                <Zap className="section-icon" size={20} />
                <h4>Équipements et caractéristiques</h4>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="balconyArea">Surface balcon (m²)</label>
                  <input
                    type="number"
                    id="balconyArea"
                    name="balconyArea"
                    value={formData.balconyArea}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="terraceArea">Surface terrasse (m²)</label>
                  <input
                    type="number"
                    id="terraceArea"
                    name="terraceArea"
                    value={formData.terraceArea}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gardenArea">Surface jardin (m²)</label>
                  <input
                    type="number"
                    id="gardenArea"
                    name="gardenArea"
                    value={formData.gardenArea}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="parkingSpaces">Nombre de places de parking</label>
                  <input
                    type="number"
                    id="parkingSpaces"
                    name="parkingSpaces"
                    value={formData.parkingSpaces}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="checkbox-grid">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="balcony"
                    checked={formData.balcony}
                    onChange={handleCheckboxChange}
                  />
                  Balcon
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="terrace"
                    checked={formData.terrace}
                    onChange={handleCheckboxChange}
                  />
                  Terrasse
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="garden"
                    checked={formData.garden}
                    onChange={handleCheckboxChange}
                  />
                  Jardin
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="cellar"
                    checked={formData.cellar}
                    onChange={handleCheckboxChange}
                  />
                  Cave
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="attic"
                    checked={formData.attic}
                    onChange={handleCheckboxChange}
                  />
                  Grenier
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleCheckboxChange}
                  />
                  Parking
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="garage"
                    checked={formData.garage}
                    onChange={handleCheckboxChange}
                  />
                  Garage
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={formData.furnished}
                    onChange={handleCheckboxChange}
                  />
                  Meublé
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="fireplace"
                    checked={formData.fireplace}
                    onChange={handleCheckboxChange}
                  />
                  Cheminée
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="swimmingPool"
                    checked={formData.swimmingPool}
                    onChange={handleCheckboxChange}
                  />
                  Piscine
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="securitySystem"
                    checked={formData.securitySystem}
                    onChange={handleCheckboxChange}
                  />
                  Système sécurité
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="intercom"
                    checked={formData.intercom}
                    onChange={handleCheckboxChange}
                  />
                  Interphone
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="accessControl"
                    checked={formData.accessControl}
                    onChange={handleCheckboxChange}
                  />
                  Contrôle d'accès
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="concierge"
                    checked={formData.concierge}
                    onChange={handleCheckboxChange}
                  />
                  Concierge
                </label>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Save size={16} />
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
