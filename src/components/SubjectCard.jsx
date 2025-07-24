import React from "react";
import { Layers3, BookOpen, Briefcase, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

const iconMap = {
  "Technology & Programming": BookOpen,
  "Business & Marketing": Briefcase,
  "Design & Creative Arts": Palette,
};

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const Icon = iconMap[subject.name] || Layers3;

  const handleClick = () => {
    navigate(`/subject/${subject.id}`);
  };

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-left border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={e => { if (e.key === 'Enter') handleClick(); }}
    >
      {subject.tag && (
        <div className="absolute top-4 right-4">
          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full transition-colors">
            {subject.tag}
          </span>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-xl w-fit mb-4 transition-colors">
        <Icon className="w-6 h-6 text-blue-500 dark:text-blue-300" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {subject.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{subject.description}</p>
    </div>
  );
};

export default SubjectCard;
