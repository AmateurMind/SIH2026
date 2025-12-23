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
        # -> Input email and password, then click Sign In to access the student dashboard.
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
        

        # -> Click on Resume Builder link to start testing step-by-step navigation with progress indication.
        frame = context.pages[-1]
        # Click on Resume Builder link in the navigation menu
        elem = frame.locator('xpath=html/body/div/div/nav/div/div/div[2]/a[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Education tab to navigate to Education section and verify content loads correctly.
        frame = context.pages[-1]
        # Click Education tab to navigate to Education section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click Add Education button to add education details.
        frame = context.pages[-1]
        # Click Add Education button to add education details
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in education details in the form fields.
        frame = context.pages[-1]
        # Input institution name
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('University of Example')
        

        frame = context.pages[-1]
        # Input degree
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("Bachelor's")
        

        frame = context.pages[-1]
        # Input field of study
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Computer Science')
        

        frame = context.pages[-1]
        # Input start date
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2018')
        

        frame = context.pages[-1]
        # Input end date
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[5]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2022')
        

        frame = context.pages[-1]
        # Input GPA
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[6]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('3.8')
        

        # -> Click Next button to navigate to Experience section and verify navigation and progress indicator update.
        frame = context.pages[-1]
        # Click Next button to go to Experience section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click Add Experience button to add work experience details.
        frame = context.pages[-1]
        # Click Add Experience button to add work experience
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in remaining experience details: start date, end date or 'currently work here', location, and description.
        frame = context.pages[-1]
        # Input start date
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('06/2022')
        

        frame = context.pages[-1]
        # Click checkbox for 'I currently work here' to mark current employment
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[4]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Input location
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[5]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Mountain View, CA')
        

        frame = context.pages[-1]
        # Input job description
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[2]/div/div[2]/div/div[2]/div[6]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Developed and maintained web applications using React and Node.js.')
        

        # -> Click Next button to navigate to Projects section and verify navigation and progress indicator update.
        frame = context.pages[-1]
        # Click Next button to go to Projects section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click Previous button to navigate back to Experience section and verify data persistence and progress indicator update.
        frame = context.pages[-1]
        # Click Previous button to go back to Experience section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Education tab to navigate back and verify data persistence and progress indicator update.
        frame = context.pages[-1]
        # Click Education tab to navigate to Education section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click Experience tab to navigate to Experience section and verify data persistence and progress indicator update.
        frame = context.pages[-1]
        # Click Experience tab to navigate to Experience section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click Next button to navigate to Projects section and verify navigation and progress indicator update.
        frame = context.pages[-1]
        # Click Next button to go to Projects section
        elem = frame.locator('xpath=html/body/div/div/main/div/main/div/div[2]/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Refresh the page to verify that all entered data persists after page reload.
        await page.goto('http://localhost:5173/student/resume-builder', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Campus Buddy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Passports').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Internships').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Applications').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resume Builder').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Profile').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Aarav Sharma').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=student').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ResumeBuilder').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Template:').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Modern').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Accent Color').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Download PDF').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Personal Info').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Education').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Experience').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Projects').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Skills').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Achievements').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Summary').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Step 1 of 7').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Personal Information').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Profile Photo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Upload a professional photo. Supported formats: JPG, PNG.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Full Name').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Professional Title').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Email').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Phone').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Location').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LinkedIn URL').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Portfolio / Website').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Previous').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Next').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    