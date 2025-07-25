import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";
import { getBaseUrl } from "../models/utils";

const SubjectDetail = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState(null); 
  const [loadingRole, setLoadingRole] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialAddError, setMaterialAddError] = useState(null); // State for material add errors
  const [isAddingMaterial, setIsAddingMaterial] = useState(false); // State for add material loading

  const {
    subjects,
    fetchMaterialsBySubject,
    isLoadingSubjects,
    subjectsError,
  } = useSubjectContext();

  const { id } = useParams();
  const subjectId = String(id);
  const subject = subjects.find((s) => String(s.subject_id) === subjectId);

  const subjectMaterials = subject ? subject.materials || [] : [];

  const [formData, setFormData] = useState({
    title: "",
    bahasa: "indonesia",
  });

  useEffect(() => {
    async function loadMaterialsForSubject() {
      if (subject && !subject.materials) {
        setLoadingMaterials(true);
        await fetchMaterialsBySubject(subject.subject_id);
        setLoadingMaterials(false);
      }
    }
    if (!isLoadingSubjects && !subjectsError) {
      loadMaterialsForSubject();
    }
    console.log("SubjectDetail useEffect - subject:", subject);
  }, [subjectId, subject, fetchMaterialsBySubject, isLoadingSubjects, subjectsError]);

  // Effect to load user role from localStorage
  useEffect(() => {
    const profileStr = localStorage.getItem("user_profile");
    let userRole = null;
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        userRole = profile.role || null;
      } catch (error) {
        console.error("Error parsing user_profile from localStorage:", error);
        userRole = null;
      }
    }
    setRole(userRole);
    setLoadingRole(false);
  }, []);

  if (isLoadingSubjects || loadingMaterials || loadingRole) {
    return <Loading />;
  }

  if (subjectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error loading subjects</h2>
          <p>{subjectsError}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
          <p className="text-gray-500 dark:text-gray-400">The subject with ID "{subjectId}" could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
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
    setMaterialAddError(null); // Clear previous errors
    setIsAddingMaterial(true);
    try {
      const accessToken = localStorage.getItem("access_token"); // Get access token for authorization

      const response = await fetch(`${getBaseUrl()}/materials/post-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Include authorization header
        },
        body: JSON.stringify({
          title: formData.title, // Use title from formData
          bahasa: formData.bahasa, // Use bahasa from formData
          subject_id: subjectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add material with status: ${response.status}`);
      }

      setFormData({ title: "", bahasa: "indonesia" });
      setShowAddForm(false);
      await fetchMaterialsBySubject(subjectId); // Refetch materials after adding a new one
      setMaterialAddError(null); // Clear any previous errors
      console.log("Material added successfully");
    } catch (error) {
      console.error("Error adding material:", error);
      setMaterialAddError(`Failed to add material: ${error.message}`);
    } finally {
      setIsAddingMaterial(false);
    }
  };

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
          {subject.description && (
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {subject.description}
            </p>
          )}
          {subject.materialsError && (
            <p className="text-sm text-red-500 mt-2">{subject.materialsError}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Learning Materials</h3>
            {(role === "teacher" || role === "admin") && (
              <button
                onClick={() => setShowAddForm((prev) => !prev)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                {showAddForm ? "Cancel" : "Add Material"}
              </button>
            )}
          </div>
          {(showAddForm && (role === "teacher" || role === "admin")) && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="mb-2 text-blue-700 dark:text-blue-300 font-semibold">
                Prompt your material here
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <input
                    type="text"
                    name="title" // Added name attribute
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                  />
                </div>
                <div className="mb-2">
                  <select
                    id="bahasa"
                    name="bahasa" // Added name attribute
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isAddingMaterial}
                >
                  {isAddingMaterial ? 'Processing...' : 'Submit'}
                </button>
              </form>
            </div>
          )}
          {materialAddError && (
            <p className="text-sm text-red-500 mt-2 text-center">{materialAddError}</p>
          )}
          {subjectMaterials.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No materials available for this subject yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {subjectMaterials.map((material) => (
                <li
                  key={material.materials_id}
                  className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                  onClick={() => navigate(`/subject/${subjectId}/material/${material.materials_id}`)}
                >
                  <h4 className="text-lg font-bold mb-1 text-blue-700 dark:text-blue-300">
                    {material.nama_materi || "Material"}
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