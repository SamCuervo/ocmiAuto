import { expect, type Page } from '@playwright/test';
import { loginLocators } from '../data/loginLocators';
import { generateRandomText } from '../helpers/utils';
import { homeLocators } from '../data/homeLocators';
import { HomePage } from './homePage';

export class LoginPage {
  private page: Page;
  private correctUsername: string = 'testuser';
  private correctPassword: string = 'testpassword';

  constructor(page: Page) {
    this.page = page;
  }

  async performLogin(username: string, password: string) {
    const apiUrl = (url: string) => `http://localhost:4200${url}`;
    await this.page.goto(apiUrl('/login'));
    await expect(this.page.locator(loginLocators.userNameInputLocator).getAttribute('placeholder')).resolves.toBe('Username');
    await expect(this.page.locator(loginLocators.passwordInputLocator).getAttribute('placeholder')).resolves.toBe('Password');
    await this.page.locator(loginLocators.userNameInputLocator).fill(username);
    await this.page.locator(loginLocators.passwordInputLocator).fill(password);await this.page.locator(loginLocators.signInBtnLocator).click();
  }

  private async validateLoginElementsVisible() {
    //await expect(this.page.locator(loginLocators.createOneBtnLocator)).toBeVisible();
    await expect(this.page.locator(loginLocators.welcomeTxtLocator)).toBeVisible();
    await expect(this.page.locator(loginLocators.passwordInputLocator)).toBeVisible();
    await expect(this.page.locator(loginLocators.userNameInputLocator)).toBeVisible();
    await expect(this.page.locator(loginLocators.signInBtnLocator)).toBeVisible();
  }
  async loginCorrect() {
    this.validateLoginElementsVisible();
    await this.performLogin(this.correctUsername, this.correctPassword);
    const homePage = new HomePage(this.page);
    await homePage.validateHomePageElementsVisibility();
  }

  async loginWithCorrectUserIncorrectPassword() {
    const randomPass = this.correctPassword + generateRandomText();
    await this.performLogin(this.correctUsername, randomPass);
    await expect(this.page.locator(loginLocators.invalidCredentialsAlertLocator)).toBeVisible();
  }

  async loginWithIncorrectUserCorrectPassword() {
    const randomUsername = this.correctUsername + generateRandomText();
    await this.performLogin(randomUsername, this.correctPassword);
    await expect(this.page.locator(loginLocators.invalidCredentialsAlertLocator)).toBeVisible();
  }

  async loginWithBothIncorrect() {
    const randomUsername = this.correctUsername + generateRandomText();
    const randomPass = this.correctPassword + generateRandomText();
    await this.performLogin(randomUsername, randomPass);
    await expect(this.page.locator(loginLocators.invalidCredentialsAlertLocator)).toBeVisible();
  }

  async logout(){
    await this.performLogin(this.correctUsername, this.correctPassword);
    await this.page.locator(homeLocators.logoutBtnLocator).click();
    await this.validateLoginElementsVisible();
  }
}
