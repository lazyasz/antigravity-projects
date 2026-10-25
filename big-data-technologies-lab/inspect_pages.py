import sys, pymupdf
sys.stdout.reconfigure(encoding="utf-8")
doc = pymupdf.open(r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6.pdf")

for p in range(14, 20):
    page = doc[p]
    print(f"=== PAGE {p+1} (Rect: {page.rect}) ===")
    for b in page.get_text("blocks"):
        text = b[4].strip().replace("\n", " ")
        if text:
            print(f"  Text at ({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}): \"{text[:70]}\"")
    il = page.get_images()
    print(f"  Total raw images: {len(il)}\n")