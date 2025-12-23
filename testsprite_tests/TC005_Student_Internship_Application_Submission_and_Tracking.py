import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173/f:\\2ndpsnew-main-main - Copy", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input email and password, then click Sign In button to authenticate as student.
        frame = context.pages[-1]
        # Input email address
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('aarav.sharma@college.edu')
        

        frame = context.pages[-1]
        # Input password
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('demo123')
        

        frame = context.pages[-1]
        # Click Sign In button
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Browse Internships' to find a valid internship posting to apply.
        frame = context.pages[-1]
        # Click on Browse Internships to find internship postings
        elem = frame.locator('xpath=html/body/div/div/main/div/div[3]/div[2]/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Apply Now' button for the 'Frontend' internship to start application process.
        frame = context.pages[-1]
        # Click 'Apply Now' button for Frontend internship
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input a cover letter in the textarea and click 'Submit Application' to apply for the internship.
        frame = context.pages[-1]
        # Input cover letter text
        elem = frame.locator('xpath=html/body/div/div/main/div/div[2]/div/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('I am very interested in this internship because it aligns perfectly with my skills in React and frontend development. I am eager to contribute and learn from TechCorp Solutions.')
        

        frame = context.pages[-1]
        # Click 'Submit Application' button to submit the internship application
        elem = frame.locator('xpath=html/body/div/div/main/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Check other available internships with 'Apply Now' button and try applying to one where eligibility is met.
        frame = context.pages[-1]
        # Click 'Apply Now' button for Full Stack Development Intern to try applying there
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[8]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Submit Application' button to submit the application for 'Mobile App Development Intern'.
        frame = context.pages[-1]
        # Click 'Submit Application' button to submit the internship application
        elem = frame.locator('xpath=html/body/div/div/main/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to the 'Applications' tab or student dashboard to fetch and verify the application status for 'Mobile App Development Intern'.
        frame = context.pages[-1]
        # Click on 'Applications' tab to view all internship applications and their statuses
        elem = frame.locator('xpath=html/body/div/div/nav/div/div/div[2]/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Pending Mentor Approval').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Full Stack Development Intern').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mobile App Development Intern').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    