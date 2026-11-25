import { test, expect } from '@playwright/test';

async function login(page, username, classNumber) {
  await page.goto('/#/login');
  await page.locator('#login-username').fill(username);
  await page.locator('#login-password').fill('password123');
  await page.locator('form').getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByText(`Giảng viên • Lớp ${classNumber}`)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#/labs/${classNumber}$`));
}

test('the lab form preserves multiline tests and another class sees the server 404', async ({
  page,
  browser,
}) => {
  await login(page, 'ta_a', 1);
  await page.getByRole('button', { name: /← Lớp:/ }).click();
  await page.getByRole('button', { name: /Vào lớp học/ }).click();
  await page.getByRole('button', { name: /Danh sách Lab/ }).click();
  await page.getByRole('button', { name: /Tạo bài thực hành mới/i }).click();
  await page.getByPlaceholder(/vd: Lab 3:/).fill('Multiline lab');
  await page.getByPlaceholder(/Mô tả chi tiết yêu cầu bài toán/).fill('Sort the input.');
  await page.locator('#test-case-input-0').fill('3\n3 1 2\n');
  await page.locator('#test-case-output-0').fill('1 2 3\n');
  await page.getByRole('button', { name: /Thêm Test Case/ }).click();
  await page.locator('#test-case-input-1').fill('1\n42\n');
  await page.locator('#test-case-output-1').fill('42\n');
  await page.locator('#constraint-text-0').fill('Do not call `std::sort`.');
  await page.getByRole('button', { name: /Thêm ràng buộc/ }).click();
  await page.locator('#constraint-text-1').fill('Use merge sort.');
  const creation = page.waitForResponse(
    (response) => response.url().endsWith('/api/labs') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tạo bài thực hành', exact: true }).click();
  const created = await creation;
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  const payload = created.request().postDataJSON();
  expect(payload.testCases.map(({ input, expectedOutput }) => [input, expectedOutput])).toEqual([
    ['3\n3 1 2\n', '1 2 3\n'],
    ['1\n42\n', '42\n'],
  ]);
  expect(payload.constraints).toHaveLength(2);

  const otherClass = await browser.newPage({ baseURL: new URL(page.url()).origin });
  try {
    await login(otherClass, 'ta_b', 2);
    const denied = otherClass.waitForResponse(
      (response) => response.url().endsWith(`/api/labs/${id}`) && response.status() === 404,
    );
    await otherClass.evaluate((labId) => {
      window.location.hash = `#/labs/${labId}`;
    }, id);
    await denied;
    await expect(otherClass.getByText('404 — Không tìm thấy bài thực hành')).toBeVisible();
    await expect(otherClass.getByRole('button', { name: 'Publish grades' })).toHaveCount(0);
  } finally {
    await otherClass.close();
  }
});
