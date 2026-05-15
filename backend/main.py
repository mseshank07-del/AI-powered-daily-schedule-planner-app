from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_bytes
from ai_call import extract_tasks
from scheduler import build_schedule

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