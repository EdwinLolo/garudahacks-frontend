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
  const { id } = useParams();
  const { materials, subjects } = useSubjectContext();
  const material = materials.find((m) => String(m.id) === String(id));
  if (!material) {
    return <div className="p-6 text-center text-red-500">Material not found.</div>;
  }
  const subject = subjects.find((s) => String(s.subject_id) === String(material.subject_id));
  const subjectName = subject ? subject.name || subject.title : "Material Detail";

  // hasil_materi is a JSON string, parse it and extract lesson_packet
  let lessonPacket = "";
  try {
    const hasil = typeof material.hasil_materi === 'string' ? JSON.parse(material.hasil_materi) : material.hasil_materi;
    lessonPacket = hasil.lesson_packet || "";
  } catch {
    lessonPacket = material.lesson_packet || "";
  }
  const parsed = parseLessonPacket(lessonPacket);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-8">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-2">{subjectName}</h1>
      <h2 className="text-xl font-semibold mb-6">{material.nama_materi || parsed.title}</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
        {parsed.lessonPlan && (
          <section className="mb-4">
            <h4 className="text-md font-semibold mb-1">Lesson Plan for Teacher</h4>
            <div className="prose dark:prose-invert whitespace-pre-line">{parsed.lessonPlan}</div>
          </section>
        )}
        {parsed.readingPassage && (
          <section className="mb-4">
            <h4 className="text-md font-semibold mb-1">Reading Passage for Students</h4>
            <div className="prose dark:prose-invert whitespace-pre-line">{parsed.readingPassage}</div>
          </section>
        )}
        {parsed.worksheet && (
          <section className="mb-4">
            <h4 className="text-md font-semibold mb-1">Worksheet: Questions & Answers</h4>
            <div className="prose dark:prose-invert whitespace-pre-line">{parsed.worksheet}</div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MaterialDetail;
