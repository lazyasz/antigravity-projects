import os
import fitz

extracted_txt = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\extracted\extracted_text.txt"
with open(extracted_txt, "r", encoding="utf-8") as f:
    content = f.read()

pages = content.split("--- PAGE ")
for p in pages:
    if not p.strip(): continue
    lines = p.splitlines()
    header = lines[0].strip()
    page_num = header.split(" ---")[0]
    if int(page_num) >= 14:
        print(f"\n==================== PAGE {page_num} ====================")
        print("\n".join(lines[1:]))
