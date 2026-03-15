# Sentiment Analysis Tool
 
A full-stack web app that classifies text as **Positive**, **Negative**, or **Neutral** using Hugging Face's `twitter-roberta-base-sentiment` model — with real-time results, confidence score visualizations, voice input, and persistent history.
 
🔗 **Live Demo:** [https://sentiment-frontend-l7k0.onrender.com]
 
---
 
## ✨ Features
 
- **Real-time analysis** — type or paste text and get instant sentiment classification
- **Confidence breakdown** — interactive pie chart showing score distribution across all three classes
- **Voice input** — use your microphone to analyze spoken text
- **Session history** — all analyses saved to SQLite and displayed in a persistent sidebar
- **Drill-down modal** — click any past result to re-examine its full score breakdown
- **Responsive UI** — smooth transitions and mobile-friendly layout
 
---
 
## 🛠 Tech Stack
 
**Frontend:** React, Recharts, React Icons, Axios  
**Backend:** FastAPI (Python)  
**Database:** SQLite  
**NLP Model:** Hugging Face `twitter-roberta-base-sentiment`
 
---
 
## 🚀 Run Locally
 
**Prerequisites:** Node.js, Python 3.9+
 
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
 
```bash
# Frontend
cd frontend
npm install
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000)
 
---
 
## 📖 Usage
 
1. Enter text in the input field and press **Analyze** or hit `Enter`
2. View your sentiment result and confidence pie chart
3. Browse past analyses in the sidebar
4. Click any history item to open a detailed modal
5. Hit the 🎤 button to use voice input
 
---
 
## 📌 Notes
 
- Backend must be running for analysis to work
- History is stored locally in SQLite — clears on server reset
- Optimized for Chrome, Edge, and Firefox
 
