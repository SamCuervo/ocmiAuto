import { expect, type Page } from '@playwright/test';
import { postsLocators } from '../data/postsLocators';
import { clickRandomLocatorWithText, generateRandomText } from '../helpers/utils';
import { DatabaseService } from '../helpers/databaseService';
import { clickRandomLocator } from '../helpers/utils';
import { homeLocators } from '../data/homeLocators';

export class PostsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Validar que los títulos de los posts de la base de datos estén en la página
  async validateListPostsBD(): Promise<void> {
    await this.page
      .locator(postsLocators.titlePostTxtLocator)
      .first()
      .waitFor({ state: 'attached' });
    const pagePostTitles = await this.page
      .locator(postsLocators.titlePostTxtLocator)
      .allInnerTexts();
    const dbPostTitles = await DatabaseService.getPostsTitlesByAuthor(1);
    dbPostTitles.forEach((title) => {
      expect(pagePostTitles).toContainEqual(title);
    });
  }
  async createPost() {
    const titleRandom = 'NEW ' + generateRandomText();
    const contentRandom = 'NEW ' + generateRandomText();
    await this.page.locator(homeLocators.createPostBtnLocator).click();
    await this.page.locator(postsLocators.titleInputLocator).fill(titleRandom);
    await this.page
      .locator(postsLocators.ContentInputLocator)
      .fill(contentRandom);
    await this.page.locator(postsLocators.CreatePostBtnLocator).click();
    await expect(
      this.page.locator(postsLocators.titlePostTxtLocator).first(),
    ).toHaveText(titleRandom);
    await expect(
      this.page.locator(postsLocators.contentPostTxtLocator).first(),
    ).toHaveText(contentRandom);
    const dbInfoUser = await DatabaseService.getUserInfoFromDatabase(1);
    await expect(
      this.page.locator(postsLocators.userNamePostTxtLocator).first(),
    ).toHaveText(dbInfoUser['User name']);
    let jsonBook;
    try {
      jsonBook =
        typeof dbInfoUser['User favoriteBook'] === 'string'
          ? JSON.parse(dbInfoUser['User favoriteBook'])
          : dbInfoUser['User favoriteBook'];
    } catch (error) {
      throw new Error('Error parsing the favorite book JSON.');
    }
    const authorName = Array.isArray(jsonBook.author_name)
      ? jsonBook.author_name[0]
      : jsonBook.author_name;
    await expect(
      this.page.locator(postsLocators.favoriteBookPostTxtLocator).first(),
    ).toHaveText(jsonBook.title + ' by ' + authorName);
    const currentDate = new Date();
    const formattedDate =
      currentDate.getMonth() +
      1 +
      '/' +
      currentDate.getDate().toString() +
      '/' +
      currentDate.getFullYear();
    await expect(
      this.page.locator(postsLocators.CreatedDatePostTxtLocator),
    ).toHaveText('Created on ' + formattedDate);
    const postTitlesBD = await DatabaseService.getPostsTitlesByAuthor(1);
    await expect(postTitlesBD).toContain(titleRandom);
    const postContentsBD = await DatabaseService.getPostsContentByAuthor(1);
    await expect(postContentsBD).toContain(contentRandom);
  }
  async updatePost() {
    await this.page.waitForSelector(postsLocators.editBtnLocator, {
      timeout: 5000,
    });
    const { randomIndex } = await clickRandomLocatorWithText(
      this.page,
      postsLocators.editBtnLocator,
      postsLocators.titlePostTxtLocator,
    );
    const editTitleRandom = 'EDIT ' + generateRandomText();
    const editContentRandom = 'EDIT ' + generateRandomText();
    await this.page
      .locator(postsLocators.titleInputLocator)
      .fill(editTitleRandom);
    await this.page
      .locator(postsLocators.ContentInputLocator)
      .fill(editContentRandom);
    await this.page.locator(postsLocators.CreatePostBtnLocator).click();
    await expect(
      this.page
        .locator(postsLocators.titlePostTxtLocator)
        .nth(randomIndex),
    ).toHaveText(editTitleRandom);
    await expect(
      this.page
        .locator(postsLocators.contentPostTxtLocator)
        .nth(randomIndex),
    ).toHaveText(editContentRandom);

    const postTitlesBD = await DatabaseService.getPostsTitlesByAuthor(1);
    await expect(postTitlesBD.map((title) => title.trim())).toContain(
      editTitleRandom.trim(),
    );
    const postContentsBD = await DatabaseService.getPostsContentByAuthor(1);
    await expect(postContentsBD.map((title) => title.trim())).toContain(
      editContentRandom.trim(),
    );
  }
  async deletePostCancel() {
    const { randomIndex, titleText } = await clickRandomLocatorWithText(
      this.page,
      postsLocators.deleteBtnLocator,
      postsLocators.titlePostTxtLocator,
    );

    this.page.on('dialog', async (dialog) => {
      if (dialog.type() === 'confirm') {
        console.log('Confirm dialog detected');
        await dialog.dismiss();
      }
    });

    await this.page
      .locator(postsLocators.deleteBtnLocator)
      .nth(randomIndex)
      .click();
    await expect(this.page.getByText(titleText)).toBeVisible();
  }
  async deletePost() {
    const { randomIndex, titleText } = await clickRandomLocatorWithText(
      this.page,
      postsLocators.deleteBtnLocator,
      postsLocators.titlePostTxtLocator,
    );
    this.page.on('dialog', async (dialog) => {
      if (dialog.type() === 'confirm') {
        console.log('Confirm dialog detected');
        await dialog.accept();
      }
    });
    await this.page
      .locator(postsLocators.deleteBtnLocator)
      .nth(randomIndex)
      .click();
    await expect(this.page.getByText(titleText)).not.toBeVisible();
    const postTitlesBD = await DatabaseService.getPostsTitlesByAuthor(1);
    await expect(postTitlesBD).not.toContain(titleText);
  }
}
