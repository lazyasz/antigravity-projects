import os
from PIL import Image

extracted_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\extracted"
for fname in sorted(os.listdir(extracted_dir)):
    if fname.startswith("page_") and not fname.endswith("_rendered.png"):
        p = os.path.join(extracted_dir, fname)
        try:
            with Image.open(p) as im:
                print(f"{fname}: format={im.format}, size={im.size}, mode={im.mode}")
        except Exception as e:
            print(f"{fname}: error {e}")
