import { test, expect } from '@playwright/test';
import ApiHelper from '../../apiBase/ApiHelper';
import { addMultipleProductsToBasket, addProductsToBasket, getTotalPriceWithDiscount, loginAndInitialize } from '../../apiBase/apiUtils';
import { addProductToBasket } from '../../fixtures/apiFixtures';


test.beforeEach(async ({ page }) => {
    const api = new ApiHelper(page);
    await api.initialize('https://enotes.pointschool.ru/login');
    const loginResponse = await api.login('test', 'test');
    expect(loginResponse.status()).toBe(302);
    const clearBasketResponse = await api.clearBasket();
    expect(clearBasketResponse.status()).toBe(200);
  });

  test('Scenario 1', async ({ page }) => {
    const api = new ApiHelper(page);
    await loginAndInitialize(api, 'https://enotes.pointschool.ru/login', 'test', 'test');
    const productResponse = await api.getProducts();
    const productData = await productResponse.json();
    expect(productData.products.length).toBeGreaterThan(0);
    const discountedProduct = productData.products.find(product => product.discount > 0);
    const countOfAddedItems = await addProductsToBasket(api, discountedProduct.id.toString(), 9);
    const basketResponse = await api.getBasket();
    const basketData = await basketResponse.json();
    expect(basketData.basketCount).toBe(countOfAddedItems);
    const priceWithDiscount = discountedProduct.price - discountedProduct.discount;
    const expectedTotalPrice = priceWithDiscount * countOfAddedItems;
    expect(basketData.basketPrice).toBe(expectedTotalPrice);
  });


  test('Scenario 2', async ({ page }) => {
    const api = new ApiHelper(page);
    await loginAndInitialize(api, 'https://enotes.pointschool.ru/login', 'test', 'test');
    const productResponse = await api.getProducts(1);
    const productData = await productResponse.json();
    const discountedProduct = productData.products.find(product => product.discount > 0);
    expect(discountedProduct).toBeTruthy();
    await addProductToBasket(api, discountedProduct.id.toString());
    const basketData = await (await api.getBasket()).json();
    expect(basketData.basket.find(item => item.id === discountedProduct.id).count).toBe(1);
    const otherProducts = productData.products.filter(product => product.id !== discountedProduct.id);
    let totalPrice = getTotalPriceWithDiscount(discountedProduct);
    totalPrice += await addMultipleProductsToBasket(api, otherProducts, 8);
    const finalBasketData = await (await api.getBasket()).json();
    expect(finalBasketData.basketPrice).toBe(totalPrice);
});





test('Scenario 3', async ({ page }) => {
    const api = new ApiHelper(page);
    await loginAndInitialize(api, 'https://enotes.pointschool.ru/login', 'test', 'test');
    const productResponse = await api.getProducts();
    const productData = await productResponse.json();
    expect(productData.products.length).toBeGreaterThan(0);
    const discountedProduct = productData.products.find(product => product.discount > 0);
    await addProductToBasket(api, discountedProduct.id.toString());
    const basketResponse = await api.getBasket();
    const basketData = await basketResponse.json();
    expect(basketData.basketCount).toBe(1);
    const priceWithDiscount = discountedProduct.price - discountedProduct.discount;
    expect(basketData.basketPrice).toBe(priceWithDiscount);
});


test('Scenario 4', async ({ page }) => {
    const api = new ApiHelper(page);
    await loginAndInitialize(api, 'https://enotes.pointschool.ru/login', 'test', 'test');
    const productResponse = await api.getProducts();
    const productData = await productResponse.json();
    expect(productData.products.length).toBeGreaterThan(0);
    const nonDiscountedProduct = productData.products.find(product => product.discount === 0);
    await addProductToBasket(api, nonDiscountedProduct.id.toString());
    const basketResponse = await api.getBasket();
    const basketData = await basketResponse.json();
    expect(basketData.basketCount).toBe(1);
    expect(basketData.basketPrice).toBe(nonDiscountedProduct.price);
});





