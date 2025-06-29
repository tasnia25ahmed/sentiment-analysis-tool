import React, { useState } from "react";
import axios from "axios";
import TextInput from "./TextInput";
import Button from "./Button";
import SentimentDisplay from "./SentimentDisplay";

const InputForm = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);

  const handleAnalyze = async () => {
    try {
      const API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest";
      // Use environment variable for API token for security
      const API_TOKEN = process.env.REACT_APP_HUGGINGFACE_API_TOKEN;
      if (!API_TOKEN) {
        console.error("Hugging Face API token is not set. Please set REACT_APP_HUGGINGFACE_API_TOKEN in your environment variables.");
        setSentiment("API token not set. Please configure your token.");
        return;
      }

      const response = await axios.post(
        API_URL,
        { inputs: text },
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      console.log("Hugging Face API response:", response.data);

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const label = response.data[0].label || "Unknown";
        const score = typeof response.data[0].score === "number" ? response.data[0].score : 0;
        setSentiment(label + " (" + (score * 100).toFixed(2) + "%)");
      } else {
        setSentiment("No sentiment detected");
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setSentiment("Error analyzing sentiment");
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
      console.error("Error occurred in speech recognition:", event.error);
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
        />
        <div className="button-group">
          <Button
            className="button-primary"
            onClick={handleAnalyze}
          >
            Analyze
          </Button>
          <Button
            className="button-secondary"
            onClick={startVoiceInput}
          >
            Speak
          </Button>
        </div>
        <SentimentDisplay sentiment={sentiment} />
      </div>
    </div>
  );
};

export default InputForm;

