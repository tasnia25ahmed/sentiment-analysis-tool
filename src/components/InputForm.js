import { useState } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#FF4D4F", "#FAAD14", "#52C41A"];

const InputForm = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [rawScores, setRawScores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Store label and numeric score separately for meter bar
  const [topLabel, setTopLabel] = useState("");
  const [topScore, setTopScore] = useState(0);

  const API_URL =
    "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment";
  const API_TOKEN = process.env.REACT_APP_HUGGINGFACE_API_TOKEN;

  const labelMap = {
    LABEL_0: "Negative",
    LABEL_1: "Neutral",
    LABEL_2: "Positive",
  };

  const handleAnalyze = async () => {
    if (!API_TOKEN) {
      console.error("Missing Hugging Face API token");
      setSentiment("API token not set. Please check your .env file.");
      return;
    }

    if (!text.trim()) {
      setSentiment("Please enter some text to analyze.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        API_URL,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );

      const data = response.data[0];

      if (!Array.isArray(data) || !data[0]) {
        setSentiment("No sentiment detected.");
        setRawScores([]);
        setLoading(false);
        return;
      }

      // Sort descending by score
      const sorted = [...data].sort((a, b) => b.score - a.score);
      const top = sorted[0];

      const detectedLabel = labelMap[top.label] || "Unknown";

      // Parse to number here, no '%'
      const detectedScore = parseFloat((top.score * 100).toFixed(2));

      // Set sentiment text WITHOUT percentage (avoid double %)
      setSentiment(detectedLabel);

      setTopLabel(detectedLabel);
      setTopScore(detectedScore);

      // Format scores for pie chart
      const formattedScores = sorted.map((item) => ({
        name: labelMap[item.label] || item.label || "Unknown",
        value: parseFloat((item.score * 100).toFixed(2)),
      }));

      setRawScores(formattedScores);
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
    id="text-input"
    name="text"
    className="w-full"
  />
</div>


      <div className="flex justify-center space-x-4 mt-4">
        <Button className="button-primary" onClick={handleAnalyze}>
          Analyze
        </Button>
        <Button className="button-secondary" onClick={startVoiceInput}>
          Speak
        </Button>
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
    </div>
  );
};

export default InputForm;
