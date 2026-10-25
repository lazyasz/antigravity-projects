from PIL import ImageGrab
try:
    im = ImageGrab.grab()
    im.save(r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\screen_test.png")
    print(f"Captured screen successfully! Size: {im.size}")
except Exception as e:
    print(f"ImageGrab error: {e}")
