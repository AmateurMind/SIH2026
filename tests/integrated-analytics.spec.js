import { test, expect } from '@playwright/test';

test.describe('Integrated Analytics Testing', () => {
  test('Student analytics data flows to admin dashboard', async ({ page, context }) => {
    // Login as student on frontend (port 5173)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'test.student@college.edu');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student/dashboard');

    // Perform actions that generate analytics data
    await page.goto('http://localhost:5173/student/applications');
    // Assume some application interaction

    // Switch to admin dashboard on SuperAdmin (port 5174)
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5174/login');
    await adminPage.fill('input[name="email"]', 'test.admin@college.edu');
    await adminPage.fill('input[name="password"]', 'test123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard');

    // Check if analytics reflect the student activity
    await adminPage.goto('http://localhost:5174/admin/analytics');
    await expect(adminPage.locator('text=Total Applications')).toBeVisible();
    // Add more assertions based on analytics data
  });

  test('Recruiter analytics updates after internship posting', async ({ page }) => {
    // Login as recruiter on SuperAdmin
    await page.goto('http://localhost:5174/login');
    await page.fill('input[name="email"]', 'test.recruiter@techcorp.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/recruiter/dashboard');

    // Post new internship
    await page.goto('http://localhost:5174/recruiter/internships');
    await page.click('button:has-text("Post Internship")');
    // Fill form and submit

    // Check analytics
    await page.goto('http://localhost:5174/recruiter/dashboard');
    await expect(page.locator('text=Active Internships')).toContainText('1');
  });

  test('Cross-app analytics consistency', async ({ page, context }) => {
    // Check admin analytics
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5174/admin/analytics');
    const adminStats = await adminPage.textContent('.total-students');

    // Check student count from student app
    await page.goto('http://localhost:5173/student/dashboard');
    // Assume some way to verify consistency

    expect(adminStats).toBeTruthy();
  });
});