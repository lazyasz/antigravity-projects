import os
import sys

pdf_path = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\exp6.pdf"
out_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\extracted"
os.makedirs(out_dir, exist_ok=True)

try:
    import fitz # PyMuPDF
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    with open(os.path.join(out_dir, "extracted_text.txt"), "w", encoding="utf-8") as f:
        for i, page in enumerate(doc):
            text = page.get_text()
            f.write(f"\n--- PAGE {i+1} ---\n")
            f.write(text)
            print(f"Page {i+1} has {len(text)} chars")
            
            # Extract images
            image_list = page.get_images(full=True)
            print(f"Page {i+1} has {len(image_list)} images")
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                image_filename = os.path.join(out_dir, f"page_{i+1}_img_{img_index+1}.{image_ext}")
                with open(image_filename, "wb") as img_file:
                    img_file.write(image_bytes)
                print(f"  Saved image: {image_filename}")
                
            # Also render page as image to inspect layout
            pix = page.get_pixmap(dpi=150)
            pix.save(os.path.join(out_dir, f"page_{i+1}_rendered.png"))
            
    print("Done extraction with PyMuPDF")
except Exception as e:
    print(f"PyMuPDF error or not ready: {e}")
