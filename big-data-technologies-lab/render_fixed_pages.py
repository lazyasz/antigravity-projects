import pymupdf
doc = pymupdf.open(r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6 - Dhruv Sakhare (13).pdf")

for p_idx in [15, 17]: # Page 16 and 18
    page = doc[p_idx]
    pix = page.get_pixmap(dpi=150)
    out_png = rf"C:\Users\dhruv\.gemini\antigravity-ide\brain\c00a8bc0-f6db-4144-99b9-29169ba86e00\pdf_preview_page_{p_idx+1}_fixed.png"
    pix.save(out_png)
    print(f"Rendered fixed Page {p_idx+1} to {out_png}")