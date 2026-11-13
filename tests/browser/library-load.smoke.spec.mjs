// @ts-check
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const libraryPath = fileURLToPath(new URL('../../libs/js/v2.1.0-beta/Toast.js', import.meta.url));

test('loads the published library in a real browser', async ({ page }) => {
  await page.addScriptTag({ path: libraryPath });
  expect(await page.evaluate(() => 'Toast' in globalThis)).toBe(true);
});
