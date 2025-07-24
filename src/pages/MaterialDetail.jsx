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
  const { materials } = useSubjectContext();
  const material = materials.find((m) => String(m.id) === String(id));

  if (!material) {
    return <div className="p-6 text-center text-red-500">Material not found.</div>;
  }

  const parsed = parseLessonPacket(material.lesson_packet);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-8">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">{parsed.title}</h1>
      {parsed.lessonPlan && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Lesson Plan for Teacher</h2>
          <div className="prose dark:prose-invert whitespace-pre-line">{parsed.lessonPlan}</div>
        </section>
      )}
      {parsed.readingPassage && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Reading Passage for Students</h2>
          <div className="prose dark:prose-invert whitespace-pre-line">{parsed.readingPassage}</div>
        </section>
      )}
      {parsed.worksheet && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Worksheet: Questions & Answers</h2>
          <div className="prose dark:prose-invert whitespace-pre-line">{parsed.worksheet}</div>
        </section>
      )}
    </div>
  );
};

export default MaterialDetail;
