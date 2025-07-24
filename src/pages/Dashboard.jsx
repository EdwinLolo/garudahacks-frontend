import React, { useEffect, useState } from "react";
// import subjectsData from "../data/subjects.json";
import SubjectCard from "../components/SubjectCard";

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('https://garudahacks6-express-be-zy4zf.ondigitalocean.app/subject/get-subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <section className="min-h-screen pt-22 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          All Your <span className="text-blue-500 dark:text-blue-400">Subjects</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Browse the subjects available in your dashboard and continue your learning journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
