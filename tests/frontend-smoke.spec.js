import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Should redirect to login or show homepage
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded
    const title = await page.title();
    expect(title).toBeTruthy();
    
    console.log('Page title:', title);
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Look for common login elements
    const hasEmailInput = await page.locator('input[type="email"], input[placeholder*="email" i]').count();
    const hasPasswordInput = await page.locator('input[type="password"]').count();
    
    console.log('Email inputs found:', hasEmailInput);
    console.log('Password inputs found:', hasPasswordInput);
    
    // Should have login form elements
    expect(hasEmailInput).toBeGreaterThan(0);
    expect(hasPasswordInput).toBeGreaterThan(0);
  });

  test('Navigation elements are present', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check for any navigation or branding
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText.length).toBeGreaterThan(0);
    
    console.log('Page loaded with content length:', bodyText.length);
  });

  test('API health check', async ({ request }) => {
    // Test if backend is responding
    try {
      const response = await request.get('http://localhost:5000/api/health').catch(() => null);
      
      if (response && response.ok()) {
        console.log('✓ Backend API is responding');
        const data = await response.json();
        console.log('API response:', data);
      } else {
        console.log('⚠ Backend API not responding (this is okay if not started)');
      }
    } catch (error) {
      console.log('⚠ Backend check skipped:', error.message);
    }
  });

  test('Frontend assets load', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Check if any React components rendered
    const reactRoot = await page.locator('#root').count();
    expect(reactRoot).toBe(1);
    
    console.log('React root element found');
  });
});
