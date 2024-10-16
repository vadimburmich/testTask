import { test } from '../../fixtures/clearBasketFixture';
import { expect } from '@playwright/test';
import MainPage from '../../pages/MainPage';
import Basket from '../../pages/Basket';

test.describe('Store Tests', () => {


test('Scenario 1', async ({ page, clearBasket }) => {
  await clearBasket()
  const mainPage = new MainPage(page);
  const basket = new Basket(page);
  await mainPage.login('test', 'test')
  const productsInfo = await mainPage.addMultipleBooksToCart(1,8, 'discounted')
  await page.waitForLoadState('load');
  const quantityInBasket = await basket.getBasketQuantity()
  expect.soft(quantityInBasket).toEqual(productsInfo.totalBooks)
  expect.soft(await basket.getBasketPrice()).toEqual(productsInfo.totalPrice)
  await basket.openDropDownBasket()
  const basketItems = await basket.getBasketItems();
  console.log(basketItems);
  console.log(productsInfo.totalBooks)
  expect(productsInfo.productsInfo).toEqual(basketItems)

 
});


test('Scenario 2', async ({page, addItemToBasket}) => {
  // await clearBasket() 
  const itemFromPrecondition = await addItemToBasket(1,1,'discounted');
  const mainPage = new MainPage(page);
  const basket = new Basket(page);
  let productsInfoPre: string[] = [];
  productsInfoPre.push(...itemFromPrecondition.productsInfo);
  const productsInfo = await mainPage.addMultipleBooksToCart(8,1, 'all')
  await page.waitForLoadState('load');
  productsInfoPre.push(...productsInfo.productsInfo);
  const quantityInBasket = await basket.getBasketQuantity()
  expect.soft(quantityInBasket).toEqual(productsInfo.totalBooks + itemFromPrecondition.totalBooks)
  expect.soft(await basket.getBasketPrice()).toEqual(productsInfo.totalPrice + itemFromPrecondition.totalPrice)
  await basket.openDropDownBasket()
  const basketItems = await basket.getBasketItems();
  expect(productsInfoPre).toEqual(basketItems)


})


test('Scenario 3', async ({page,clearBasket}) => {
  await clearBasket() 
  const mainPage = new MainPage(page);
  const basket = new Basket(page);
  await mainPage.login('test', 'test')
  const productsInfo = await mainPage.addMultipleBooksToCart(1,1, 'discounted')
  await page.waitForLoadState('load');
  const quantityInBasket = await basket.getBasketQuantity()
  expect.soft(quantityInBasket).toEqual(productsInfo.totalBooks)
  expect.soft(await basket.getBasketPrice()).toEqual(productsInfo.totalPrice)
  await basket.openDropDownBasket()
  const basketItems = await basket.getBasketItems();
  console.log('BASKET!!', basketItems);
  console.log(productsInfo.totalBooks)
  console.log(quantityInBasket)
  expect(productsInfo.productsInfo).toEqual(basketItems)

})


test('Scenario 4', async ({page,clearBasket}) => {
  await clearBasket() 
  const mainPage = new MainPage(page);
  const basket = new Basket(page);
  await mainPage.login('test', 'test')
  const productsInfo = await mainPage.addMultipleBooksToCart(1,1, 'regular')
  await page.waitForLoadState('load');
  const quantityInBasket = await basket.getBasketQuantity()
  expect.soft(quantityInBasket).toEqual(productsInfo.totalBooks)
  expect.soft(await basket.getBasketPrice()).toEqual(productsInfo.totalPrice)
  await basket.openDropDownBasket()
  const basketItems = await basket.getBasketItems();
  console.log('BASKET!!', basketItems);
  console.log(productsInfo.totalBooks)
  console.log(quantityInBasket)
  expect(productsInfo.productsInfo).toEqual(basketItems)


})




})
