import { useState, useEffect } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#FF4D4F", "#FAAD14", "#52C41A"];
const API_BASE = "http://localhost:8000";

const InputForm = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [rawScores, setRawScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topLabel, setTopLabel] = useState("");
  const [topScore, setTopScore] = useState(0);
  const [history, setHistory] = useState([]);

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
    <div className="container p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Sentiment Analysis Tool</h1>

      <div className="w-full max-w-md mx-auto">
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
        />
      </div>

      <div className="flex justify-center space-x-4 mt-4">
        <Button onClick={handleAnalyze}>Analyze</Button>
        <Button onClick={startVoiceInput}>Speak</Button>
      </div>

      {loading && <p className="mt-4 text-center">Analyzing sentiment, please wait...</p>}

      <SentimentDisplay sentiment={sentiment} topLabel={topLabel} topScore={topScore} />

      {rawScores.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Detailed Scores:</h3>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Recent Analyses:</h3>
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li
                key={idx}
                className="border p-2 rounded shadow-sm flex justify-between items-center"
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputForm;
