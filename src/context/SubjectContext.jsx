import React, { createContext, useContext, useState } from 'react';
import subjectsData from '../data/subjects.json';
import materialsData from '../data/materials.json';

const SubjectContext = createContext();

export const SubjectProvider = ({ children, userId }) => {
  // In the future, fetch subjects/materials for the userId from API
  // For now, use static data
  const [subjects, setSubjects] = useState(subjectsData);
  const [materials, setMaterials] = useState(materialsData);

  // Example: filter by userId if needed in the future
  // const userSubjects = subjects.filter(s => s.userId === userId);
  // const userMaterials = materials.filter(m => m.userId === userId);

  return (
    <SubjectContext.Provider value={{ subjects, setSubjects, materials, setMaterials }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjectContext = () => useContext(SubjectContext);
