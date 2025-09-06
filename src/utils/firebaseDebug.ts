import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function debugFirebaseData() {
  try {
    console.log('=== RÉCUPÉRATION DES DONNÉES FIREBASE ===\n');
    
    // Récupérer tous les projets
    console.log('📁 PROJETS:');
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    const projects: any[] = [];
    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.name,
        userId: data.userId
      });
      console.log(`  - ID: ${doc.id} | Nom: ${data.name} | UserID: ${data.userId}`);
    });
    
    console.log(`\nTotal projets: ${projects.length}\n`);
    
    // Récupérer toutes les unités
    console.log('🏠 UNITÉS:');
    const unitsRef = collection(db, 'units');
    const unitsSnapshot = await getDocs(unitsRef);
    
    const units: any[] = [];
    unitsSnapshot.forEach((doc) => {
      const data = doc.data();
      units.push({
        id: doc.id,
        name: data.name,
        projectId: data.projectId,
        userId: data.userId
      });
      console.log(`  - ID: ${doc.id} | Nom: ${data.name} | ProjectID: ${data.projectId} | UserID: ${data.userId}`);
    });
    
    console.log(`\nTotal unités: ${units.length}\n`);
    
    // Analyser les correspondances
    console.log('🔍 ANALYSE DES CORRESPONDANCES:');
    projects.forEach(project => {
      const projectUnits = units.filter(unit => unit.projectId === project.id);
      console.log(`  - Projet "${project.name}" (${project.id}): ${projectUnits.length} unité(s)`);
      projectUnits.forEach(unit => {
        console.log(`    └── ${unit.name} (${unit.id})`);
      });
    });
    
    // Unités orphelines
    const orphanUnits = units.filter(unit => !projects.find(p => p.id === unit.projectId));
    if (orphanUnits.length > 0) {
      console.log('\n⚠️  UNITÉS ORPHELINES (sans projet correspondant):');
      orphanUnits.forEach(unit => {
        console.log(`  - ${unit.name} (${unit.id}) -> ProjectID: ${unit.projectId}`);
      });
    }
    
    return { projects, units };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return { projects: [], units: [] };
  }
}
