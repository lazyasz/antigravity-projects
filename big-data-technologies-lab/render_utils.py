import os
import subprocess
import time

out_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\results_screenshots"
html_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_exp6\html_templates"
os.makedirs(out_dir, exist_ok=True)
os.makedirs(html_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_html_to_png(html_content, output_png_path, width=1340, height=750):
    temp_html = os.path.join(html_dir, os.path.basename(output_png_path).replace(".png", ".html"))
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={output_png_path}",
        f"file:///{temp_html.replace(os.sep, '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error rendering {output_png_path}: {res.stderr}")
    else:
        print(f"Saved: {output_png_path} ({os.path.getsize(output_png_path)} bytes)")

print("Ready to define templates and generate screenshots.")
