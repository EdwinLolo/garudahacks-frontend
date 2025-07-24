import React from "react";
import { Layers3 } from "lucide-react";

const SubjectCard = ({ subject }) => {
  return (
    <div
      className="relative bg-white rounded-xl shadow-md p-6 text-left border border-gray-100"
    >
      {subject.tag && (
        <div className="absolute top-4 right-4">
          <span className="text-xs font-medium bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            {subject.tag}
          </span>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-xl w-fit mb-4">
        <Layers3 className="w-6 h-6 text-blue-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {subject.name}
      </h3>
      <p className="text-sm text-gray-600">{subject.description}</p>
    </div>
  );
};

export default SubjectCard;
