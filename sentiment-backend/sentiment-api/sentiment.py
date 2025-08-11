import requests
import os

API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment"
API_TOKEN = os.getenv("REACT_APP_HUGGINGFACE_API_TOKEN")  # Make sure this env var is set correctly

headers = {"Authorization": f"Bearer {API_TOKEN}"} if API_TOKEN else {}

label_map = {
    "LABEL_0": "Negative",
    "LABEL_1": "Neutral",
    "LABEL_2": "Positive",
}

def get_sentiment(text: str):
    if not API_TOKEN:
        raise ValueError("Hugging Face API token is not set in environment variables.")

    response = requests.post(API_URL, headers=headers, json={"inputs": text})

    # Check if the request was successful
    if response.status_code != 200:
        raise RuntimeError(f"Failed to get sentiment: {response.status_code} {response.text}")

    data = response.json()

    if not data or not isinstance(data, list) or not data[0]:
        return "Unknown", []

    sorted_scores = sorted(data[0], key=lambda x: x["score"], reverse=True)

    top_label = label_map.get(sorted_scores[0]["label"], "Unknown")

    scores = [
        {
            "name": label_map.get(item["label"], item["label"]),
            "value": round(item["score"] * 100, 2),
        }
        for item in sorted_scores
    ]

    return top_label, scores

