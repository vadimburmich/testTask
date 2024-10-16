import { Locator, Page } from "@playwright/test";
class Basket {
    readonly page: Page;
    readonly basket: Locator;
    readonly productName: Locator;
    readonly itemPrice: Locator;
    readonly basketContainer: Locator;
    readonly totalBasketPrice: Locator;
    readonly BasketQuantity: Locator;
    readonly basketDropDown: Locator;

    constructor(page: Page) {
        this.page = page;
        this.basket = page.locator("//*[@id='basketContainer']")
        this.productName = this.basket.locator("//span[contains(@class,'basket-item-title')]")
        this.itemPrice = this.basket.locator("//span[contains(@class,'basket-item-price')]")
        this.basketContainer = this.basket.locator("//li[contains(@class,'basket-item')]")
        this.totalBasketPrice = page.locator("//*[contains(@class,'basket_price')]")
        this.BasketQuantity =  page.locator("//*[@id='basketContainer']/span")
        this.basketDropDown = page.locator("//*[@id='dropdownBasket']")
    }

    async openDropDownBasket(){
        await this.basketDropDown.click({delay:4000})
        await this.page.waitForSelector("//*[contains(@class,'dropdown-menu-right show')]", { state: 'visible' });
    }

    async getBasketQuantity(){
        const formatBasketQuantity = await this.BasketQuantity.textContent()
        await this.page.waitForLoadState('load');
        return Number(formatBasketQuantity)
    }

    async getProductName(){
       return await this.productName.textContent()
    }

    async getItemPrice(){
        return await this.itemPrice.textContent()
     }

    async getBasketPrice(){
        const price = await this.totalBasketPrice.textContent()
        return Number(price)
    }


     async getBasketItems(): Promise<string[]> {
        const items: string[] = [];
        const itemCount = await this.basketContainer.count();
        for (let i = 0; i < itemCount; i++) {
            const itemText = await this.basketContainer.nth(i).innerText();
            const formattedText = itemText
                .replace(/\n/g, ' ')                
                .replace(/- +/g, '-')               
                .replace(/ +/g, ' ')                 
                .replace(/ 1$/, '')                  
                .replace(/ +р\. +/g, ' р.')          
                .replace(/ +-\s*/g, ' - ')           
                .trim();                             
            const bookInfo = formattedText.replace(/ - (\d+)(\s+р\.)/g, ' - $1 р.');
            
            items.push(bookInfo);
        }
    
        return items;

    }


}
export default Basket