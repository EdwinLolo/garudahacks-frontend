import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const subjectId = parseInt(id, 10);
  const { subjects, materials } = useSubjectContext();
  const subject = subjects.find((s) => s.id === subjectId);
  const subjectMaterials = materials.filter((m) => m.subjectId === subjectId);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-24 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto max-w-4xl px-4">
        <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition">&larr; Back</button>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-3xl font-bold">{subject.title}</h2>
          </div>
          {/* Add description if available in subject */}
          {subject.description && (
            <p className="text-lg text-gray-700 dark:text-gray-300">{subject.description}</p>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-4">Learning Materials</h3>
          {subjectMaterials.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No materials available for this subject yet.</p>
          ) : (
            <ul className="space-y-4">
              {subjectMaterials.map((material) => (
                <li key={material.id} className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                  <h4 className="text-lg font-bold mb-1 text-blue-700 dark:text-blue-300">{material.title}</h4>
                  {/* Optionally show a preview of lesson_packet or a summary */}
                  <p className="text-gray-700 dark:text-gray-200 truncate">{material.lesson_packet?.slice(0, 120)}...</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default SubjectDetail;
