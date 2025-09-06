import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload image to Firebase Storage
export const uploadImageToStorage = async (
  file: File, 
  path: string, 
  fileName?: string
): Promise<string> => {
  try {
    // Generate unique filename if not provided
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    const fullPath = `${path}/${finalFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Erreur lors du téléchargement de l\'image');
  }
};

// Delete image from Firebase Storage
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Erreur lors de la suppression de l\'image');
  }
};

// Upload project main image
export const uploadProjectMainImage = async (
  file: File, 
  projectId: string
): Promise<string> => {
  return uploadImageToStorage(file, `projects/${projectId}/main`, `main_${Date.now()}.jpg`);
};

// Upload project gallery image
export const uploadProjectGalleryImage = async (
  file: File, 
  projectId: string
): Promise<string> => {
  return uploadImageToStorage(file, `projects/${projectId}/gallery`, `gallery_${Date.now()}.jpg`);
};

// Upload unit main image
export const uploadUnitMainImage = async (
  file: File, 
  unitId: string
): Promise<string> => {
  return uploadImageToStorage(file, `units/${unitId}/main`, `main_${Date.now()}.jpg`);
};

// Upload unit gallery image
export const uploadUnitGalleryImage = async (
  file: File, 
  unitId: string
): Promise<string> => {
  return uploadImageToStorage(file, `units/${unitId}/gallery`, `gallery_${Date.now()}.jpg`);
};
