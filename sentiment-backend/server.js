// Import required modules
const express = require("express");
const Sentiment = require("sentiment");
const cors = require("cors");

// Create an instance of the Express app
const app = express();

// Create an instance of the Sentiment analyzer
const sentiment = new Sentiment();

// Middleware to handle CORS (Cross-Origin Resource Sharing)
app.use(cors()); // Allows requests from your frontend (React app)
app.use(express.json()); // Parses JSON data sent in HTTP requests

// POST route for sentiment analysis
app.post("/analyze", (req, res) => {
  const { text } = req.body; // Extract text from the request body
  const result = sentiment.analyze(text); // Analyze the sentiment of the text
  
  // Respond with the sentiment result (Positive, Negative, or Neutral)
  res.json({ sentiment: result.score > 0 ? "Positive" : result.score < 0 ? "Negative" : "Neutral" });
});

// Start the server and listen on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
