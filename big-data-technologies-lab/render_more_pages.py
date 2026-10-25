import pymupdf
doc = pymupdf.open(r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6 - Dhruv Sakhare (13).pdf")

pages_to_render = [15, 16, 18, 19] # Page 16, 17, 19, 20
for p_idx in pages_to_render:
    page = doc[p_idx]
    pix = page.get_pixmap(dpi=150)
    out_png = rf"C:\Users\dhruv\.gemini\antigravity-ide\brain\c00a8bc0-f6db-4144-99b9-29169ba86e00\pdf_preview_page_{p_idx+1}.png"
    pix.save(out_png)
    print(f"Rendered Page {p_idx+1} to {out_png}")