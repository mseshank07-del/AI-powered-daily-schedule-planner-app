from fastapi import FastAPI, UploadFile, File, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from parser import extract_text_from_bytes
from ai_call import extract_tasks
from scheduler import build_schedule
from export import generate_ics

class SchedulePayload(BaseModel):
    schedule: List[Dict[str, Any]]

app = FastAPI(title="dayplan Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    wake_time: str = Query("07:00"),
    slept_at: str = Query("23:00")
):
    content = await file.read()

    raw_text = extract_text_from_bytes(content, file.filename)

    tasks = extract_tasks(raw_text)
    
    schedule = build_schedule(tasks, wake_time, slept_at)

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