import { expect, type Page } from '@playwright/test';
import { homeLocators } from '../data/homeLocators';

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async validateHomePageElementsVisibility() {
    await expect(
      this.page.locator(homeLocators.createPostBtnLocator),
    ).toBeVisible();
    await expect(
      this.page.locator(homeLocators.logoutBtnLocator),
    ).toBeVisible();
    await expect(this.page.locator(homeLocators.postsBtnLocator)).toBeVisible();
    await expect(
      this.page.locator(homeLocators.profileBtnLocator),
    ).toBeVisible();
  }
}
