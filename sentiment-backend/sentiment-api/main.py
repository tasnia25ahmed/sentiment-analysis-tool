from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import SessionLocal, Review


from sentiment import get_sentiment
from pydantic import BaseModel  # needed if defining ReviewRequest here

app = FastAPI()

# Allow React frontend
origins = [
    "http://localhost:3000",  # React dev server
    # later add your production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

# If you want to define ReviewRequest here (otherwise remove)
class ReviewRequest(BaseModel):
    text: str

# Dependency: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST /analyze
@app.post("/analyze")
def analyze_review(review: ReviewRequest, db: Session = Depends(get_db)):
    sentiment, scores = get_sentiment(review.text)

    new_review = Review(text=review.text, sentiment=sentiment)
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "sentiment": sentiment,
        "scores": scores
    }

# GET /history
@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.timestamp.desc()).limit(10).all()
    return [
        {
            "text": r.text,
            "sentiment": r.sentiment,
            "timestamp": r.timestamp.isoformat()
        }
        for r in reviews
    ]
