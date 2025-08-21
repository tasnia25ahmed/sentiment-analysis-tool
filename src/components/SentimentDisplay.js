import React from "react";
import { motion } from "framer-motion";
debugger;
const SentimentDisplay = ({ sentiment, topLabel, topScore }) => {
  if (!sentiment) return null;

  const getBarColor = (label) => {
    if (label === "Positive") return "#22c55e";  // green
    if (label === "Negative") return "#ef4444";  // red
    return "#facc15";                            // yellow
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <p style={{ fontSize: "18px", marginBottom: "8px" }}>
        Sentiment: <strong>{sentiment}</strong>
      </p>

      <div className="progress-container">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${topScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ backgroundColor: getBarColor(topLabel), height: "100%" }}
        />
      </div>

      <p style={{ marginTop: "6px", fontWeight: "600" }}>
        {topLabel} ({topScore}%)
      </p>
    </div>
  );
};

export default SentimentDisplay;

