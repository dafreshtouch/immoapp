import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function cleanupDuplicateCategories(userId: string) {
  try {
    const categoriesRef = collection(db, 'eventCategories');
    const q = query(categoriesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        value: data.value || '',
        icon: data.icon || '',
        userId: data.userId || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        ...data
      };
    });
    
    console.log(`Début du nettoyage: ${categories.length} catégories trouvées`);
    
    // Grouper par valeur ET par nom pour identifier tous les types de doublons
    const seenValues = new Map<string, any>();
    const seenNames = new Map<string, any>();
    const duplicatesToDelete: string[] = [];
    
    // Trier par date de création (plus ancien en premier)
    const sortedCategories = [...categories].sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return aTime - bTime;
    });
    
    sortedCategories.forEach(category => {
      const normalizedName = category.name.toLowerCase().trim();
      const normalizedValue = category.value.toLowerCase().trim();
      
      const isDuplicateValue = seenValues.has(normalizedValue);
      const isDuplicateName = seenNames.has(normalizedName);
      
      if (isDuplicateValue || isDuplicateName) {
        duplicatesToDelete.push(category.id);
        console.log(`Doublon détecté: ${category.name} (${category.value}) - ID: ${category.id}`);
      } else {
        seenValues.set(normalizedValue, category);
        seenNames.set(normalizedName, category);
      }
    });
    
    console.log(`${duplicatesToDelete.length} doublons identifiés pour suppression`);
    
    // Supprimer tous les doublons avec un délai entre chaque suppression
    let deletedCount = 0;
    for (const duplicateId of duplicatesToDelete) {
      try {
        await deleteDoc(doc(db, 'eventCategories', duplicateId));
        deletedCount++;
        console.log(`Doublon supprimé: ${duplicateId}`);
        // Petit délai pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (deleteError) {
        console.error(`Erreur lors de la suppression de ${duplicateId}:`, deleteError);
      }
    }
    
    console.log(`Nettoyage terminé: ${deletedCount} doublons supprimés sur ${duplicatesToDelete.length} identifiés`);
    return deletedCount;
  } catch (error) {
    console.error('Erreur lors du nettoyage des catégories:', error);
    return 0;
  }
}
