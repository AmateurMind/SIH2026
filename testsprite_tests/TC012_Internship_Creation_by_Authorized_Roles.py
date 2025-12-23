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
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
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
        # -> Click on 'Login to Portal' button to proceed to login page.
        frame = context.pages[-1]
        # Click on 'Login to Portal' button to go to login page
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Admin' role to proceed to admin login.
        frame = context.pages[-1]
        # Click on 'Admin' role to proceed to admin login.
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[4]/div[2]/div/div/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Login to Portal' button again to try to reach role selection page.
        frame = context.pages[-1]
        # Click on 'Login to Portal' button to go to role selection page again
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Scroll down to check if the 'Login to Portal' button or alternative login options appear further down the page.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Click on 'Login to Portal' button to proceed to role selection page.
        frame = context.pages[-1]
        # Click on 'Login to Portal' button to go to role selection page
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to Admin login page using URL http://localhost:5174/admin/login and perform login with provided admin credentials.
        await page.goto('http://localhost:5174/admin/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input admin email and password, then click 'Access System' button to login as admin.
        frame = context.pages[-1]
        # Input admin email
        elem = frame.locator('xpath=html/body/div/div/main/div/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('aarav.sharma@college.edu')
        

        # -> Send POST request to /api/internships with valid internship data as admin user and verify response status is 201 Created.
        await page.goto('http://localhost:5174/admin/dashboard', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to recruiter login page to attempt login as recruiter for internship posting creation test.
        await page.goto('http://localhost:5175/recruiter/login', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input recruiter email and password, then click 'Sign in to Dashboard' button to login as recruiter.
        frame = context.pages[-1]
        # Input recruiter email
        elem = frame.locator('xpath=html/body/div/div/main/div/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('aarav.sharma@college.edu')
        

        # -> Click 'Sign in to Dashboard' button to login as recruiter.
        frame = context.pages[-1]
        # Click 'Sign in to Dashboard' button to login as recruiter
        elem = frame.locator('xpath=html/body/div/div/main/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Internship Posting Created Successfully').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Only admin and recruiter roles can create internship postings successfully. The test plan execution failed as the expected success message for internship creation was not found, indicating the test did not pass as intended.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    