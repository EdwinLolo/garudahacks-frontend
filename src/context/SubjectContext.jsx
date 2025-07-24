import React, { createContext, useContext, useState } from 'react';

const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Fetch subjects from API by classNumber (grade)
  const fetchSubjectsByGrade = async () => {
    try {
      // Try to get grade from user_data or user_profile in localStorage
      let grade = 0;
      try {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        if (userData && userData.grade) grade = userData.grade;
      } catch {}
      if (!grade) {
        try {
          const userProfile = JSON.parse(localStorage.getItem("user_profile"));
          if (userProfile && userProfile.grade) grade = userProfile.grade;
        } catch {}
      }
      if (!grade) grade = 0;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subject/get-subjects-by-class/${grade}`
      );
      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubjects([]);
    }
  };

  return (
    <SubjectContext.Provider value={{ subjects, setSubjects, materials, setMaterials, fetchSubjectsByGrade }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjectContext = () => useContext(SubjectContext);
