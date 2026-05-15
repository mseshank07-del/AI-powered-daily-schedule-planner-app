from fastapi import FastAPI, UploadFile, File
from parser import extract_text_from_bytes

app = FastAPI(title="dayplan Backend")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Read the file directly into memory without saving to disk
    content = await file.read()
    
    # Extract text using our parser
    text = extract_text_from_bytes(content, file.filename)
    
    return {
        "filename": file.filename,
        "extracted_text": text
    }