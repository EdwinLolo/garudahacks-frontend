import React, { useState, useEffect, useMemo } from "react";
import SubjectCard from "../components/SubjectCard";
import { useSubjectContext } from "../context/SubjectContext";

// Re-using AddSubjectForm as it's already functional
function AddSubjectForm({ onClose }) {
  const { postSubject } = useSubjectContext();
  const [classNumber, setClassNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (classNumber === "" || isNaN(Number(classNumber))) {
      setError("Class number is required and must be a number.");
      setLoading(false);
      return;
    }

    const parsedClassNumber = parseInt(classNumber, 10);

    try {
      const payload = {
        class: parsedClassNumber,
        name,
        description,
      };

      await postSubject(payload);

      setSuccess("Subject added successfully!");
      setClassNumber("");
      setName("");
      setDescription("");

      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Error adding subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        placeholder="Grade/Class Number"
        value={classNumber}
        onChange={(e) => setClassNumber(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        required
      />
      <input
        type="text"
        placeholder="Subject Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-500 text-sm">{success}</div>}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

const Dashboard = () => {
  const { subjects } = useSubjectContext();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");

  let role = null;
  const profileStr = localStorage.getItem("user_profile");
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr);
      role = profile.role || null;
    } catch {
      role = null;
    }
  }

  const uniqueGrades = useMemo(() => {
    if (!subjects) return [];
    const grades = new Set(subjects.map(subject => subject.class));
    return Array.from(grades).sort((a, b) => a - b);
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    if (selectedGradeFilter === "all") {
      return subjects;
    }
    return subjects.filter(subject => String(subject.class) === selectedGradeFilter);
  }, [subjects, selectedGradeFilter]);

  return (
    <section className="min-h-screen pt-22 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          All Your <span className="text-blue-500 dark:text-blue-400">Subjects</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Browse the subjects available in your dashboard and continue your learning journey.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          {(role === "teacher" || role === "admin") && (
            <>
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={() => setShowAddPopup(true)}
              >
                Add Subject
              </button>

              {uniqueGrades.length > 0 && (
                <div className="relative inline-block text-left w-full sm:w-auto">
                  <label htmlFor="grade-filter" className="sr-only">Filter by Grade</label>
                  <select
                    id="grade-filter"
                    value={selectedGradeFilter}
                    onChange={(e) => setSelectedGradeFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">All Grades</option>
                    {uniqueGrades.map(grade => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow using inline SVG */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.17 8.29a.75.75 0 01.06-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        {showAddPopup && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-transparent z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowAddPopup(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">Add New Subject</h3>
              <AddSubjectForm onClose={() => setShowAddPopup(false)} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {filteredSubjects && filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500 dark:text-gray-400">
              {selectedGradeFilter === "all" && (role === "teacher" || role === "admin")
                ? "No subjects found."
                : selectedGradeFilter !== "all" && (role === "teacher" || role === "admin")
                  ? `No subjects found for Grade ${selectedGradeFilter}.`
                  : "No subjects available."
              }
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;