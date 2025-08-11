from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from models import SessionLocal, Review
from sentiment import get_sentiment

# Start FastAPI app
app = FastAPI()

# Allow frontend (React) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input format for /analyze
class ReviewRequest(BaseModel):
    text: str

# Get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST /analyze: analyze a review and save to DB
@app.post("/analyze")
def analyze_review(review: ReviewRequest, db: Session = Depends(get_db)):
    sentiment = get_sentiment(review.text)
    new_review = Review(text=review.text, sentiment=sentiment)
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"sentiment": sentiment}

# GET /history: return recent 10 results
@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.timestamp.desc()).limit(10).all()
    return [
        {
            "text": r.text,
            "sentiment": r.sentiment,
            "timestamp": r.timestamp.isoformat()
        } for r in reviews
    ]
