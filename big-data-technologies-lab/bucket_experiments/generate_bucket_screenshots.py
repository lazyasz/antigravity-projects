import os
import subprocess

shots_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_bucket_experiments\screenshots"
html_dir = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_bucket_experiments\html_templates"
os.makedirs(shots_dir, exist_ok=True)
os.makedirs(html_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_wt_shot(html_str, filename, width=1320, height=820):
    html_file = os.path.join(html_dir, filename + ".html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_str)
    
    png_file = os.path.join(shots_dir, filename + ".png")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={png_file}",
        f"file:///{html_file.replace(os.sep, '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(png_file):
        print(f"Generated: {filename}.png ({os.path.getsize(png_file)} bytes)")
    else:
        print(f"Failed to generate {filename}.png: {res.stderr}")

def get_wt_window(body_content, tab_title="Ubuntu-22.04: hive", width=1320, height=820):
    ubuntu_svg = """<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="11" fill="#E95420"/>
<circle cx="12" cy="12" r="7.5" fill="none" stroke="#fff" stroke-width="2"/>
<circle cx="5" cy="12" r="2.2" fill="#fff"/>
<circle cx="15.5" cy="6" r="2.2" fill="#fff"/>
<circle cx="15.5" cy="18" r="2.2" fill="#fff"/>
</svg>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:wght@400;500;600;700&family=Segoe+UI:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
    background: #090a0f;
    background-image: radial-gradient(circle at 50% 25%, #161b26 0%, #08090d 100%);
    font-family: 'Cascadia Code', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 13.8px;
    line-height: 1.35;
    color: #cccccc;
    width: {width}px;
    height: {height}px;
    overflow: hidden;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}}
.terminal-window {{
    width: 100%;
    height: 100%;
    background: #0c0c0c;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.92), 0 0 0 1px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}}
.tab-bar {{
    height: 38px;
    background: #1f1f1f;
    border-bottom: 1px solid #2a2a2a;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    user-select: none;
    font-family: 'Segoe UI', -apple-system, sans-serif;
}}
.tab-container {{
    display: flex;
    align-items: flex-end;
    padding-left: 8px;
    padding-top: 4px;
    gap: 4px;
}}
.tab {{
    background: #0c0c0c;
    height: 34px;
    border-radius: 6px 6px 0 0;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #ffffff;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
}}
.tab-icon {{
    display: flex;
    align-items: center;
    justify-content: center;
}}
.tab-close {{
    color: #888888;
    font-size: 14px;
    line-height: 1;
    margin-left: 6px;
}}
.new-tab-btn {{
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888888;
    font-size: 16px;
    margin-bottom: 2px;
}}
.dropdown-btn {{
    width: 24px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888888;
    font-size: 11px;
    margin-bottom: 2px;
}}
.window-controls {{
    display: flex;
    align-items: center;
}}
.win-btn {{
    width: 46px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e0e0e0;
    font-size: 12px;
}}
.win-btn.close {{
    font-size: 13px;
}}
.terminal-body {{
    flex: 1;
    padding: 16px 20px;
    overflow: hidden;
    white-space: pre;
    color: #cccccc;
}}
.p-u {{ color: #5af78e; font-weight: 600; }}
.p-a {{ color: #ffffff; }}
.p-h {{ color: #5af78e; font-weight: 600; }}
.p-c {{ color: #ffffff; }}
.p-p {{ color: #57c7ff; font-weight: 600; }}
.p-d {{ color: #ffffff; }}
.cmd {{ color: #ffffff; font-weight: 600; }}
.hp {{ color: #ff9f43; font-weight: 700; }}
.hdb {{ color: #54a0ff; }}
.hok {{ color: #2ecc71; font-weight: bold; }}
.ht {{ color: #888888; }}
.comment {{ color: #6a89cc; font-style: italic; }}
.warn {{ color: #feca57; }}
.cursor {{
    display: inline-block;
    width: 8px;
    height: 16px;
    background: #ffffff;
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
}}
@keyframes blink {{
    0%, 100% {{ opacity: 1; }}
    50% {{ opacity: 0; }}
}}
</style>
</head>
<body>
<div class="terminal-window">
    <div class="tab-bar">
        <div class="tab-container">
            <div class="tab">
                <div class="tab-icon">{ubuntu_svg}</div>
                <span>{tab_title}</span>
                <span class="tab-close">×</span>
            </div>
            <div class="new-tab-btn">+</div>
            <div class="dropdown-btn">˅</div>
        </div>
        <div class="window-controls">
            <div class="win-btn">―</div>
            <div class="win-btn">◻</div>
            <div class="win-btn close">✕</div>
        </div>
    </div>
    <div class="terminal-body">{body_content}</div>
</div>
</body>
</html>
"""

def prompt(user="dhruv", path="~"):
    return f"""<span class="p-u">{user}</span><span class="p-a">@</span><span class="p-h">{user}-VirtualBox</span><span class="p-c">:</span><span class="p-p">{path}</span><span class="p-d">$</span> """

print("Generator helper loaded.")