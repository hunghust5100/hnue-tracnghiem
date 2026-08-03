const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const indexPath = 'file://' + path.resolve(__dirname, '../index.html#courses?subject=cnxh&tab=quizzes');
    
    console.log('Navigating to:', indexPath);
    await page.goto(indexPath);
    await page.waitForTimeout(1000);

    // Take screenshot of course page
    await page.screenshot({ path: path.resolve(__dirname, '../scratch/test_courses.png') });
    console.log('Courses page screenshot saved.');

    // Click "Làm bài" on Chapter 1
    const lamBaiBtn = page.locator('text=Làm bài').first();
    await lamBaiBtn.click();
    await page.waitForTimeout(500);

    // Click "Bắt đầu làm bài" modal button
    const startBtn = page.locator('text=🚀 Bắt đầu làm bài');
    await startBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot of quiz room
    await page.screenshot({ path: path.resolve(__dirname, '../scratch/test_quiz_room.png') });
    console.log('Quiz room screenshot saved.');

    await browser.close();
    console.log('Test completed successfully!');
})();
