import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')

        # Go to the local file
        page.goto(f'file://{file_path}')

        # Wait for the page to load completely
        page.wait_for_load_state('networkidle')

        # Take a screenshot
        page.screenshot(path='jules-scratch/verification/verification.png')

        browser.close()

if __name__ == "__main__":
    run()