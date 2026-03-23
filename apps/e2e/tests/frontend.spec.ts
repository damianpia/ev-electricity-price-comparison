import { test, expect } from '@playwright/test';

test('frontend home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/frontend/i);
});
