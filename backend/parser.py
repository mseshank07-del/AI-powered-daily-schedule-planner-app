import fitz  # PyMuPDF

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """Extracts text from PDF bytes or returns a placeholder for images."""
    
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf"):
        # Open the PDF directly from memory
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
        
    elif filename_lower.endswith((".png", ".jpg", ".jpeg")):
        return "[Image parsing coming soon]"
        
    elif filename_lower.endswith(".txt"):
        return file_bytes.decode("utf-8")
        
    return "[Unsupported file format]"