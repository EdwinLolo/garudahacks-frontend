import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";

const MaterialDetail = () => {
  const { id: subjectId } = useParams();
  const { subjects } = useSubjectContext();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('materials/get-materials');
        const data = await response.json();
        const filtered = Array.isArray(data) ? data.filter(m => String(m.subject_id) === String(subjectId)) : [];
        setMaterials(filtered);
      } catch {
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [subjectId]);

  if (loading) {
    return <Loading />;
  }
  if (!materials.length) {
    return <div className="p-6 text-center text-red-500">Material not found.</div>;
  }
  const subject = subjects.find((s) => String(s.subject_id) === String(subjectId));
  const subjectName = subject
    ? subject.name || subject.title
    : materials[0].subject_name || "Material Detail";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-8">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-6">{subjectName}</h1>
      <div className="space-y-4">
        {materials.map((material) => (
          <div key={material.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">{material.nama_materi || "Unknown Material"}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialDetail;
