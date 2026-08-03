from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    # 1. Test index.html
    index_path = 'file://' + os.path.abspath('index.html')
    print('Testing index.html:', index_path)
    page.goto(index_path)
    page.wait_for_timeout(1000)
    print('Title:', page.title())

    # Click "Khám phá Khóa học"
    btn = page.locator('text=Khám phá Khóa học').first
    btn.click()
    page.wait_for_timeout(1000)
    print('Navigated to:', page.url)

    # 2. Test courses.html
    print('Expanded subfolder...')
    subfolder = page.locator('.subfolder-header').first
    if subfolder.is_visible():
        subfolder.click()
        page.wait_for_timeout(500)

    # Click "Làm bài"
    lam_bai = page.locator('text=Làm bài').first
    lam_bai.click()
    page.wait_for_timeout(500)

    # Click "Bắt đầu làm bài"
    start_btn = page.locator('text=🚀 Bắt đầu làm bài').first
    start_btn.click()
    page.wait_for_timeout(1000)

    # 3. Test quiz-room.html
    print('Quiz room loaded at:', page.url)
    title_el = page.locator('#active-quiz-title')
    print('Active Quiz Title:', title_el.inner_text())

    # Take screenshot of quiz room
    page.screenshot(path='scratch/test_modular_quiz_room.png')
    print('Quiz room screenshot saved successfully!')

    browser.close()
