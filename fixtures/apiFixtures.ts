import { ApiHelper } from '../apiBase/apiUtils';

export async function addProductToBasket(api: ApiHelper, productId: string, quantity: number = 1): Promise<any[]> {
    const response = await api.addToBasket(productId, quantity.toString());
    return [{ id: productId, count: quantity }];
}