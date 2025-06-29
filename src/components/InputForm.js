import React, { useState } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";

const InputForm = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [rawScores, setRawScores] = useState([]);

  const API_URL =
    "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";
  const API_TOKEN = process.env.REACT_APP_HUGGINGFACE_API_TOKEN;

  const labelMap = {
    LABEL_0: "Negative",
    LABEL_1: "Neutral",
    LABEL_2: "Positive",
    POSITIVE: "Positive",
    NEGATIVE: "Negative",
  };

  const handleAnalyze = async () => {
    if (!API_TOKEN) {
      console.error("Missing Hugging Face API token");
      setSentiment("API token not set. Please check your .env file.");
      return;
    }

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

      const data = response.data;

      if (!Array.isArray(data) || !data[0] || !data[0].label || typeof data[0].score !== "number") {
        setSentiment("No sentiment detected or model is still loading.");
        setRawScores([]);
        return;
      }

      const sorted = [...data].sort((a, b) => b.score - a.score);
      const top = sorted[0];

      const topLabel = labelMap[top.label] || top.label || "Unknown";
      const topScore = typeof top.score === "number" ? (top.score * 100).toFixed(2) : "0.00";

      setSentiment(`${topLabel} (${topScore}%)`);

      const formattedScores = sorted.map((item) => ({
        label: labelMap[item.label] || item.label || "Unknown",
        score: typeof item.score === "number" ? (item.score * 100).toFixed(2) : "0.00",
      }));

      setRawScores(formattedScores);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setSentiment("Error analyzing sentiment");
      setRawScores([]);
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
    <div className="container">
      <h1 className="header">Sentiment Analysis Tool</h1>
      <div className="form-container">
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
          id="text-input"
          name="text"
        />
        <div className="button-group">
          <Button className="button-primary" onClick={handleAnalyze}>
            Analyze
          </Button>
          <Button className="button-secondary" onClick={startVoiceInput}>
            Speak
          </Button>
        </div>

        <SentimentDisplay sentiment={sentiment} />

        {rawScores.length > 0 && (
          <div className="raw-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              {rawScores.map((item, idx) => (
                <li key={idx}>
                  {item.label}: {item.score}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;
