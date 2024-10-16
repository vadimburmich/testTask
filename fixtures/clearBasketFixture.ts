import { test as base, chromium } from '@playwright/test';
import { Page, Browser } from '@playwright/test';
import MainPage from '../pages/MainPage';
import ApiHelper from '../apiBase/ApiHelper';

async function clearBasket(browser: Browser) {
  const page = await browser.newPage();
  const api = new ApiHelper(page);

  try {
    await api.initialize('https://enotes.pointschool.ru/login');
    await api.login('test', 'test');
    const clearBasketResponse = await api.clearBasket();
    console.log(await clearBasketResponse.text());
  } catch (error) {
    console.error('Clear basket error:', error);
  } finally {
    await page.close();
    await browser.close();
  }
}

async function addItemToBasket(page: Page, numberOfBooks: number, quantity: number, productType: 'discounted' | 'regular' | 'all') {
  const mainPage = new MainPage(page);
  await page.goto('https://enotes.pointschool.ru/');
  await page.waitForLoadState('load');
  await page.getByRole('link', { name: 'Вход' }).click();
  await page.getByPlaceholder('Логин клиента').pressSequentially('test');
  await page.getByPlaceholder('Пароль клиента').pressSequentially('test');
  await page.getByRole('button', { name: 'Вход' }).click();
  await page.waitForLoadState('load');
  await page.locator("//*[@data-page-number='2']").click();
  await page.waitForTimeout(2000)
  await page.waitForLoadState('load');
  const productsInfo = await mainPage.addMultipleBooksToCart(numberOfBooks, quantity, productType);
  await page.waitForLoadState('load');
  await page.locator("//*[@data-page-number='1']").click();
  await page.waitForTimeout(2000)
  return productsInfo; 
}

type FixtureType = {
  clearBasket: () => Promise<void>;
  addItemToBasket: (numberOfBooks: number, quantity: number, productType: 'discounted' | 'regular' | 'all') => Promise<{ totalBooks: number; totalPrice: number; productsInfo: any[] }>;
}

export const test = base.extend<FixtureType>({
  clearBasket: async ({}, use) => {
    await use(async () => {
      const browser = await chromium.launch();
      await clearBasket(browser);
    });
  },

  addItemToBasket: async ({ page }, use) => {
    await use(async (numberOfBooks: number, quantity: number, productType) => {
      const productsInfo = await addItemToBasket(page, numberOfBooks, quantity, productType);
      return productsInfo; 
    });
  },
});


export { expect } from '@playwright/test';
