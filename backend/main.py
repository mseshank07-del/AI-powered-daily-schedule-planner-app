from fastapi import FastAPI, UploadFile, File, Query, Response, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from parser import extract_text_from_bytes
from ai_call import extract_tasks
from scheduler import build_schedule, smart_merge
from export import generate_ics
from timetable_parser import extract_text_from_timetable_bytes, parse_timetable_with_gemini

class SchedulePayload(BaseModel):
    schedule: List[Dict[str, Any]]

app = FastAPI(title="dayplan Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/timetable")
async def upload_timetable(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        raw_text = extract_text_from_timetable_bytes(pdf_bytes)
        timetable_data = parse_timetable_with_gemini(raw_text)
        return {"timetable": timetable_data}
    except Exception as e:
        return {"error": str(e)}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    wake_time: str = Query("07:00"),
    slept_at: str = Query("23:00"),
    current_time: str = Query(None),
    timetable: str = Form(None),
    existing_schedule: str = Form(None)
):
    content = await file.read()

    raw_text = extract_text_from_bytes(content, file.filename)

    tasks = extract_tasks(raw_text)
    
    if timetable:
        try:
            timetable_tasks = json.loads(timetable)
            if isinstance(timetable_tasks, list):
                # Ensure all required keys are present
                for t in timetable_tasks:
                    t["is_fixed"] = True
                    t["priority"] = "urgent"
                tasks.extend(timetable_tasks)
        except json.JSONDecodeError:
            print("Failed to decode timetable json")
            
    if existing_schedule:
        try:
            ex_sched = json.loads(existing_schedule)
            schedule = smart_merge(ex_sched, tasks, wake_time, slept_at, current_time)
        except json.JSONDecodeError:
            print("Failed to decode existing schedule json")
            schedule = build_schedule(tasks, wake_time, slept_at, current_time)
    else:
        schedule = build_schedule(tasks, wake_time, slept_at, current_time)

    return {
        "filename": file.filename,
        "schedule": schedule
    }

@app.post("/export")
async def export_schedule(payload: SchedulePayload):
    ics_content = generate_ics(payload.schedule)
    return Response(
        content=ics_content.encode("utf-8"),
        media_type="text/calendar",
        headers={
            "Content-Disposition": "attachment; filename=dayplan.ics"
        }
    )