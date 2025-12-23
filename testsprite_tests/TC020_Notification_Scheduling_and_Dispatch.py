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
        # -> Click on 'Login to Portal' button to start login process
        frame = context.pages[-1]
        # Click on 'Login to Portal' button
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Student' role to proceed to login form
        frame = context.pages[-1]
        # Click on 'Student' role
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Login to Portal' button again to restart login process
        frame = context.pages[-1]
        # Click on 'Login to Portal' button to restart login process
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Login to Portal' button to proceed to role selection page.
        frame = context.pages[-1]
        # Click on 'Login to Portal' button
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[3]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Login to Portal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Select your role to access the dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Students').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Placement Cell').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Faculty').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Recruiters').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI-Powered').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Internship & Placement Portal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Automate your campus hiring with AI Mock Interviews, 1-Click Applications, and smart resume parsing. Connecting talent with opportunity instantly.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Intelligent Recruitment').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Replace manual coordination with automated workflows. From resume building to final offer, CampusBuddy handles the heavy lifting.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI Mock Interviews').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Practice with our voice-enabled AI bot. Get instant scoring on confidence, technical accuracy, and soft skills.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Auto-Resume Builder').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Generate ATS-friendly resumes in seconds. Our system auto-fills data from your verified digital profile.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Digital Badges').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Earn verifiable badges for internships and skills. Showcase your achievements directly to recruiters.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1-Click Apply').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Apply to multiple companies instantly. Smart filters ensure you only see roles you are eligible for.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Secure Role Access').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Dedicated portals for Placement Officers, Students, and Mentors with secure, role-based data privacy.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Mentor Approval').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Digital workflow for internship approvals. Mentors can review progress and sign off digitally.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Application Workflow').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Automated status tracking from initial application to final offer letter generation.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Smart Application Pipeline').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=For Placement Cells & Recruiters: Track thousands of applications in a single view.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Our system automatically parses resumes, matches candidates to job descriptions (JD), schedules interviews, and generates offer letters upon selection. Zero paperwork.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Real-time Placement Analytics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Colleges get a bird's-eye view of placement stats, average packages, and skill trends. Recruiters see funnel metrics.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Placement Analytics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Compare the effectiveness of the CampusBuddy placement ecosystem against traditional manual placement cells.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=One Platform, Four Roles').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Seamless collaboration between all stakeholders in the placement process.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Students').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Build digital profiles, practice with AI, apply to drives, and track status instantly.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Placement Cell').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Invite companies, manage student data, schedule drives, and generate compliance reports.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Faculty').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Approve internships, provide project feedback, and validate skill badges for students.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Recruiters').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Post jobs, filter candidates via AI scoring, and conduct seamless remote interviews.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=VERIFIED CREDENTIALS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Block-chain Secured Certificates').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Certificate Generation').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Upon successful completion of an internship or training module, the system automatically mints a verifiable digital certificate.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=These certificates are cryptographically signed and can be directly shared on LinkedIn or attached to the digital resume, giving recruiters absolute trust in the candidate's credentials.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Launch Your Career With').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=50+ Top Recruiters').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Create Account for Students').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CAMPUS BUDDY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=The complete operating system for campus placements. Bridging the gap between academia and industry with intelligent automation.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PLATFORM').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=For Students').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=For Colleges').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=For Recruiters').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=FEATURES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resume Builder').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI Mock Interviews').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Placement Stats').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LEGAL').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Privacy Policy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Terms of Service').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Security').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CONTACT US').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=rohanpawar907553@gmail.com').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=8767342647').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Shivaji Nagar, Pune').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2025 CampusBuddy Portal. All rights reserved.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    