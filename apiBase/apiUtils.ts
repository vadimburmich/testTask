import ApiHelper from '..//apiBase/ApiHelper';
import { expect } from '@playwright/test';
import { addProductToBasket } from '../fixtures/apiFixtures';

export async function addProductsToBasket(api: ApiHelper, productId: string, quantity: number) {
  for (let i = 0; i < quantity; i++) {
    const addToBasketResponse = await api.addToBasket(productId, '1');
    expect(addToBasketResponse.status()).toBe(200);
  }
  return quantity
}


export async function loginAndInitialize(api: ApiHelper, loginUrl: string, username: string, password: string) {
    await api.initialize(loginUrl);
    const loginResponse = await api.login(username, password);
    expect(loginResponse.status()).toBe(302);
}

export async function addMultipleProductsToBasket(api: ApiHelper, products: Array<{ price: number; id: string }>, maxCount: number): Promise<number> {
    let totalPrice = 0;
    const itemsToAdd = Math.min(products.length, maxCount);

    for (let i = 0; i < itemsToAdd; i++) {
        await addProductToBasket(api, products[i].id.toString());
        totalPrice += products[i].price;
    }

    return totalPrice;
}

export function getTotalPriceWithDiscount(discountedProduct: { price: number; discount: number }): number {
    return discountedProduct.price - discountedProduct.discount;
}




export { ApiHelper };

