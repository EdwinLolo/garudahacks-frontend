import React, { useEffect, useState } from "react";
import subjectsData from "../data/subjects.json"; 
import SubjectCard from "../components/SubjectCard"; 

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSubjects(subjectsData);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="py-20 bg-white text-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          All Your <span className="text-blue-500">Subjects</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
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
