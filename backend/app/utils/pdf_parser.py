"""PDF text extraction utility."""

import PyPDF2
import io


def extract_text_from_pdf(file_stream) -> str:
    """Extract all text from a PDF file stream."""
    text_parts = []
    try:
        reader = PyPDF2.PdfReader(file_stream)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

    full_text = "\n".join(text_parts).strip()
    if not full_text:
        raise ValueError("No readable text found in PDF. The file may be image-based or corrupted.")
    return full_text
