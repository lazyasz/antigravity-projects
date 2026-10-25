import sys, pymupdf
doc = pymupdf.open(r"C:\Users\dhruv\Downloads\BDTL - Experiment No 6.pdf")
page = doc[14] # Page 15
print("Page 15 size:", page.rect)
# Let us inspect the image rects on Page 15
img_list = page.get_images()
print("Images on Page 15:", len(img_list))