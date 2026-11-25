import { test, expect } from '@playwright/test';

test('TA in another class sees the server 404 on the lab screen', async ({ page }) => {
  await page.goto('/#/login');
  await page.locator('#login-username').fill('ta_b');
  await page.locator('#login-password').fill('password123');
  await page.locator('form').getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByText('Giảng viên • Lớp 2')).toBeVisible();
  await expect(page).toHaveURL(/#\/labs\/2$/);

  const denied = page.waitForResponse(
    (response) => response.url().endsWith('/api/labs/1') && response.status() === 404,
  );
  await page.evaluate(() => {
    window.location.hash = '#/labs/1';
  });
  await denied;
  await expect(page.getByText('404 — Không tìm thấy bài thực hành')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish grades' })).toHaveCount(0);
});
