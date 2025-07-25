import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { useParams, useNavigate } from "react-router-dom";
import { useSubjectContext } from "../context/SubjectContext";
import { getBaseUrl } from "../models/utils";

const renderMarkdown = (markdownText) => {
  if (!markdownText) return "";
  let html = markdownText;

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
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
  const [submissionError, setSubmissionError] = useState(null); // To show errors on quiz submission
  const [showStudentScores, setShowStudentScores] = useState(false); // To toggle teacher's view of student scores

  const [studentScoresList, setStudentScoresList] = useState([]);
  const [loadingStudentScores, setLoadingStudentScores] = useState(false); // New loading state for student scores

  const [showManualGradingForm, setShowManualGradingForm] = useState(false);
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState(null);
  const [manualGrades, setManualGrades] = useState({}); // Stores manual scores for short_answer/essay questions { qNum: score }
  const [manualGradingError, setManualGradingError] = useState(null);
  const [isUpdatingManualGrade, setIsUpdatingManualGrade] = useState(false);

  const userProfile = JSON.parse(localStorage.getItem("user_profile") || '{}');
  const userRole = userProfile ? userProfile.role : null;
  const currentUserId = userProfile ? userProfile.user_id : null; // Get current user's ID
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';
  const isStudent = userRole === 'student';

  // State to hold the fetched existing grade data (if any) for the student
  const [existingGrade, setExistingGrade] = useState(null);
  const [loadingExistingGrade, setLoadingExistingGrade] = useState(false);

  useEffect(() => {
    setLoadingMaterialDetail(true);
    setFoundMaterial(null);
    setParentSubject(null);
    setParsedHasilMateri(null);
    // Reset quiz states on material change
    setUserAnswers({});
    setIsSubmitted(false);
    setGradedResults(null);
    setSubmissionError(null);
    setShowStudentScores(false);
    setExistingGrade(null); // Reset existing grade status
    setStudentScoresList([]); // Reset student scores list

    setShowManualGradingForm(false);
    setSelectedStudentSubmission(null);
    setManualGrades({});
    setManualGradingError(null);
    setIsUpdatingManualGrade(false);

    const currentSubjectInContext = subjects.find(s => String(s.subject_id) === String(subjectId));

    if (!currentSubjectInContext) {
      if (!isLoadingSubjects && !subjectsError) {
        setLoadingMaterialDetail(false);
      }
      return;
    }

    let materialInSubject = null;
    if (currentSubjectInContext.materials) {
      materialInSubject = currentSubjectInContext.materials.find(m =>
        String(m.materials_id) === String(materialId)
      );
    }

    if (materialInSubject) {
      setFoundMaterial(materialInSubject);
      setParentSubject(currentSubjectInContext);

      if (materialInSubject.hasil_materi) {
        let parsedData = null;
        if (typeof materialInSubject.hasil_materi === 'object') {
          parsedData = materialInSubject.hasil_materi;
        } else if (typeof materialInSubject.hasil_materi === 'string') {
          try {
            parsedData = JSON.parse(materialInSubject.hasil_materi);
          } catch (error) {
            console.error("Error parsing hasil_materi (string):", error);
            parsedData = null;
          }
        }

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
        // Teachers/Admins should see the correct answers, so prefill with them
        if (parsedData && isTeacherOrAdmin && parsedData.kunci_jawaban) {
          const prefilledAnswers = {};
          parsedData.kunci_jawaban.forEach(answer => {
            if (answer.number) {
              prefilledAnswers[answer.number] = answer.answer;
            }
          });
          setUserAnswers(prefilledAnswers);
        }

        // --- FETCH EXISTING GRADE FOR STUDENT ---
        if (isStudent && currentUserId) { // Only fetch existing grade for students
          setLoadingExistingGrade(true);
          fetch(`${getBaseUrl()}/grade/user/${currentUserId}/${materialId}`)
            .then(async response => { // Mark this .then as async
              // Step 1: Handle initial HTTP status codes
              if (!response.ok && response.status !== 400 && response.status !== 404) {
                throw new Error(`Error fetching existing grade: ${response.status} ${response.statusText}`);
              }

              // Step 2: Read the response body as text to check if it's empty/malformed
              const text = await response.text(); // Await reading the body as text

              // Step 3: Handle empty responses or specific "not found" scenarios
              if (!text) {
                // If the backend returns 200 OK but with an empty body, treat as no data
                if (response.status === 200 || response.status === 400 || response.status === 404) {
                  console.log(`No grade data found for user ${currentUserId} and material ${materialId}.`);
                  return null; // Explicitly return null if no content
                }
              }

              // Step 4: Attempt to parse the text as JSON
              try {
                const data = JSON.parse(text);

                // Supabase's .single() will return null if no row is found,
                // so `data` might be `null` directly in this case.
                // It won't return an array with .single().
                // If `data` is `null` (from Supabase .single() when no row) or an empty object `{}`,
                // it means no grade was effectively found.
                if (data === null || (typeof data === 'object' && Object.keys(data).length === 0)) {
                  console.log(`Supabase .single() returned null or empty object for user ${currentUserId} material ${materialId}.`);
                  return null;
                }

                return data; // Return the parsed JSON object
              } catch (jsonParseError) {
                console.error("Error parsing JSON for existing grade:", jsonParseError, "Response text:", text);
                throw new Error("Invalid JSON response from server for existing grade.");
              }
            })
            .then(data => {
              // This `data` will now correctly be the parsed JSON object or `null`
              console.log("Fetched existing grade data:", data); // This should now show actual data or null
              // Treat null, empty object, or error property as no grade
              if (
                data &&
                !(typeof data === 'object' && Object.keys(data).length === 0) &&
                !(typeof data === 'object' && data.error)
              ) {
                setExistingGrade(data); // Set the grade data
                setIsSubmitted(true); // Mark as submitted if grade exists
                setGradedResults({ // Populate gradedResults for display if needed
                  score: data.grade, // Assuming 'grade' field holds the score
                  status: data.status // Assuming 'status' field holds the status
                });

                if (data.answers) {
                  try {
                    // Parse the answers string into a JavaScript object
                    const parsedAnswers = JSON.parse(data.answers);
                    setUserAnswers(parsedAnswers);
                    console.log("Parsed existing answers for student:", parsedAnswers);
                  } catch (parseError) {
                    console.error("Error parsing answers string from backend:", parseError);
                    setUserAnswers({}); // Fallback to empty if parsing fails
                  }
                }
              } else {
                // If `data` is null, empty object, or error (no existing grade found)
                setExistingGrade(null);
                setIsSubmitted(false); // Make sure these are reset
                setGradedResults(null);
                setUserAnswers({}); // Clear any previous answers
              }
            })
            .catch(error => {
              console.error("Error fetching existing grade:", error);
              // Removed the .includes("400") check as the new logic handles status codes more explicitly
              setSubmissionError("Failed to load your previous submission. Please try again.");
            })
            .finally(() => {
              setLoadingExistingGrade(false);
            });
        }
      } else {
        setParsedHasilMateri(null);
      }
      setLoadingMaterialDetail(false);
    } else {
      if (!isLoadingSubjects && !subjectsError && !currentSubjectInContext.materials) {
        fetchMaterialsBySubject(subjectId)
          .then(() => { })
          .catch(error => {
            console.error("Failed to fetch materials for subject within MaterialDetail:", error);
            setLoadingMaterialDetail(false);
          });
      } else {
        if (!isLoadingSubjects && !subjectsError) {
          setLoadingMaterialDetail(false);
        }
      }
    }
  }, [materialId, subjectId, subjects, fetchMaterialsBySubject, isLoadingSubjects, subjectsError, isTeacherOrAdmin, isStudent, currentUserId]);

  const handleAnswerChange = (questionNumber, value) => {
    const question = parsedHasilMateri?.latihan_soal.find(q => q.number === questionNumber);
    console.log('Handling answer change for question:', questionNumber);
    console.log('Question details:', question);

    let cleanedValue = value;

    if (question && question.type === "multiple_choice") {
      cleanedValue = value[0];
    }

    console.log('Cleaning value for question:', questionNumber, 'Result:', cleanedValue);

    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: cleanedValue
    }));
    console.log('Updated user answers:', userAnswers);
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!parsedHasilMateri || !parsedHasilMateri.latihan_soal || !parsedHasilMateri.kunci_jawaban) {
      setSubmissionError("Quiz data is incomplete. Cannot submit.");
      return;
    }

    if (!currentUserId) {
      setSubmissionError("User not logged in. Cannot submit quiz.");
      return;
    }

    setSubmissionError(null); // Clear previous errors

    const results = {};
    let correctCount = 0;
    let totalGradableAuto = 0;
    let totalQuestions = 0;
    let needsManualGrading = false;

    parsedHasilMateri.latihan_soal.forEach(question => {
      totalQuestions++;

      const questionNumber = question.number;
      console.log('Processing question:', questionNumber);

      const userAnswer = userAnswers[questionNumber];
      console.log('User answer for question:', questionNumber, 'is:', userAnswer);

      const correctAnswerObj = parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber);
      console.log('Correct answer object for question:', questionNumber, 'is:', correctAnswerObj);

      const correctAnswer = correctAnswerObj ? correctAnswerObj.answer : null;
      console.log('Correct answer for question:', questionNumber, 'is:', correctAnswer);

      if (question.type === "multiple_choice") {
        totalGradableAuto++;
        let userAnswerLetter = '';
        if (userAnswer && typeof userAnswer === 'string') {
          userAnswerLetter = userAnswer;
        }
        console.log('User answer letter for question:', questionNumber, 'is:', userAnswerLetter);

        const isCorrect = userAnswerLetter === String(correctAnswer).trim().toUpperCase();
        console.log(`User answer letter: ${userAnswerLetter}, Correct answer: ${correctAnswer}, Is correct: ${isCorrect}`);

        results[questionNumber] = {
          userAnswer: userAnswer || '',
          correctAnswer: correctAnswer || 'N/A',
          isCorrect: isCorrect,
          status: isCorrect ? 'Correct' : 'Incorrect'
        };
        console.log('Result for question Auto:', questionNumber, 'is:', results[questionNumber]);
        if (isCorrect) {
          correctCount++;
        }
      } else if (question.type === "short_answer" || question.type === "essay") {
        needsManualGrading = true;
        results[questionNumber] = {
          userAnswer: userAnswer || '',
          correctAnswer: 'Awaiting manual grading',
          isCorrect: null,
          status: 'Awaiting Manual Grading'
        };
        console.log('Result for question Manual:', questionNumber, 'is:', results[questionNumber]);
      }
    });

    // Calculate grade as a percentage based on totalQuestions
    // The score is based on correctly answered auto-gradable questions out of ALL questions.
    const calculatedGradePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    setGradedResults({
      score: calculatedGradePercentage,
      details: results
    });
    setIsSubmitted(true);

    // --- API Call to Submit Grade ---
    try {
      const payload = {
        user_id: currentUserId,
        materials_id: materialId,
        grade: calculatedGradePercentage, // Send percentage to backend
        status: !needsManualGrading, // Status is true if NO manual grading is needed, false otherwise
        answers: userAnswers // Send user's answers as JSON
      };

      console.log("Submitting quiz with payload:", payload);

      const response = await fetch(`${getBaseUrl()}/grade/grade-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Quiz submission successful:', data);
      setExistingGrade(data.grade);
      // You might also want to update the existingGrade status based on the backend response
      // if data contains a 'status' field indicating full grading completion.
      // E.g., setExistingGrade(prev => ({ ...prev, status: data.status }));

    } catch (error) {
      console.error('Error submitting quiz:', error);
      setSubmissionError(`Failed to submit quiz: ${error.message}`);
      setIsSubmitted(false);
    }
  };

  const handleCheckStudentScores = async () => {
    setShowStudentScores(prev => {
      if (!prev) { // If about to show, clear existing list and start loading
        setStudentScoresList([]);
        setLoadingStudentScores(true);
      }
      return !prev;
    });

    if (!showStudentScores) { // If about to show the scores
      console.log(`Teacher/Admin clicked to check student scores for Material ID: ${materialId}`);

      setStudentScoresList([]); // Clear previous scores
      setLoadingStudentScores(true); // Start loading scores
      setManualGradingError(null); // Clear any previous manual grading error

      try {
        const scoresResponse = await fetch(`${getBaseUrl()}/grade/material/${materialId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_token')}`
          }
        });

        if (!scoresResponse.ok) {
          const errorData = await scoresResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${scoresResponse.status}`);
        }

        const scoresData = await scoresResponse.json();
        console.log('Student scores fetched successfully:', scoresData);
        setStudentScoresList(scoresData);
      } catch (error) {
        console.error('Error fetching student scores or profiles:', error);
        setStudentScoresList([]);
        setSubmissionError(`Failed to load student scores or profiles: ${error.message}`);
      } finally {
        setLoadingStudentScores(false); // End loading scores
      }
    }
  };

  const handleOpenManualGrading = (submission) => {
    setSelectedStudentSubmission(submission);
    setManualGradingError(null);
    const initialManualGrades = {};
    const studentAnswers = JSON.parse(submission.answers || '{}');

    // Initialize manual grades. For short_answer/essay, prepare an input.
    // Assuming grades are out of 100 for each question.
    parsedHasilMateri.latihan_soal.forEach(question => {
      if (question.type === "short_answer" || question.type === "essay") {
        // You might want to pre-fill with a default or existing manual grade if your backend stores it per question
        initialManualGrades[question.number] = '';
      }
    });

    setManualGrades(initialManualGrades);
    setShowManualGradingForm(true);
  };

  const handleManualGradeChange = (questionNumber, score) => {
    // Ensure score is a number, clamp between 0 and 100
    let numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0) numericScore = 0;
    if (numericScore > 100) numericScore = 100;

    setManualGrades(prev => ({
      ...prev,
      [questionNumber]: numericScore
    }));
  };

  const handleSubmitManualGrades = async () => {
    if (!selectedStudentSubmission) return;

    setManualGradingError(null);
    setIsUpdatingManualGrade(true);

    try {
      // Only sum the manual grades for short_answer/essay questions, each max 0-20
      const questions = parsedHasilMateri?.latihan_soal || [];
      let totalManualGradedScore = 0;
      let manualCount = 0;
      questions.forEach(question => {
        if (question.type === "short_answer" || question.type === "essay") {
          let score = manualGrades[question.number] || 0;
          // Clamp score between 0 and 20
          if (score < 0) score = 0;
          if (score > 20) score = 20;
          totalManualGradedScore += score;
          manualCount++;
        }
      });

      // The grade is just the sum of manual grades (max possible: manualCount * 20)
      // If you want to send as percentage, you can do: (totalManualGradedScore / (manualCount * 20)) * 100
      // But as per request, just sum the grades
      const isFullyGraded = questions
        .filter(q => q.type === "short_answer" || q.type === "essay")
        .every(q => manualGrades[q.number] !== undefined && manualGrades[q.number] !== null && manualGrades[q.number] >= 0);

      const payload = {
        grade: totalManualGradedScore,
        status: isFullyGraded,
      };

      console.log("Submitting manual grade update with payload:", payload);

      const response = await fetch(`${getBaseUrl()}/grade/update-grade/${selectedStudentSubmission.user_id}/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedGradeEntry = await response.json();
      console.log('Manual grade update successful:', updatedGradeEntry);

      // Refetch the student scores list to get the latest grades from backend
      try {
        setLoadingStudentScores(true);
        const scoresResponse = await fetch(`${getBaseUrl()}/grade/material/${materialId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_token')}`
          }
        });
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          setStudentScoresList(scoresData);
        }
      } catch (e) {
        console.error('Error fetching updated student scores:', e);
        setSubmissionError(`Failed to refresh student scores: ${e.message}`);
      } finally {
        setLoadingStudentScores(false);
      }

      setShowManualGradingForm(false);
      setSelectedStudentSubmission(null);
      setManualGrades({});
    } catch (error) {
      console.error('Error updating manual grade:', error);
      setManualGradingError(`Failed to update grade: ${error.message}`);
    } finally {
      setIsUpdatingManualGrade(false);
    }
  };

  // Add loadingStudentScores to the main loading check
  if (isLoadingSubjects || loadingMaterialDetail || (isStudent && loadingExistingGrade)) {
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

  const materialTitle = foundMaterial.nama_materi || "Material Details";
  const parentSubjectName = parentSubject ? (parentSubject.name || parentSubject.title) : "Unknown Subject";

  const shouldShowQuizForm = isStudent && parsedHasilMateri?.latihan_soal?.length > 0 && !isSubmitted && !existingGrade;
  const shouldShowResults = (isStudent && (isSubmitted || existingGrade)) || isTeacherOrAdmin;

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
              <>
                <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-300">Latihan Soal (Practice Questions):</h2>

                {submissionError && (
                  <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-300 dark:border-red-800">
                    Error: {submissionError}
                  </div>
                )}

                {shouldShowQuizForm ? (
                  <form onSubmit={handleSubmitQuiz}>
                    <ol className="list-decimal pl-5 space-y-6">
                      {parsedHasilMateri.latihan_soal.map((question) => {
                        const questionNumber = question.number;

                        return (
                          <li key={questionNumber} className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
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
                                      checked={
                                        isTeacherOrAdmin
                                          ? parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber)?.answer === option[0]
                                          : userAnswers[questionNumber] === option[0]
                                      } className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out dark:bg-gray-800 dark:border-gray-600"
                                    />
                                    <label
                                      htmlFor={`q${questionNumber}-opt${optIndex}`}
                                      className={`ml-2 text-gray-700 dark:text-gray-300`}
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
                                value={userAnswers[questionNumber] || ''}
                                onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
                                placeholder={"Your answer..."}
                                className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
                              />
                            )}
                          </li>
                        );
                      })}
                    </ol>

                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out font-semibold text-lg">
                      Submit Quiz
                    </button>
                  </form>
                ) : ( // Student has submitted or is Teacher/Admin, show results/pre-filled answers
                  <>
                    {isStudent && (isSubmitted || existingGrade) && (
                      <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Your Quiz Result:</h3>
                        <p className="text-xl font-bold">
                          Score: {existingGrade?.grade || gradedResults?.score || 'N/A'}
                        </p>
                        {existingGrade?.status === false && (
                          <p className="text-sm mt-1">Status: Some questions (free text) are awaiting manual grading.</p>
                        )}
                        {existingGrade?.status === true && (
                          <p className="text-sm mt-1">Status: All questions have been graded by teacher.</p>
                        )}
                      </div>
                    )}
                    <ol className="list-decimal pl-5 space-y-6">
                      {parsedHasilMateri.latihan_soal.map((question) => {
                        const questionNumber = question.number;
                        const correctAnswerObj = parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber);
                        const correctAnswer = correctAnswerObj ? correctAnswerObj.answer : '';
                        // Use userAnswers from state, which is populated by fetched existingGrade.answers or current session's answers
                        const studentAnswer = userAnswers[questionNumber] || '';

                        const isCorrect = (question.type === "multiple_choice" && String(studentAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase());
                        const statusText = (question.type === "multiple_choice") ? (isCorrect ? 'Correct' : 'Incorrect') : 'Awaiting Manual Grading';
                        const statusColor = (question.type === "multiple_choice") ? (isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-yellow-600 dark:text-yellow-400';

                        return (
                          <li key={questionNumber} className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
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
                                      checked={
                                        isTeacherOrAdmin
                                          ? parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber)?.answer === option[0]
                                          : userAnswers[questionNumber] === option[0]
                                      } readOnly
                                      disabled // Always disabled in this view mode
                                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out dark:bg-gray-800 dark:border-gray-600"
                                    />
                                    <label
                                      htmlFor={`q${questionNumber}-opt${optIndex}`}
                                      className={`ml-2 text-gray-700 dark:text-gray-300
                                                ${isTeacherOrAdmin && option.replace(/^[A-Z]\)\s*/, '') === correctAnswer ? 'font-bold text-green-600 dark:text-green-400' : ''}
                                                ${(isStudent && (isSubmitted || existingGrade) && option.replace(/^[A-Z]\)\s*/, '') === studentAnswer && !isCorrect && question.type === "multiple_choice") ? 'text-red-600 dark:text-red-400' : ''}
                                                ${(isStudent && (isSubmitted || existingGrade) && option.replace(/^[A-Z]\)\s*/, '') === correctAnswer && question.type === "multiple_choice") ? 'font-bold text-green-600 dark:text-green-400' : ''}
                                            `}
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
                                value={isTeacherOrAdmin ? correctAnswer : studentAnswer}
                                readOnly
                                disabled // Always disabled in this view mode
                                placeholder={isTeacherOrAdmin ? "Correct Answer (Teacher View)" : "Your answer..."}
                                className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
                              />
                            )}

                            {shouldShowResults && (
                              <div className="mt-2 text-sm">
                                {isStudent && (isSubmitted || existingGrade) && (
                                  <p className={`font-semibold ${statusColor}`}>
                                    Status: {statusText}
                                  </p>
                                )}
                                {isStudent && (isSubmitted || existingGrade) && (question.type === "multiple_choice") && !isCorrect && (
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Correct Answer: {correctAnswer}
                                  </p>
                                )}
                                {isTeacherOrAdmin && (
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Correct Answer: {correctAnswer}
                                  </p>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </>
                )}
              </>
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
                    <h3 className="text-lg font-semibold mb-3">Student Grades for this Material:</h3>
                    {(loadingStudentScores) ? (
                      <p className="text-center py-4">Loading student scores...</p>
                    ) : studentScoresList.length > 0 ? (
                      <ul className="space-y-4">
                        {studentScoresList.map((scoreEntry) => {
                          let parsedStudentAnswers = {};
                          try {
                            parsedStudentAnswers = JSON.parse(scoreEntry.answers || '{}');
                          } catch (e) {
                            console.error("Error parsing student answers for user:", scoreEntry.user_id, e);
                          }

                          const gradingStatusText = scoreEntry.status === false
                            ? 'Awaiting Manual Grading (Free text answers)'
                            : scoreEntry.status === true
                              ? 'Fully Graded'
                              : 'Unknown';

                          return (
                            <li key={scoreEntry.grade_id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                              <p className="font-semibold text-blue-700 dark:text-blue-300">Student/User ID: ${scoreEntry.user_id}`</p>
                              <p className="text-lg font-bold mt-1">Grade: <span className="text-green-600 dark:text-green-400">{scoreEntry.grade}</span></p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Status: {gradingStatusText}</p>

                              <div className="mt-3">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">Submitted Answers:</h4>
                                {Object.keys(parsedStudentAnswers).length > 0 ? (
                                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                    {Object.entries(parsedStudentAnswers).map(([qNum, ans]) => (
                                      <li key={`${scoreEntry.grade_id}-${qNum}`}>
                                        Question {qNum}: {String(ans).length > 50 ? String(ans).substring(0, 50) + '...' : String(ans)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm italic text-gray-500">No answers recorded or invalid format.</p>
                                )}
                              </div>
                              {scoreEntry.status === false && (
                                <button
                                  onClick={() => handleOpenManualGrading(scoreEntry)}
                                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                  Grade Short Answers
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">No student scores found for this material yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {showManualGradingForm && selectedStudentSubmission && parsedHasilMateri && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                    Grade Student Submission: {`User ID: ${selectedStudentSubmission.user_id}`}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Current Grade: {selectedStudentSubmission.grade}
                  </p>

                  {manualGradingError && (
                    <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-300 dark:border-red-800">
                      Error: {manualGradingError}
                    </div>
                  )}

                  <div className="space-y-6">
                    {parsedHasilMateri.latihan_soal
                      .filter(q => q.type === "short_answer" || q.type === "essay")
                      .map(question => {
                        const questionNumber = question.number;
                        const studentAnswer = JSON.parse(selectedStudentSubmission.answers || '{}')[questionNumber] || 'No answer provided.';
                        const correctAnswerObj = parsedHasilMateri.kunci_jawaban.find(ans => ans.number === questionNumber);
                        const correctAnswer = correctAnswerObj ? correctAnswerObj.answer : 'N/A';

                        return (
                          <div key={questionNumber} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              Question {questionNumber}: {question.question}
                            </p>
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Student's Answer:</p>
                              <p className="text-gray-600 dark:text-gray-400 italic break-words">{studentAnswer}</p>
                            </div>
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct Answer:</p>
                              <p className="text-gray-600 dark:text-gray-400 italic break-words">{correctAnswer}</p>
                            </div>
                            <label htmlFor={`manual-grade-${questionNumber}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Score (0-20 for this question):
                            </label>
                            <input
                              type="number"
                              id={`manual-grade-${questionNumber}`}
                              min="0"
                              max="20"
                              value={manualGrades[questionNumber] !== undefined ? manualGrades[questionNumber] : ''}
                              onChange={(e) => handleManualGradeChange(questionNumber, e.target.value)}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        );
                      })}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowManualGradingForm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      disabled={isUpdatingManualGrade}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitManualGrades}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      disabled={isUpdatingManualGrade}
                    >
                      {isUpdatingManualGrade ? 'Saving...' : 'Submit Grades'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {parsedHasilMateri.kunci_jawaban && parsedHasilMateri.kunci_jawaban.length > 0 &&
              ((isStudent && (isSubmitted || existingGrade))) && (
                <>
                  <h2 className="text-xl font-semibold mt-6 mb-4 text-blue-600 dark:text-blue-300">Kunci Jawaban (Answer Key):</h2>
                  <ol className="list-decimal pl-5 space-y-4">
                    {parsedHasilMateri.kunci_jawaban.map((answer) => (
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