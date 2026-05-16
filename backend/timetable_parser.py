import os
import json
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro') # Using pro for better JSON extraction

def extract_text_from_timetable_bytes(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_timetable_with_gemini(raw_text: str) -> dict:
    prompt = f"""
    You are an expert at parsing college timetables.
    Extract the weekly class schedule from the following raw text and return it strictly as a JSON object.
    
    The JSON object must have keys for each day of the week (lowercase): "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday".
    The value for each key must be a list of objects representing the classes for that day.
    
    Each class object MUST have the following structure:
    {{
        "name": "Subject/Class Name",
        "start_time": "HH:MM",  (in 24-hour format)
        "end_time": "HH:MM",    (in 24-hour format)
        "subtitle": "Room/Location details (or empty string)",
        "is_fixed": true,
        "type": "class",
        "priority": "urgent"
    }}
    
    If a day has no classes, its value should be an empty list [].
    
    CRITICAL RULES:
    1. Output MUST be valid JSON only. Do not wrap in markdown (like ```json).
    2. Start and end times MUST be exactly in 24-hour "HH:MM" format.
    
    Raw Timetable Text:
    {raw_text}
    """
    
    response = model.generate_content(prompt)
    raw_output = response.text.strip()
    
    # Strip markdown if Gemini includes it despite instructions
    if raw_output.startswith("```json"):
        raw_output = raw_output[7:]
    if raw_output.startswith("```"):
        raw_output = raw_output[3:]
    if raw_output.endswith("```"):
        raw_output = raw_output[:-3]
        
    try:
        data = json.loads(raw_output.strip())
        
        # Ensure all days exist
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        result = {}
        for day in days:
            result[day] = data.get(day, [])
        return result
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON timetable: {e}")
        return {day: [] for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}
