import { expect, type Page } from '@playwright/test';
import { loginLocators } from '../data/loginLocators';

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async performLogin(username: string, password: string) {
    const apiUrl = (url: string) => `http://localhost:4200${url}`;
    await this.page.goto(apiUrl('/login'));
    await expect(
      this.page
        .locator(loginLocators.userNameInputLocator)
        .getAttribute('placeholder'),
    ).resolves.toBe('Username');
    await expect(
      this.page
        .locator(loginLocators.passwordInputLocator)
        .getAttribute('placeholder'),
    ).resolves.toBe('Password');
    await this.page.locator(loginLocators.userNameInputLocator).fill(username);
    await this.page.locator(loginLocators.passwordInputLocator).fill(password);
    await this.page.locator(loginLocators.signInBtnLocator).click();
  }
}
