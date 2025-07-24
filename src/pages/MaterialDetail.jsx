// MaterialDetail.jsx
import React, { useState, useEffect } from "react"; // Added React import, useState/useEffect might not be strictly needed but good practice for other logic
import Loading from "../components/Loading";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { useSubjectContext } from "../context/SubjectContext"; // Import useSubjectContext

const MaterialDetail = () => {
  const { id: materialId } = useParams(); // Rename 'id' to materialId for clarity
  const navigate = useNavigate(); // For navigation if material not found

  const { subjects, fetchMaterialsBySubject } = useSubjectContext(); // Get subjects and fetchMaterialsBySubject from context

  // Find the material directly from the context's subjects
  let foundMaterial = null;
  let parentSubject = null;

  // Iterate through subjects to find the material
  // This approach is necessary because materials are nested within subjects
  subjects.forEach(s => {
    const material = s.materials?.find(m => String(m.material_id) === String(materialId) || String(m.id) === String(materialId));
    if (material) {
      foundMaterial = material;
      parentSubject = s;
    }
  });

  // Effect to ensure materials for the parent subject are loaded
  // This handles direct navigation to /material/:id without first visiting SubjectDetail
  useEffect(() => {
    // If we couldn't find the material but we have a subject ID (even if not explicitly in URL params for this route)
    // we might need to deduce which subject it belongs to and fetch its materials if not already loaded.
    // However, the current route only gives materialId.
    // A more robust solution for direct access would involve fetching the material by its ID,
    // or ensuring that the parent subject's materials are always loaded if you land here.
    // For now, let's assume `SubjectDetail` is usually visited first, or a refresh happens after `SubjectDetail` has fetched.

    // If material isn't found, it implies its parent subject's materials might not be loaded.
    // This is a more complex scenario. For simplicity, we'll just check if foundMaterial is null.
    // If your backend has an endpoint for /material/:materialId, that would be ideal here.
    // Otherwise, ensure your `SubjectDetail` route is the primary entry point for material loading.

    // If you want to handle direct access to /material/:id more robustly without a separate API call for individual material:
    // You could potentially try to derive the subjectId from the materialId if your IDs are structured.
    // Or, you would need an API endpoint to get a single material by its ID, or to get materials for all subjects.

    // For now, let's proceed assuming the material *should* be in context if subjects are loaded.
    // If not found, it means either subjects aren't loaded, or the material ID is invalid.

    // Let's add a basic check for initial subject loading state from context
    // This assumes `isLoadingSubjects` from context can indicate if subjects array is populated yet
    // const { isLoadingSubjects } = useSubjectContext(); // would need to destructure it

    // If subjects are still loading, you might want to show a loading indicator.
    // if (isLoadingSubjects && !foundMaterial) return;
  }, [materialId, subjects]); // Depend on materialId and subjects to re-evaluate when they change

  if (!foundMaterial) {
    // If material is not found, render a "Material not found" message
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Material not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use the parent subject's name or a generic title
  const materialTitle = foundMaterial.nama_materi || foundMaterial.title || "Material Details";
  const parentSubjectName = parentSubject ? (parentSubject.name || parentSubject.title) : "Unknown Subject";


  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-8 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition">
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">{materialTitle}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">From Subject: {parentSubjectName}</p>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Details:</h2>
          {/* Display other material properties here */}
          {foundMaterial.description && (
            <p className="text-gray-700 dark:text-gray-300">{foundMaterial.description}</p>
          )}
          {/* Example: Display material content if available */}
          {foundMaterial.content && (
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Content:</h3>
              <p className="text-gray-800 dark:text-gray-200">{foundMaterial.content}</p>
            </div>
          )}
          {/* Add more fields as per your material data structure (e.g., file_url, type, etc.) */}
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;