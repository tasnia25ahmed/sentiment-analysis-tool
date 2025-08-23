import { useState, useEffect } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaMicrophone } from "react-icons/fa";

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
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "250px", zIndex: 1000 }}
      >
        <div className="p-2 flex justify-between items-center border-b">
          <h3 className="font-semibold text-lg">Recent Analyses</h3>
          <button
            className="px-2 py-1 text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "❌" : "☰"}
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-50px)] p-2">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="border p-2 mb-2 rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-700">{item.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-white text-xs ${
                  item.sentiment === "Positive"
                    ? "bg-green-500"
                    : item.sentiment === "Negative"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {item.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-center">Sentiment Analysis Tool</h1>

        <div className="flex items-center gap-2 mb-2">
          <TextInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <Button onClick={startVoiceInput} variant="secondary">
            <FaMicrophone />
          </Button>
        </div>

        <Button onClick={handleAnalyze} className="mb-4">
          Analyze
        </Button>

        {loading && <p className="text-center mb-4">Analyzing sentiment...</p>}

        <SentimentDisplay sentiment={sentiment} topLabel={topLabel} topScore={topScore} />

        {rawScores.length > 0 && (
          <div className="mt-4 p-4 shadow-sm rounded bg-white max-w-md">
            <h3 className="font-semibold mb-2">Detailed Scores</h3>
            <ul className="mb-4">
              {rawScores.map((item, idx) => (
                <li key={idx}>{item.name}: {item.value}%</li>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;
