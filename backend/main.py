from fastapi import FastAPI, UploadFile, File
from parser import extract_text_from_bytes
from ai_call import extract_tasks

app = FastAPI(title="dayplan Backend")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()

    raw_text = extract_text_from_bytes(content, file.filename)

    tasks = extract_tasks(raw_text)

    return {
        "filename": file.filename,
        "tasks": tasks
    }