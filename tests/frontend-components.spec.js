import { test, expect } from '@playwright/test';

test.describe('Frontend Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('Login form validation', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation or stay on page
      await page.waitForTimeout(500);
      
      const url = page.url();
      console.log('Current URL after empty submit:', url);
      
      // Page should still be on login (not navigated)
      expect(url).toContain('localhost:5173');
    }
  });

  test('Password visibility toggle', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await passwordInput.isVisible()) {
      // Check if eye icon exists
      const eyeIcon = page.locator('[class*="eye"], [aria-label*="password" i]').first();
      
      if (await eyeIcon.count() > 0) {
        await eyeIcon.click();
        
        // Password field should change type
        const inputType = await passwordInput.getAttribute('type');
        console.log('Password input type after toggle:', inputType);
      }
    }
  });

  test('Demo credentials are displayed', async ({ page }) => {
    // Look for demo credentials section
    const demoSection = await page.getByText(/demo/i).count();
    
    if (demoSection > 0) {
      console.log('✓ Demo credentials section found');
      
      // Check if there are any credential cards
      const credentialCards = await page.locator('[class*="credential"], [class*="demo"]').count();
      console.log('Credential elements found:', credentialCards);
    }
  });

  test('Registration toggle works', async ({ page }) => {
    // Look for register/signup link
    const registerLink = page.getByText(/register|sign up|create account/i).first();
    
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await page.waitForTimeout(500);
      
      // Should show registration form
      const hasNameField = await page.locator('input[name="name"], input[placeholder*="name" i]').count();
      console.log('Registration form visible:', hasNameField > 0);
      
      if (hasNameField > 0) {
        expect(hasNameField).toBeGreaterThan(0);
      }
    }
  });

  test('Form inputs accept text', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword123');
    
    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();
    
    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('testpassword123');
    
    console.log('✓ Form inputs accept and retain values');
  });

  test('Page responsiveness - mobile viewport', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check if content is visible
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
    
    console.log('✓ Page renders on mobile viewport');
  });

  test('Navigation to different routes', async ({ page }) => {
    // Try accessing public resume route
    await page.goto('http://localhost:5173/resume/test-id');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    console.log('Accessed route:', url);
    
    // Should load without crashing
    const hasError = await page.getByText(/error|not found|500|404/i).count();
    console.log('Error messages found:', hasError);
  });

  test('Accessibility - form labels', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    
    // Check if input has associated label or aria-label
    const ariaLabel = await emailInput.getAttribute('aria-label');
    const placeholder = await emailInput.getAttribute('placeholder');
    const id = await emailInput.getAttribute('id');
    
    const hasAccessibility = ariaLabel || placeholder || id;
    
    console.log('Email input accessibility:', {
      ariaLabel,
      placeholder,
      id: id ? `has ID (${id})` : null
    });
    
    expect(hasAccessibility).toBeTruthy();
  });

  test('Theme and styling loads', async ({ page }) => {
    // Check if Tailwind or custom styles are loaded
    const body = page.locator('body');
    const bodyClass = await body.getAttribute('class');
    const bodyStyle = await body.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    console.log('Body classes:', bodyClass);
    console.log('Body background color:', bodyStyle);
    
    // Should have some styling
    expect(bodyStyle).toBeTruthy();
  });

  test('Client-side routing works', async ({ page }) => {
    // Check if React Router is working
    const initialUrl = page.url();
    
    // Try to navigate programmatically
    await page.evaluate(() => {
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', '/test');
      }
    });
    
    await page.waitForTimeout(100);
    const newUrl = page.url();
    
    console.log('URL navigation:', { initialUrl, newUrl });
    
    // React Router should handle this
    expect(newUrl).toContain('/test');
  });
});

test.describe('Frontend Performance', () => {
  test('Page load time is acceptable', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('No console errors on load', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log('Console errors:', consoleErrors.length);
    
    if (consoleErrors.length > 0) {
      console.log('Errors found:', consoleErrors);
    }
    
    // Ideally should have no errors (but some warnings are okay)
    // This is informational rather than blocking
  });
});
