import requests
import os

API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment"
API_TOKEN = os.getenv("REACT_APP_HUGGINGFACE_API_TOKEN")
headers = {"Authorization": f"Bearer {API_TOKEN}"}

label_map = {
    "LABEL_0": "Negative",
    "LABEL_1": "Neutral",
    "LABEL_2": "Positive",
}

def get_sentiment(text: str):
    response = requests.post(API_URL, headers=headers, json={"inputs": text})
    data = response.json()[0]
    sorted_scores = sorted(data, key=lambda x: x["score"], reverse=True)
    
    top_label = label_map.get(sorted_scores[0]["label"], "Unknown")
    
    scores = [
        {
            "name": label_map.get(item["label"], item["label"]),
            "value": round(item["score"] * 100, 2)
        }
        for item in sorted_scores
    ]
    
    return top_label, scores
