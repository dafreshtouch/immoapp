import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export function useFirestore<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, collectionName);
    const q = query(
      collectionRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        // Tri côté client par createdAt desc
        items.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, collectionName]);

  const addItem = async (item: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('useFirestore - Updating document:', id, 'in collection:', collectionName, 'with updates:', updates);
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('useFirestore - Document updated successfully');
    } catch (err: any) {
      console.error('useFirestore - Update error:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
}
