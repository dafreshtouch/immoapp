import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add image URL to project's gallery
export const addImageToProject = async (projectId: string, imageUrl: string): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      images: arrayUnion(imageUrl),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding image to project:', error);
    throw new Error('Erreur lors de l\'ajout de l\'image au projet');
  }
};

// Remove image URL from project's gallery
export const removeImageFromProject = async (projectId: string, imageUrl: string): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      images: arrayRemove(imageUrl),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing image from project:', error);
    throw new Error('Erreur lors de la suppression de l\'image du projet');
  }
};

// Update project main image
export const updateProjectMainImage = async (projectId: string, imageUrl: string): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      mainImage: imageUrl,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating project main image:', error);
    throw new Error('Erreur lors de la mise à jour de l\'image principale');
  }
};
