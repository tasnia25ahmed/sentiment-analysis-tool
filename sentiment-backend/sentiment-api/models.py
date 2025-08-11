from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Base class for SQLAlchemy models
Base = declarative_base()

# Table definition for 'reviews'
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    text = Column(String)
    sentiment = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Database connection
DATABASE_URL = "sqlite:///./reviews.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Creates a session to talk to the database
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Create the table if it doesn't exist
Base.metadata.create_all(bind=engine)
