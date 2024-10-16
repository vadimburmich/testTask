import { Page, APIResponse } from '@playwright/test';
import * as cheerio from 'cheerio';

class ApiHelper {
  private page: Page;
  private csrfToken: string;
  private csrfTokenInsideHtml: string;
  private cookieString: string;

  constructor(page: Page) {
    this.page = page;
    this.csrfToken = '';
    this.csrfTokenInsideHtml = '';
    this.cookieString = '';
  }

  async initialize(url: string): Promise<void> {
    await this.page.goto(url);
    await this.updateCookiesAndTokens();
  }

  private async updateCookiesAndTokens(): Promise<void> {
    const cookies = await this.page.context().cookies();
    this.cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    this.csrfToken = await this.page.locator('meta[name="csrf-token"]').getAttribute('content') || '';
    await this.updateCsrfToken();
  }

  async login(username: string, password: string): Promise<APIResponse> {
    const response = await this.page.request.post('https://enotes.pointschool.ru/login', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': this.cookieString,
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'X-Requested-With': 'XMLHttpRequest',
      },
      form: {
        '_csrf': this.csrfToken,
        'LoginForm[username]': username,
        'LoginForm[password]': password,
        'LoginForm[rememberMe]': '0',
        'login-button': ''
      }
    });

    if (response.status() === 302) {
      await this.updateCookiesAndTokens();
    }

    return response;
  }


  async getProducts(pageNumber: number = 1): Promise<APIResponse> {
    return this.page.request.get('https://enotes.pointschool.ru/product/get', {
      headers: {
        'Cookie': this.cookieString,
        'Accept': 'application/json',
        'X-CSRF-Token': this.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      },
      params: {
        // 'filters': 'search=&price-from=&price-to=',
        'action': '',
        'page': pageNumber.toString(), 
      }
    });
  }
  

  async getBasket(): Promise<APIResponse> {
    return this.page.request.get('https://enotes.pointschool.ru/basket/get', {
      headers: {
        'Cookie': this.cookieString,
        'Accept': 'application/json',
        'X-CSRF-Token': this.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
  }

  async addToBasket(productId: string, count: string): Promise<APIResponse> {
    await this.updateCsrfToken();
    return this.page.request.post('https://enotes.pointschool.ru/basket/create', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': this.csrfTokenInsideHtml,
        'Cookie': this.cookieString,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
      },
      form: {
        'product': productId,
        'count': count,
      }
    });
  }

  async clearBasket(): Promise<APIResponse> {
    await this.updateCsrfToken();
    return this.page.request.post('https://enotes.pointschool.ru/basket/clear', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfTokenInsideHtml,
        'Cookie': this.cookieString,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      },
    });
  }

  async updateCsrfToken(): Promise<void> {
    const response = await this.page.request.get('https://enotes.pointschool.ru/', {
      headers: {
        'Cookie': this.cookieString,
        'Accept': 'application/json',
        'X-CSRF-Token': this.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    const htmlContent = await response.text();
    const $ = cheerio.load(htmlContent);
    this.csrfTokenInsideHtml = $('meta[name="csrf-token"]').attr('content') || '';
  }
}

export default ApiHelper