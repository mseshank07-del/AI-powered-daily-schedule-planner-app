from fastapi import FastAPI, UploadFile, File
from parser import extract_text
import shutil

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)

    return {
        "filename": file.filename,
        "text": text
    }