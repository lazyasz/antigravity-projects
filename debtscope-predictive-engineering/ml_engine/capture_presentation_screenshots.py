import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r"c:\Users\dhruv\.gemini\antigravity-ide\scratch\DebtScope\assets\presentation\screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--hide-scrollbars", "--disable-gpu", "--no-sandbox"]
        )
        
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1.5
        )
        page = context.new_page()

        # 1. Executive Dashboard
        print("Capturing 01_executive_dashboard.png...")
        page.goto("http://localhost:5173/dashboard", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01_executive_dashboard.png"), full_page=False)

        # 2. Priority Matrix
        print("Capturing 02_priority_matrix.png...")
        page.goto("http://localhost:5173/priorities", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02_priority_matrix.png"), full_page=False)

        # 3. File Intelligence
        print("Capturing 03_file_intelligence.png...")
        page.goto("http://localhost:5173/files/1", wait_until="networkidle")
        page.wait_for_timeout(1500)
        try:
            btn = page.locator("button:has-text('Generate Patch')")
            if btn.count() > 0:
                btn.first.click()
                page.wait_for_timeout(2000)
        except Exception as e:
            print("Patch click note:", e)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03_file_intelligence.png"), full_page=False)

        # 4. ML Analytics
        print("Capturing 04_ml_analytics.png...")
        page.goto("http://localhost:5173/predictions", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04_ml_analytics.png"), full_page=False)

        # 5. AI Refactoring Copilot
        print("Capturing 05_refactoring_copilot.png...")
        page.goto("http://localhost:5173/copilot", wait_until="networkidle")
        page.wait_for_timeout(1000)
        try:
            # Type and send prompt
            input_el = page.locator("input[placeholder*='Ask Copilot']")
            if input_el.count() > 0:
                input_el.fill("Explain the risk factors and remediation for services/auth/token_provider.py")
                page.locator("button[type='submit']").click()
                page.wait_for_timeout(1800)
        except Exception as e:
            print("Copilot query note:", e)
        # Scroll to top of page so header and conversation are visible
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "05_refactoring_copilot.png"), full_page=False)

        # 6. Project Overview / Code Hotspots
        print("Capturing 06_project_overview.png...")
        page.goto("http://localhost:5173/hotspots", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "06_project_overview.png"), full_page=False)

        # 7. Backend / API Documentation (FastAPI Swagger)
        print("Capturing 07_api_documentation.png...")
        page.goto("http://127.0.0.1:8000/docs", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "07_api_documentation.png"), full_page=False)

        # 8. Data Pipeline Evidence (Data Lineage & Quality)
        print("Capturing 08_data_pipeline.png...")
        page.goto("http://localhost:5173/data-quality", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08_data_pipeline.png"), full_page=False)

        browser.close()
        print("All screenshots successfully captured!")

if __name__ == "__main__":
    capture_all()
