import { Locator, Page } from "@playwright/test";

class MainPage {
    readonly page: Page;
    readonly productsDiscount: Locator;
    readonly allProducts: Locator;
    readonly withoutDiscount: Locator;
    price?: String | null;
    quant : number;

    
    constructor(page: Page) {
        this.page = page;
        // this.productsDiscount = page.locator("//*[contains(@class,'hasDiscount')]");
        this.allProducts = page.locator("//*[contains(@class,'note-item')]")
        this.productsDiscount = page.locator("//*[contains(@class, 'note-item') and contains(@class, 'hasDiscount')]");
        this.withoutDiscount = page.locator("//*[contains(@class, 'note-item') and not(contains(@class, 'hasDiscount'))]")
    }

    async login(login:string, password:string){
        await this.page.goto('https://enotes.pointschool.ru/');
        await this.page.waitForLoadState('load');
        await this.page.getByRole('link', { name: 'Вход' }).click();
        await this.page.getByPlaceholder('Логин клиента').pressSequentially(login);
        await this.page.getByPlaceholder('Пароль клиента').pressSequentially(password);
        await this.page.getByRole('button', { name: 'Вход' }).click();
        await this.page.waitForLoadState('load');
    }


    async addMultipleBooksToCart(numberOfBooks: number, quantity: number, productType: 'discounted' | 'regular' | 'all'): Promise<{ productsInfo: string[], totalBooks: number, totalPrice: number }> {
        const productsInfo: string[] = [];
        let totalBooks = 0;
        let totalPrice = 0;
    
        for (let i = 1; i <= numberOfBooks; i++) {
            const product = await this.selectProduct(i, productType);
    
            if (!product) {
                continue;
            }
    
            await this.enterQuanity(product, quantity.toString());
    
            const bookName = await this.getBookName(product);
    
            let productPrice = await this.getProducPrice(product);
            let formatPrice: string = '';
            if (productPrice) {
                let firstPrice = productPrice.split(' ')[0];
                formatPrice = firstPrice.replace(/[^\d]/g, '');
            }
    
            await this.clickBuyBtn(product);
    
            const [response] = await Promise.all([
                this.page.waitForResponse(response =>
                    response.url().includes('/basket/get') && response.status() === 200
                ),
            ]);
    
            totalBooks += quantity;
            totalPrice += Number(formatPrice) * quantity;
    
            const productInfo = `${bookName} - ${Number(formatPrice) * quantity} р.`; 
            productsInfo.push(productInfo);
            console.log(productInfo);
        }
    
        return { productsInfo, totalBooks, totalPrice };
    }
    

    async selectProduct(bookIndex: number, productType: 'discounted' | 'regular' | 'all'): Promise<Locator> {
        let productLocator: Locator;

        if (productType === 'discounted') {
            productLocator = this.productsDiscount;
        } else if (productType === 'regular') {
            productLocator = this.withoutDiscount;
        } else {
            productLocator = this.allProducts;
        }
    
        const productCount = await productLocator.count();
        if (bookIndex < 1 || bookIndex > productCount) {
            console.log('Error in count items')
        }
    
        return productLocator.nth(bookIndex - 1);
    }


    async enterQuanity(productLocator:Locator,quantity:string ){
        const quantityInput = productLocator.locator("//*[@name='product-enter-count']");
        await quantityInput.fill(quantity)
    }

    async clickBuyBtn(producLocator: Locator){
        const buyButton = producLocator.locator("//ancestor::div[2]/button");
        await buyButton.click({delay:500});
    }


    async getBookName(producLocator: Locator) : Promise <String | null> {
        const bookName = await producLocator.locator("//div[contains(@class,'product_name')]").textContent()
        return bookName;
    }

    async getProducPrice(producLocator: Locator): Promise <String | null>{
        const productPrice = await producLocator.locator("//span[contains(@class,'product_price')]").textContent();
        return productPrice;
    }


    async buyBookByIndex(bookIndex: number, quantity: number) {
        const productCount = await this.productsDiscount.count();

        if (bookIndex < 1 || bookIndex > productCount) {
            console.log(`Error in count of items`);
            return;
        }
        const product = this.productsDiscount.nth(bookIndex - 1);
        const quantityInput = product.locator("//*[@name='product-enter-count']");
        await quantityInput.fill(quantity.toString());
        const bookName = await product.locator("//div[contains(@class,'product_name')]").textContent()
        const productPrice = await product.locator("//span[contains(@class,'product_price')]").textContent()
        this.price = productPrice
        this.quant = quantity
        const price =  await this.getProductPrice()
        const buyButton = product.locator("//ancestor::div[2]/button");
        await buyButton.click();
        return { bookName, quantity, price }
    }

    async getProductPrice(){
        const pricee = this.price ? this.price.split(' ')[0] : null;
        const numb = this.quant*Number(pricee)
        return numb
    }




}

export default MainPage;
