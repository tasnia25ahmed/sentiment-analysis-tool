import { useState, useEffect } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaMicrophone, FaBars, FaTimes } from "react-icons/fa";

const COLORS = {
    Positive: "#52C41A",
  Neutral: "#FAAD14",
  Negative: "#FF4D4F",
}
const API_BASE = "http://127.0.0.1:8000"; // Fixed: previously it was `const = ...` typo

const InputForm = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [rawScores, setRawScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topLabel, setTopLabel] = useState("");
  const [topScore, setTopScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setSentiment("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/analyze`, { text });
      const { sentiment, scores } = response.data;

      setSentiment(sentiment);
      setTopLabel(sentiment);
      setRawScores(scores);

      const top = scores[0];
      setTopScore(top.value);

      await fetchHistory();
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setSentiment("Error analyzing sentiment.");
      setRawScores([]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "linear-gradient(to right,#3A1C71, #D76D77,#FFAF7B)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Page Layout */}
      <div className="d-flex" style={{ position: "relative", zIndex: 1, height: "100%", width: "100%" }}>
        {/* Sidebar */}
        <div
          className="shadow"
          style={{
            width: sidebarOpen ? "250px" : "50px",
            height: sidebarOpen ? "100%" : "6%",
            overflow: "hidden",
            backgroundColor: sidebarOpen ? "#aca1ddff" : "",
            zIndex: 1000,
            transition: "width 0.3s",
          }}
        >
          <div className="p-2 d-flex align-items-center border-bottom" 
          style={{ justifyContent: sidebarOpen ? "space-between" : "center" }}>
            {sidebarOpen && <h3 className="fw-semibold fs-5"
                style={{
    opacity: sidebarOpen ? 1 : 0,
    transition: "opacity 0.3s",
  }}
            >Recent Analyses</h3>}
            <button className="btn btn-sm btn-light" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
          <div className="overflow-auto" style={{ height: "calc(100vh - 50px)",opacity: sidebarOpen ? 1 : 0,
    transition: "opacity 0.3s" }}>
            {history.map((item, idx) => (
              <div
                key={idx}
                className="border p-2 mb-2 rounded shadow-sm d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => {
                  setSelectedHistory(item);
                setRawScores(item.scores || []); // ← add this line
                 setModalOpen(true);
                }}
              >
                <div>
                  {sidebarOpen && <p className="small text-dark">{item.text}</p>}
                  <p className="text-muted small">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <span
                  className={`badge text-white ${
                    item.sentiment === "Positive"
                      ? "bg-success"
                      : item.sentiment === "Negative"
                      ? "bg-danger"
                      : "bg-warning"
                  }`}
                >
                  {item.sentiment}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex-grow-1 p-4 d-flex flex-column"
          style={{ position: "relative", zIndex: 1, minHeight: "100vh", width: "100%" }}
        >
          <h1 className="fs-3 fw-bold mb-4 text-center">Sentiment Analysis Tool</h1>

          <div className="glass p-2 d-flex align-items-center gap-2 mb-2">
            <TextInput
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text here..."
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button variant="secondary" onClick={startVoiceInput}>
              <FaMicrophone />
            </Button>
          </div>

          <Button onClick={handleAnalyze} className="mb-4">
            Analyze
          </Button>

          {loading && <p className="text-center mb-4">Analyzing sentiment...</p>}

          <SentimentDisplay sentiment={sentiment} topLabel={topLabel} topScore={topScore} />

          {rawScores.length > 0 && (
            <div className="mt-1 p-1 shadow-sm rounded bg-white mx-auto" style={{ maxWidth: "400px", maxHeight: "300px", overflow: "auto" }}>
              <h3 className="fw-semibold mb-2">Detailed Scores</h3>
              <ul className="mb-4">
                {rawScores.map((item, idx) => (
                  <li key={idx}>
                    {item.name}: {item.value}%
                  </li>
                ))}
              </ul>
              {/* Fixed: ResponsiveContainer must have a defined height */}
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rawScores} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {rawScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#ccc"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: moved outside main d-flex container and fixed height/width */}
     {modalOpen && selectedHistory && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
    onClick={() => setModalOpen(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
      style={{
        width: "400px",       // fixed width
        maxHeight: "70vh",    // max height
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Analysis Details</h3>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={selectedHistory.scores || []}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {(selectedHistory.scores || []).map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || "#ccc"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <SentimentDisplay
        sentiment={selectedHistory.sentiment}
        topLabel={selectedHistory.sentiment}
        topScore={selectedHistory.scores?.[0]?.value || 0}
      />

      <button
        style={{ marginTop: "15px" }}
        className="btn btn-secondary w-full"
        onClick={() => setModalOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
 
    </div>
  );
};

export default InputForm;

