import React, { createContext, useContext, useState, useEffect } from 'react';

const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);

  const fetchSubjectsAdmin = async () => {
    setIsLoadingSubjects(true);
    setSubjectsError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subject/get-subjects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjectsError('Failed to load subjects. Please try again.');
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchSubjectsByGrade = async () => {
    setIsLoadingSubjects(true);
    setSubjectsError(null);
    try {
      let grade = 0;
      const userProfile = JSON.parse(localStorage.getItem("user_profile") || '{}');

      grade = userProfile.grade || 0;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/subject/get-subjects-by-class/${grade}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjectsError('Failed to load subjects. Please try again.');
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchMaterialsBySubject = async (subjectId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/materials/get-materials-by-subject/${subjectId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const materialsData = await res.json();
      if (Array.isArray(materialsData)) {
        setSubjects((prevSubjects) => {
          return prevSubjects.map((subject) => {
            if (String(subject.subject_id) === String(subjectId)) {
              return { ...subject, materials: materialsData };
            }
            return subject;
          });
        });
      }
    } catch (error) {
      console.error(`Error fetching materials for subject ${subjectId}:`, error);
      // Decide how to handle this in UI, e.g., show a message, or clear materials if they were previously loaded
      setSubjects((prevSubjects) => {
        return prevSubjects.map((subject) => {
          if (String(subject.subject_id) === String(subjectId)) {
            // Optionally, clear materials or add an error flag to the subject
            return { ...subject, materials: [], materialsError: 'Failed to load materials.' };
          }
          return subject;
        });
      });
    }
  };

  const postSubject = async (payload) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subject/post-subject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const newSubject = await res.json();
      setSubjects((prevSubjects) => [...prevSubjects, newSubject]);
      return newSubject;
    } catch (error) {
      console.error('Error posting subject:', error);
      throw new Error('Failed to add subject');
    }
  };

  // On mount, auto-fetch subjects if user is logged in
  useEffect(() => {
    const sessionToken = localStorage.getItem("session_token");
    const userProfile = localStorage.getItem("user_profile");
    if (sessionToken && userProfile.role == 'admin') {
      fetchSubjectsAdmin();
    } else if (sessionToken) {
      fetchSubjectsByGrade();
    }
    console.log('User profile on mount:', userProfile);
    console.log('User profile on mount:', JSON.parse(userProfile));
    console.log("Subjects fetched on mount:", subjects);
  }, []);

  return (
    <SubjectContext.Provider value={{
      subjects,
      setSubjects,
      fetchSubjectsByGrade,
      fetchMaterialsBySubject,
      fetchSubjectsAdmin,
      postSubject,
      isLoadingSubjects,
      subjectsError
    }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjectContext = () => useContext(SubjectContext);