from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import SessionLocal, Review
from sentiment import get_sentiment
from pydantic import BaseModel

app = FastAPI()

# Allow React frontend
origins = [
    "http://localhost:3000",  # React dev server
    # Add production URL later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ReviewRequest(BaseModel):
    text: str


# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# POST /analyze — save sentiment + scores to DB
@app.post("/analyze")
def analyze_review(review: ReviewRequest, db: Session = Depends(get_db)):
    sentiment, scores = get_sentiment(review.text)

    # ✅ Save text, sentiment, and scores
    new_review = Review(
        text=review.text,
        sentiment=sentiment,
        scores=scores
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "sentiment": sentiment,
        "scores": scores
    }


# GET /history — include scores in the response
@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.timestamp.desc()).limit(10).all()
    return [
        {
            "text": r.text,
            "sentiment": r.sentiment,
            "scores": r.scores,  # ✅ Include scores
            "timestamp": r.timestamp.isoformat()
        }
        for r in reviews
    ]
