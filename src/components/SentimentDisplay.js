import React from "react";

const SentimentDisplay = ({ sentiment }) => {
  if (!sentiment) return null;

  return (
    <p className="mt-4 text-lg text-center">
      Sentiment: <span className="font-bold">{sentiment}</span>
    </p>
  );
};

export default SentimentDisplay;
