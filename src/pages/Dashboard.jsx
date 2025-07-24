import React, { useState, useEffect } from "react";
import SubjectCard from "../components/SubjectCard";
import { useSubjectContext } from "../context/SubjectContext";

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
  const [showAddPopup, setShowAddPopup] = React.useState(false);

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

  return (
    <section className="min-h-screen pt-22 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          All Your <span className="text-blue-500 dark:text-blue-400">Subjects</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Browse the subjects available in your dashboard and continue your learning journey.
        </p>

        {(role === "teacher" || role === "admin") && (
          <button
            className="mb-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={() => setShowAddPopup(true)}
          >
            Add Subject
          </button>
        )}

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
          {subjects && subjects.length > 0 ? (
            subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500 dark:text-gray-400">
              No subjects found for your class.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
