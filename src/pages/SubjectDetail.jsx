import React, { useState } from "react";
import Loading from "../components/Loading";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";
import { getBaseUrl } from "../models/utils";

const SubjectDetail = () => {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const subjectId = String(id);
  const { subjects } = useSubjectContext();
  const subject = subjects.find((s) => String(s.subject_id) === subjectId);
  const [subjectMaterials, setSubjectMaterials] = React.useState([]);
  const [loadingMaterials, setLoadingMaterials] = React.useState(true);
  const [formData, setFormData] = useState({
    title: "",
    bahasa: "indonesia",
  });

  const getBaseUrl1 = getBaseUrl();

  React.useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch(`${getBaseUrl1}/materials/get-materials`);
        const data = await response.json();
        const filtered = Array.isArray(data)
          ? data.filter((m) => String(m.subject_id) === subjectId)
          : [];
        setSubjectMaterials(filtered);
      } catch {
        setSubjectMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, [subjectId]);

  React.useEffect(() => {
    const profileStr = localStorage.getItem("user_profile");
    let userRole = null;
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        userRole = profile.role || null;
      } catch {
        userRole = null;
      }
    }
    setRole(userRole);
    setLoadingRole(false);
  }, []);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${getBaseUrl1}/materials/post-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          subject_id: subjectId,
        }),
      });
      if (!response) {
        throw new Error("Failed to add material");
      }
      const newMaterial = response;
      setSubjectMaterials((prev) => [...prev, newMaterial]);
      setFormData({ title: "", bahasa: "indonesia" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding material:", error);
      // Optionally show an error message to the user
      alert("Failed to add material. Please try again.");
    }
  };

  if (loadingMaterials || loadingRole) {
    return <Loading />;
  }

  return (
    <section className="min-h-screen pt-24 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto max-w-4xl px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition">
          &larr; Back
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-3xl font-bold">{subject.name}</h2>
          </div>
          {/* Add description if available in subject */}
          {subject.description && (
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {subject.description}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Learning Materials</h3>
            {role === "teacher" ||
              (role === "admin" && (
                <button
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  {showAddForm ? "Cancel" : "Add Material"}
                </button>
              ))}
          </div>
          {(showAddForm && role === "teacher") ||
            (role === "admin" && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="mb-2 text-blue-700 dark:text-blue-300 font-semibold">
                  Prompt your material here
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                    />
                  </div>
                  <div className="mb-2">
                    <select
                      id="bahasa"
                      name="bahasa"
                      required
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:hover:bg-gray-700/70"
                      value={formData.bahasa}
                      onChange={handleInputChange}>
                      <option value="indonesia">Indonesia</option>
                      <option value="english">English</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    Submit
                  </button>
                </form>
              </div>
            ))}
          {subjectMaterials.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No materials available for this subject yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {subjectMaterials.map((material) => (
                <li
                  key={material.id}
                  className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                  <h4 className="text-lg font-bold mb-1 text-blue-700 dark:text-blue-300">
                    {material.nama_materi || material.title || "Material"}
                  </h4>
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
