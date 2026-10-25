import os
import pymupdf

pdf_dhruv = r"C:\Users\dhruv\Downloads\Dhruv_Sakhare_Experiments_1_and_3.pdf"
pdf_adesh = r"C:\Users\dhruv\Downloads\Adesh_Patankar_Experiments_1_and_4.pdf"
preview_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_bucket_experiments\previews"
os.makedirs(preview_dir, exist_ok=True)

def verify_doc(pdf_path, name_prefix):
    doc = pymupdf.open(pdf_path)
    print(f"=== {name_prefix} PDF Info ===")
    print(f"Path: {pdf_path}")
    print(f"Total Pages: {len(doc)}")
    
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        out_png = os.path.join(preview_dir, f"{name_prefix}_page_{i+1}.png")
        pix.save(out_png)
        print(f"Rendered Page {i+1} -> {out_png} ({os.path.getsize(out_png)} bytes)")

verify_doc(pdf_dhruv, "dhruv")
verify_doc(pdf_adesh, "adesh")
