
import React, { useEffect } from "react";
import { getBaseUrl } from "../models/utils";

// Helper to determine video type and src
function getEmbedUrl(url, prompt) {
  if (!url) return { type: 'unknown', src: '', prompt };
  // Always prefix with http://152.42.228.196:8000/ if not absolute, always one slash
  let fullUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    fullUrl = `http://152.42.228.196:8000/${url.replace(/^\//, '')}`;
  }
  // YouTube
  const ytMatch = fullUrl.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
  if (ytMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}`, prompt };
  }
  // Common video file extensions
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi', '.wmv', '.flv', '.m4v'];
  for (const ext of videoExts) {
    if (fullUrl.toLowerCase().endsWith(ext)) {
      return { type: 'video', src: fullUrl, prompt };
    }
  }
  // Fallback to iframe
  return { type: 'iframe', src: fullUrl, prompt };
}

export default function StudyVideo() {
  const [videos, setVideos] = React.useState([]);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [language, setLanguage] = React.useState("indonesian");
  const [isLoading, setIsLoading] = React.useState(false);

  const baseUrl = getBaseUrl();
  
  const handlePrompt = () => {
    setShowPrompt(true);
  };

  

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
        const userId = userProfile.user_id || userProfile._id || userProfile.userid || userProfile.userId;
        if (!userId) return;
        const response = await fetch(`${baseUrl}/math-video/user/${userId}`);
        console.log("Fetching videos from:", `${baseUrl}/math-video/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(Array.isArray(data) ? data.map(v => getEmbedUrl(v.video_url, v.prompt)) : []);
      } catch (err) {
       console.error("Error fetching videos:", err);
      }
    };
    fetchVideos();
  }, []);

  
  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowPrompt(false);
    try {
      const userProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
      const userId = userProfile.user_id || userProfile._id || userProfile.userid || userProfile.userId;
      if (!userId) throw new Error("User ID not found");
      const response = await fetch(`${baseUrl}/math-video/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputValue, user_id: userId, bahasa: language })
      });
      if (!response.ok) throw new Error("Failed to generate video");
      const data = await response.json();
      
      if (userId) {
        const refetchResponse = await fetch(`${baseUrl}/math-video/user/${userId}`);
        if (refetchResponse.ok) {
          const refetchData = await refetchResponse.json();
          setVideos(Array.isArray(refetchData) ? refetchData.map(v => getEmbedUrl(v.video_url, v.prompt)) : []);
        }
      }
    } catch (err) {
      alert("Failed to generate video: " + err.message);
    } finally {
      setIsLoading(false);
      setInputValue("");
      setLanguage("indonesian");
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    setVideos((prev) => [...prev, getEmbedUrl(inputValue, '')]);
    setShowPrompt(false);
    setInputValue("");
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 flex flex-col items-center px-4">
      <h2 className="text-3xl font-extrabold mb-8 text-blue-700 dark:text-blue-200 tracking-tight drop-shadow-lg">Study Video Gallery</h2>
      <button
        className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handlePrompt}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating...</span>
        ) : (
          "+ Add Video"
        )}
      </button>
      {showPrompt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <form onSubmit={handlePromptSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-4 w-full max-w-md border border-gray-200 dark:border-gray-700 relative animate-fadeIn">
            <button type="button" onClick={() => setShowPrompt(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold">&times;</button>
            <h3 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-200">Enter a prompt for your study video</h3>
            <input
              type="text"
              placeholder="e.g. How to solve quadratic equations"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              required
              autoFocus
            />
            <div>
              <label htmlFor="language" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">Language</label>
              <select
                id="language"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option value="indonesian">Indonesian</option>
                <option value="english">English</option>
              </select>
            </div>
            <button type="submit" className="px-5 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating...</span>
              ) : (
                "Generate Video"
              )}
            </button>
          </form>
        </div>
      )}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 w-full max-w-5xl">
          {videos.map((videoObj, idx) => (
            <div
              key={idx}
              className="group bg-white/90 dark:bg-gray-800/80 rounded-2xl shadow-xl p-4 flex flex-col items-center border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.03] transition-all duration-200"
            >
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-3 shadow-lg flex items-center justify-center">
                {videoObj.type === 'video' ? (
                  <video
                    src={videoObj.src}
                    controls
                    className="w-full h-full object-contain bg-black rounded-xl"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : videoObj.type === 'youtube' || videoObj.type === 'iframe' ? (
                  <iframe
                    src={videoObj.src}
                    title={`Study Video ${idx + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="text-white text-center">Cannot play this video format.</div>
                )}
              </div>
              <div className="text-center w-full">
                <h4 className="text-lg font-bold text-blue-700 dark:text-blue-200 mb-1">{videoObj.prompt || `Video ${idx + 1}`}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">Click the + button to add more videos</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center text-gray-400 dark:text-gray-500 text-lg">No videos yet. Click <span className='font-bold text-blue-600 dark:text-blue-300'>+ Add Video</span> to get started!</div>
      )}
    </div>
  );
}
