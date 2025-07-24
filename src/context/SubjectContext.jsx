import React, { createContext, useContext, useState, useEffect } from 'react';
const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Fetch subjects from API by classNumber (grade)
  const fetchSubjectsByGrade = async () => {
    try {
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

  // Fetch materials by class/grade
//   const fetchMaterialsByGrade = async () => {
//     try {
//       let grade = 0;
//       try {
//         const userData = JSON.parse(localStorage.getItem("user_data"));
//         if (userData && userData.grade) grade = userData.grade;
//       } catch {}
//       if (!grade) {
//         try {
//           const userProfile = JSON.parse(localStorage.getItem("user_profile"));
//           if (userProfile && userProfile.grade) grade = userProfile.grade;
//         } catch {}
//       }
//       if (!grade) grade = 0;

//       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/material/get-materials-by-class/${grade}`);
//       const materialsData = await res.json();
//       setMaterials(Array.isArray(materialsData) ? materialsData : []);
//     } catch (error) {
//       setMaterials([]);
//     }
//   };

  // On mount, auto-fetch subjects and materials if user is logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetchSubjectsByGrade();
    //   fetchMaterialsByGrade();
    }
  }, []);

  return (
    // <SubjectContext.Provider value={{ subjects, setSubjects, materials, setMaterials, fetchSubjectsByGrade, fetchMaterialsByGrade }}>
    <SubjectContext.Provider value={{ subjects, setSubjects, materials, setMaterials, fetchSubjectsByGrade }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjectContext = () => useContext(SubjectContext);
