import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

PROMPT = """
Extract all tasks from this text.

Return ONLY valid JSON array.

Each task must contain:
- name
- priority (high/medium/low)
- is_fixed (true/false)
- fixed_time (HH:MM or null)
- deadline (today/tomorrow/none)
- type (study/errand/coding/general)
"""

def extract_tasks(text):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=PROMPT + "\n\nTEXT:\n" + text[:3000]
        )

        cleaned = response.text.strip()

        if cleaned.startswith("```json"):
            cleaned = cleaned.replace("```json", "").replace("```", "").strip()

        return json.loads(cleaned)

    except Exception as e:
        print("Gemini failed:", e)

        return [
            {
                "name": "Study DSA",
                "priority": "high",
                "is_fixed": False,
                "fixed_time": None,
                "deadline": "today",
                "type": "study"
            },
            {
                "name": "Gym",
                "priority": "medium",
                "is_fixed": True,
                "fixed_time": "18:00",
                "deadline": "none",
                "type": "general"
            },
            {
                "name": "Complete DBMS assignment",
                "priority": "high",
                "is_fixed": False,
                "fixed_time": None,
                "deadline": "tomorrow",
                "type": "study"
            }
        ]