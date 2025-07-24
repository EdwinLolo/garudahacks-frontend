import React from "react";
import { useParams } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";

function parseLessonPacket(lessonPacket) {
  // Split the lesson packet into sections by double newlines and headings
  const sections = lessonPacket.split(/\n(?=\*\*\d+\.|\*\*\w)/g);
  const parsed = {};

  // Extract title
  const titleMatch = lessonPacket.match(/^\*\*(.*?)\*\*/);
  parsed.title = titleMatch ? titleMatch[1] : "Material Detail";

  // Extract each section
  sections.forEach((section) => {
    if (section.startsWith("**1. Simple Lesson Plan for Teacher:**")) {
      parsed.lessonPlan = section.replace("**1. Simple Lesson Plan for Teacher:**", "").trim();
    } else if (section.startsWith("**2. Reading Passage for Students:**")) {
      parsed.readingPassage = section.replace("**2. Reading Passage for Students:**", "").trim();
    } else if (section.startsWith("**3. Worksheet: Questions & Answers**")) {
      parsed.worksheet = section.replace("**3. Worksheet: Questions & Answers**", "").trim();
    }
  });

  return parsed;
}

const MaterialDetail = () => {
  const { id: subjectId } = useParams();
  const { subjects } = useSubjectContext();
  const [materials, setMaterials] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('https://garudahacks6-express-be-zy4zf.ondigitalocean.app/materials/get-materials');
        const data = await response.json();
        // Filter materials by subject_id
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
    return <div className="p-6 text-center text-blue-500">Loading...</div>;
  }
  if (!materials.length) {
    return <div className="p-6 text-center text-red-500">Material not found.</div>;
  }
  const subject = subjects.find((s) => String(s.subject_id) === String(subjectId));
  const subjectName = subject
    ? subject.name || subject.title
    : materials[0].subject_name || materials[0].nama_materi || "Material Detail";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-8">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-6">{subjectName}</h1>
      <div className="space-y-4">
        {materials.map((material) => (
          <div key={material.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">{material.nama_materi || material.title || "Material"}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialDetail;
