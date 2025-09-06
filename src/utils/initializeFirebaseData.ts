import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createSampleDataWithIds } from '../data/sampleRealEstateData';

export const initializeRealEstateData = async (userId: string) => {
  try {
    // Check if user already has projects
    const projectsRef = collection(db, 'projects');
    const existingProjects = await getDocs(query(projectsRef, where('userId', '==', userId)));
    
    if (existingProjects.size > 0) {
      console.log('User already has real estate data, skipping initialization');
      return;
    }

    console.log('Initializing sample real estate data for user:', userId);
    
    const sampleData = createSampleDataWithIds(userId);

    // Add projects
    const projectPromises = sampleData.projects.map(async (project) => {
      const { id, ...projectData } = project;
      return await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    const createdProjects = await Promise.all(projectPromises);
    console.log(`Created ${createdProjects.length} projects`);

    // Get actual project IDs and update units
    const actualProjectIds = createdProjects.map(doc => doc.id);
    const updatedUnits = sampleData.units.map((unit, index) => {
      const projectIndex = unit.projectId === 'proj_1' ? 0 :
                          unit.projectId === 'proj_2' ? 1 :
                          unit.projectId === 'proj_3' ? 2 : 3;
      return {
        ...unit,
        projectId: actualProjectIds[projectIndex] || actualProjectIds[0]
      };
    });

    // Add units
    const unitPromises = updatedUnits.map(async (unit) => {
      const { id, ...unitData } = unit;
      return await addDoc(collection(db, 'units'), {
        ...unitData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    const createdUnits = await Promise.all(unitPromises);
    console.log(`Created ${createdUnits.length} units`);

    // Add contractors
    const contractorPromises = sampleData.contractors.map(async (contractor) => {
      const { id, ...contractorData } = contractor;
      return await addDoc(collection(db, 'contractors'), {
        ...contractorData,
        activeProjects: contractor.activeProjects.map((projId, index) => 
          actualProjectIds[index] || actualProjectIds[0]
        ),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    const createdContractors = await Promise.all(contractorPromises);
    console.log(`Created ${createdContractors.length} contractors`);

    // Add messages
    const messagePromises = sampleData.messages.map(async (message) => {
      const { id, ...messageData } = message;
      const projectIndex = message.projectId === 'proj_1' ? 0 :
                          message.projectId === 'proj_2' ? 1 : 2;
      return await addDoc(collection(db, 'gestionMessages'), {
        ...messageData,
        projectId: actualProjectIds[projectIndex],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    const createdMessages = await Promise.all(messagePromises);
    console.log(`Created ${createdMessages.length} messages`);

    // Add tasks
    const taskPromises = sampleData.tasks.map(async (task) => {
      const { id, ...taskData } = task;
      const projectIndex = task.projectId === 'proj_1' ? 0 :
                          task.projectId === 'proj_2' ? 1 :
                          task.projectId === 'proj_3' ? 2 : undefined;
      return await addDoc(collection(db, 'gestionTasks'), {
        ...taskData,
        projectId: projectIndex !== undefined ? actualProjectIds[projectIndex] : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    const createdTasks = await Promise.all(taskPromises);
    console.log(`Created ${createdTasks.length} tasks`);

    // Add documents
    const documentPromises = sampleData.documents.map(async (document) => {
      const { id, ...documentData } = document;
      const projectIndex = document.projectId === 'proj_1' ? 0 :
                          document.projectId === 'proj_2' ? 1 : 2;
      return await addDoc(collection(db, 'documents'), {
        ...documentData,
        projectId: actualProjectIds[projectIndex],
        contractorId: createdContractors[0]?.id, // Simplified for demo
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    const createdDocuments = await Promise.all(documentPromises);
    console.log(`Created ${createdDocuments.length} documents`);

    console.log('✅ Sample real estate data initialized successfully!');
    
    return {
      projects: createdProjects.length,
      units: createdUnits.length,
      contractors: createdContractors.length,
      messages: createdMessages.length,
      tasks: createdTasks.length,
      documents: createdDocuments.length
    };

  } catch (error) {
    console.error('Error initializing real estate data:', error);
    throw new Error('Failed to initialize sample data');
  }
};

// Helper function to clear all user data (for testing)
export const clearUserRealEstateData = async (userId: string) => {
  const collections = ['projects', 'units', 'contractors', 'gestionMessages', 'gestionTasks', 'documents'];
  
  for (const collectionName of collections) {
    const collectionRef = collection(db, collectionName);
    const userDocs = await getDocs(query(collectionRef, where('userId', '==', userId)));
    
    const deletePromises = userDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Cleared ${userDocs.size} documents from ${collectionName}`);
  }
  
  console.log('✅ User real estate data cleared successfully!');
};
