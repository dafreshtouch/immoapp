import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add image URL to unit's gallery
export const addImageToUnit = async (unitId: string, imageUrl: string): Promise<void> => {
  try {
    const unitRef = doc(db, 'units', unitId);
    await updateDoc(unitRef, {
      images: arrayUnion(imageUrl),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding image to unit:', error);
    throw new Error('Erreur lors de l\'ajout de l\'image à l\'unité');
  }
};

// Remove image URL from unit's gallery
export const removeImageFromUnit = async (unitId: string, imageUrl: string): Promise<void> => {
  try {
    const unitRef = doc(db, 'units', unitId);
    await updateDoc(unitRef, {
      images: arrayRemove(imageUrl),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing image from unit:', error);
    throw new Error('Erreur lors de la suppression de l\'image de l\'unité');
  }
};

// Update unit main image
export const updateUnitMainImage = async (unitId: string, imageUrl: string): Promise<void> => {
  try {
    const unitRef = doc(db, 'units', unitId);
    await updateDoc(unitRef, {
      mainImage: imageUrl,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating unit main image:', error);
    throw new Error('Erreur lors de la mise à jour de l\'image principale');
  }
};
