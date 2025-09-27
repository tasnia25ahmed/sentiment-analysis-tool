import { useState, useEffect } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaMicrophone } from "react-icons/fa";
import { FaBars, FaTimes } from "react-icons/fa"; 




const COLORS = ["#FF4D4F", "#FAAD14", "#52C41A"];
debugger;
const API_BASE = "http://127.0.0.1:8000";
debugger;
const InputForm = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [rawScores, setRawScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topLabel, setTopLabel] = useState("");
  const [topScore, setTopScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

 debugger;
  useEffect(() => {
    fetchHistory();
  }, []);
 debugger;
  const fetchHistory = async () => {
    debugger;
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
 debugger;
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

      const top = scores[0];
      setTopScore(top.value);
      setRawScores(scores);

      await fetchHistory();
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setSentiment("Error analyzing sentiment.");
      setRawScores([]);
    } finally {
      setLoading(false);
    }
  };
 debugger;
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
  <div style={{
    height: "100vh",
    width: "100%",
    background: "linear-gradient(to right,#3A1C71, #D76D77,#FFAF7B)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}>
   
   
    {/* Page Content */}
    <div
      className="d-flex"
      style={{ position: "relative", zIndex: 1, height: "100%", width: "100%" }}
    >
      {/* Sidebar */}
      <div
        className="shadow transition"
        style={{
          width: sidebarOpen ? "250px" : "0px",
          backgroundColor: "#aca1ddff",
          zIndex: 1000,
           // prevent content overflow when collapsed
          transition: "width 0.3s",
        }}
      >
        <div className="p-2 d-flex justify-content-between align-items-center border-bottom">
          {sidebarOpen && <h3 className="fw-semibold fs-5">Recent Analyses</h3>}
          <button
            className="btn btn-sm btn-light"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="overflow-auto" style={{ height: "calc(100vh - 50px)" }}>
          {history.map((item, idx) => (
            <div
              key={idx}
              className="border p-2 mb-2 rounded shadow-sm d-flex justify-content-between align-items-center"
            >
              <div>
                {sidebarOpen && <p className="small text-dark">{item.text}</p>}
                <p className="text-muted small">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
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
      <div className="flex-grow-1 p-4 d-flex flex-column">
        <h1 className=" fs-3 fw-bold mb-4 text-center">Sentiment Analysis Tool</h1>

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

        <SentimentDisplay
          sentiment={sentiment}
          topLabel={topLabel}
          topScore={topScore}
        />

        {rawScores.length > 0 && (
          <div
            className="mt-4 p-4 shadow-sm rounded bg-white mx-auto"
            style={{ maxWidth: "400px" }}
          >
            <h3 className="fw-semibold mb-2">Detailed Scores</h3>
            <ul className="mb-4">
              {rawScores.map((item, idx) => (
                <li key={idx}>
                  {item.name}: {item.value}%
                </li>
              ))}
            </ul>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={rawScores}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {rawScores.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  </div>
);
}

export default InputForm;
