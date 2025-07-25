import React from "react";

export default function StudyVideo() {
  const [videos, setVideos] = React.useState([]);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handlePrompt = () => {
    setShowPrompt(true);
  };

  const getEmbedUrl = (url) => {
    // YouTube URL patterns
    const youtubeMatch = url.match(
      /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // If not YouTube, return as is
    return url;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setVideos((prev) => [...prev, getEmbedUrl(inputValue)]);
    setShowPrompt(false);
    setInputValue("");
  };

  return (
    <div className="pt-24 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Study Video Gallery</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        onClick={handlePrompt}
      >
        Add Video
      </button>
      {showPrompt && (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter video URL (YouTube, etc.)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300"
            required
          />
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Submit
          </button>
        </form>
      )}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {videos.map((video, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-2">
                <iframe
                  src={video}
                  title={`Study Video ${idx + 1}`}
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="text-center w-full">
                <h4 className="text-md font-semibold text-blue-600 dark:text-blue-300">Video {idx + 1}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
