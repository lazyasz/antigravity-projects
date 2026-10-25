import sys, pymupdf
doc = pymupdf.open(r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6.pdf")

for p_num in range(14, 20):
    page = doc[p_num]
    print(f"\n--- PAGE {p_num+1} ---")
    for img in page.get_images():
        xref = img[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            w = r.width
            h = r.height
            if w > 50 and h > 50: # Ignore tiny 10px icons
                print(f"  xref {xref}: ({r.x0:.1f}, {r.y0:.1f}, {r.x1:.1f}, {r.y1:.1f}) -> w={w:.1f}, h={h:.1f}, ratio={w/h:.2f}")