import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";

// Utility function to render simple Markdown (e.g., bold, italics) to HTML
// For more complex Markdown, consider a library like 'marked' or 'showdown'
const renderMarkdown = (markdownText) => {
  if (!markdownText) return "";
  let html = markdownText;

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // You can add more Markdown rules here if needed, e.g., for lists or headers
  return html;
};

const MaterialDetail = () => {
  const { subjectId, materialId } = useParams();
  const navigate = useNavigate();

  const { subjects, fetchMaterialsBySubject, isLoadingSubjects, subjectsError } = useSubjectContext();

  const [foundMaterial, setFoundMaterial] = useState(null);
  const [parentSubject, setParentSubject] = useState(null);
  const [parsedHasilMateri, setParsedHasilMateri] = useState(null);
  const [loadingMaterialDetail, setLoadingMaterialDetail] = useState(true);

  // Quiz-specific states
  const [userAnswers, setUserAnswers] = useState({}); // Stores student's answers { questionNumber: answer }
  const [isSubmitted, setIsSubmitted] = useState(false); // True after student submits quiz
  const [gradedResults, setGradedResults] = useState(null); // Stores grading outcome
  const [showStudentScores, setShowStudentScores] = useState(false); // To toggle teacher's view of student scores

  const userProfile = JSON.parse(localStorage.getItem("user_profile") || '{}');
  const userRole = userProfile ? userProfile.role : null;
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';
  const isStudent = userRole === 'student';

  useEffect(() => {
    setLoadingMaterialDetail(true);
    setFoundMaterial(null);
    setParentSubject(null);
    setParsedHasilMateri(null);
    // Reset quiz states on material change
    setUserAnswers({});
    setIsSubmitted(false);
    setGradedResults(null);
    setShowStudentScores(false);

    // 1. Find the subject from the *current* `subjects` array in context
    const currentSubjectInContext = subjects.find(s => String(s.subject_id) === String(subjectId));

    if (!currentSubjectInContext) {
      // If subject is not found in the context (and no global loading/error),
      // it means the subject itself might be invalid or not loaded yet.
      if (!isLoadingSubjects && !subjectsError) {
        setLoadingMaterialDetail(false);
      }
      return;
    }

    // 2. Attempt to find the material within this subject's materials
    let materialInSubject = null;
    if (currentSubjectInContext.materials) {
      materialInSubject = currentSubjectInContext.materials.find(m =>
        String(m.materials_id) === String(materialId)
      );
    }

    if (materialInSubject) {
      // 3. If material is found in the current context data
      setFoundMaterial(materialInSubject);
      setParentSubject(currentSubjectInContext);

      // Handle hasil_materi (can be an object or a JSON string)
      if (materialInSubject.hasil_materi) {
        let parsedData = null;
        if (typeof materialInSubject.hasil_materi === 'object') {
          parsedData = materialInSubject.hasil_materi; // It's already an object, use directly
        } else if (typeof materialInSubject.hasil_materi === 'string') {
          try {
            parsedData = JSON.parse(materialInSubject.hasil_materi);
          } catch (error) {
            console.error("Error parsing hasil_materi (string):", error);
            parsedData = null;
          }
        }

        // Apply markdown rendering to specific fields if parsedData exists
        if (parsedData) {
          if (parsedData.rencana_belajar) {
            parsedData.rencana_belajar = renderMarkdown(parsedData.rencana_belajar);
          }
          if (parsedData.materi_belajar) {
            parsedData.materi_belajar = renderMarkdown(parsedData.materi_belajar);
          }
        }
        setParsedHasilMateri(parsedData);

        // Pre-fill answers for teachers/admins
        if (parsedData && isTeacherOrAdmin && parsedData.kunci_jawaban) {
          const prefilledAnswers = {};
          parsedData.kunci_jawaban.forEach(answer => {
            if (answer.number) {
              prefilledAnswers[answer.number] = answer.answer;
            }
          });
          setUserAnswers(prefilledAnswers);
        }

      } else {
        setParsedHasilMateri(null); // Clear if hasil_materi is missing
      }
      setLoadingMaterialDetail(false); // Material found, stop loading
    } else {
      // 4. Material not found in current context. Check if materials for this subject need fetching.
      if (!isLoadingSubjects && !subjectsError && !currentSubjectInContext.materials) {
        fetchMaterialsBySubject(subjectId)
          .then(() => {
            // Fetch completed. The `subjects` dependency will cause useEffect to re-run
            // in the next render cycle with the updated context data.
          })
          .catch(error => {
            console.error("Failed to fetch materials for subject within MaterialDetail:", error);
            setLoadingMaterialDetail(false); // Stop loading on fetch error
          });
      } else {
        if (!isLoadingSubjects && !subjectsError) {
          setLoadingMaterialDetail(false);
        }
      }
    }
  }, [materialId, subjectId, subjects, fetchMaterialsBySubject, isLoadingSubjects, subjectsError, isTeacherOrAdmin]); // Added isTeacherOrAdmin to dependencies

  // Handlers for quiz form
  const handleAnswerChange = (questionNumber, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: value
    }));
  };

  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    if (!parsedHasilMateri || !parsedHasilMateri.latihan_soal || !parsedHasilMateri.kunci_jawaban) {
      alert("Quiz data is incomplete.");
      return;
    }

    const results = {};
    let correctCount = 0;
    let totalGradable = 0;

    parsedHasilMateri.latihan_soal.forEach(question => {
      const questionNumber = question.number;
      const userAnswer = userAnswers[questionNumber];
      const correctAnswerObj = parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber);
      const correctAnswer = correctAnswerObj ? correctAnswerObj.answer : null;

      if (question.type === "multiple_choice") {
        totalGradable++;
        const isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
        results[questionNumber] = {
          userAnswer: userAnswer || '',
          correctAnswer: correctAnswer || 'N/A',
          isCorrect: isCorrect,
          status: isCorrect ? 'Correct' : 'Incorrect'
        };
        if (isCorrect) {
          correctCount++;
        }
      } else if (question.type === "short_answer" || question.type === "essay") {
        results[questionNumber] = {
          userAnswer: userAnswer || '',
          correctAnswer: 'Awaiting manual grading',
          isCorrect: null, 
          status: 'Awaiting Manual Grading'
        };
      }
    });

    setGradedResults({
      score: `${correctCount} / ${totalGradable}`,
      details: results
    });
    setIsSubmitted(true);

    // TODO: Send userAnswers to backend API here
    console.log("Quiz submitted! User answers:", userAnswers);
    console.log("Graded Results:", results);
    // Example of a placeholder API call (you'll need to implement your actual API)
    /*
    fetch('/api/submit-quiz-answers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
            materialId: materialId,
            subjectId: subjectId,
            studentId: userProfile.id, // Assuming userProfile has student ID
            answers: userAnswers,
            grade: `${correctCount}/${totalGradable}` // Only for auto-graded part
        })
    }).then(response => response.json())
      .then(data => console.log('Submission successful:', data))
      .catch(error => console.error('Submission failed:', error));
    */
  };

  const handleCheckStudentScores = () => {
    setShowStudentScores(prev => !prev);
    // TODO: Fetch student scores from backend API here
    console.log(`Teacher/Admin clicked to check student scores for Material ID: ${materialId}`);
    // Example placeholder API call (you'll need to implement your actual API)
    /*
    fetch(`/api/material-submissions/${materialId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    }).then(response => response.json())
      .then(data => {
          console.log('Fetched student submissions:', data);
          // Set state to display fetched submissions in UI
      })
      .catch(error => console.error('Failed to fetch student submissions:', error));
    */
  };


  // --- Render Logic for Loading, Error, and Not Found States ---
  if (isLoadingSubjects || loadingMaterialDetail) {
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

  if (!foundMaterial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Material not found</h2>
          <p className="text-gray-500 dark:text-gray-400">The material with ID "{materialId}" could not be found within subject "{subjectId}".</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Define derived values after foundMaterial is confirmed
  const materialTitle = foundMaterial.nama_materi || "Material Details";
  const parentSubjectName = parentSubject ? (parentSubject.name || parentSubject.title) : "Unknown Subject";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 pt-22 pb-6 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition">
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">{materialTitle}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">From Subject: {parentSubjectName}</p>

      <div className="space-y-4">
        {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Basic Details:</h2>
          {foundMaterial.description && (
            <p className="text-gray-700 dark:text-gray-300">{foundMaterial.description}</p>
          )}
          {foundMaterial.content && (
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Direct Content:</h3>
              <p className="text-gray-800 dark:text-gray-200">{foundMaterial.content}</p>
            </div>
          )}
        </div> */}

        {/* Displaying parsed hasil_materi content */}
        {parsedHasilMateri && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700 mt-4">
            {parsedHasilMateri.rencana_belajar && (
              <>
                <h2 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-300">Rencana Belajar (Learning Plan):</h2>
                <div
                  className="prose dark:prose-invert max-w-none mb-6 text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: parsedHasilMateri.rencana_belajar }}
                />
              </>
            )}

            {parsedHasilMateri.materi_belajar && (
              <>
                <h2 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-300">Materi Belajar (Learning Material):</h2>
                <div
                  className="prose dark:prose-invert max-w-none mb-6 text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: parsedHasilMateri.materi_belajar }}
                />
              </>
            )}

            {parsedHasilMateri.latihan_soal && parsedHasilMateri.latihan_soal.length > 0 && (
              <form onSubmit={handleSubmitQuiz}>
                <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-300">Latihan Soal (Practice Questions):</h2>
                <ol className="list-decimal pl-5 space-y-6">
                  {parsedHasilMateri.latihan_soal.map((question) => {
                    const questionNumber = question.number;
                    const correctAnswerObj = parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber);
                    const correctAnswer = correctAnswerObj ? correctAnswerObj.answer : '';

                    return (
                      <li key={questionNumber} className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                          {/* Removed explicit question.number here to avoid duplicate numbering */}
                          {question.question}
                        </p>

                        {question.type === "multiple_choice" && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`q${questionNumber}-opt${optIndex}`}
                                  name={`question-${questionNumber}`}
                                  value={option}
                                  onChange={() => handleAnswerChange(questionNumber, option)}
                                  checked={userAnswers[questionNumber] === option}
                                  disabled={isSubmitted && isStudent} // Disable after student submits
                                  className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out dark:bg-gray-800 dark:border-gray-600"
                                />
                                <label
                                  htmlFor={`q${questionNumber}-opt${optIndex}`}
                                  className={`ml-2 text-gray-700 dark:text-gray-300 ${isTeacherOrAdmin && option === correctAnswer ? 'font-bold text-green-600 dark:text-green-400' : ''}`}
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {(question.type === "short_answer" || question.type === "essay") && (
                          <textarea
                            rows={question.type === "essay" ? 6 : 2}
                            value={isTeacherOrAdmin ? correctAnswer : (userAnswers[questionNumber] || '')}
                            onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
                            readOnly={isTeacherOrAdmin || (isSubmitted && isStudent)} // Read-only for teachers/admins or after student submission
                            placeholder={isTeacherOrAdmin ? "Correct Answer (Teacher View)" : "Your answer..."}
                            className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
                          />
                        )}

                        {isSubmitted && gradedResults && gradedResults.details[questionNumber] && (
                          <div className="mt-2 text-sm">
                            <p className={`font-semibold ${gradedResults.details[questionNumber].isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Status: {gradedResults.details[questionNumber].status}
                            </p>
                            {question.type === "multiple_choice" && !gradedResults.details[questionNumber].isCorrect && (
                              <p className="text-gray-600 dark:text-gray-400">
                                Correct Answer: {gradedResults.details[questionNumber].correctAnswer}
                              </p>
                            )}
                            {(question.type === "short_answer" || question.type === "essay") && (
                              <p className="text-gray-600 dark:text-gray-400">
                                Your Answer: {gradedResults.details[questionNumber].userAnswer || 'No answer provided'}
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>

                {isStudent && !isSubmitted && (
                  <button
                    type="submit"
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg">
                    Submit Quiz
                  </button>
                )}
                {isStudent && isSubmitted && gradedResults && (
                  <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-semibold text-center text-xl">
                    Your Score: {gradedResults.score}
                  </div>
                )}
              </form>
            )}

            {isTeacherOrAdmin && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-300">Teacher/Admin Tools</h2>
                <button
                  onClick={handleCheckStudentScores}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out font-semibold text-lg">
                  {showStudentScores ? 'Hide Student Scores' : 'Check Student Scores for this Material'}
                </button>

                {showStudentScores && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                    <p className="italic">
                      Placeholder: This section would display a list of students' scores and their answers for this material.
                      You need to implement a backend API to fetch this data.
                    </p>
                    {/* Example of what could be displayed here if you fetch data */}
                    {/*
                            <ul className="mt-4 space-y-2">
                                <li><strong>Student A:</strong> Score 4/5, Answers: ...</li>
                                <li><strong>Student B:</strong> Score 3/5, Answers: ...</li>
                            </ul>
                            */}
                  </div>
                )}
              </div>
            )}


            {/* Kunci Jawaban (Answer Key) - Now only shown for Teacher/Admin or after student submission */}
            {parsedHasilMateri.kunci_jawaban && parsedHasilMateri.kunci_jawaban.length > 0 &&
              ((isTeacherOrAdmin && !showStudentScores) || (isStudent && isSubmitted)) && (
                <>
                  <h2 className="text-xl font-semibold mt-6 mb-4 text-blue-600 dark:text-blue-300">Kunci Jawaban (Answer Key):</h2>
                  <ol className="list-decimal pl-5 space-y-4">
                    {parsedHasilMateri.kunci_jawaban.map((answer) => (
                      // Removed answer.number here to avoid duplicate numbering
                      <li key={answer.number} className="mb-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          Answer: <span className="text-blue-700 dark:text-blue-400">{answer.answer}</span>
                        </p>
                        {answer.explanation && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Explanation: {answer.explanation}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDetail;