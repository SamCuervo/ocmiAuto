import { expect, type Page } from '@playwright/test';
import { postsLocators } from '../data/postsLocators';
import { generateRandomText } from '../helpers/utils';
import { DatabaseService } from '../helpers/databaseService';

export class PostsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  // Obtener todos los títulos de los posts desde la página (usando Playwright)
  private async getPostTitlesFromPage(): Promise<string[]> {
    const titles = await this.page.locator('h3.text-2xl.font-semibold').allInnerTexts();
    return titles.map(title => title.trim());
}

// Validar que los títulos de los posts de la base de datos estén en la página
async validatePostsBD(): Promise<void> {
    const dbPostTitles = await DatabaseService.getPostsTitlesByAuthor(1);
    //console.log('Titles from the database:', dbPostTitles);
    const pagePostTitles = await this.getPostTitlesFromPage();
    //console.log('Titles from the page:', pagePostTitles);
    dbPostTitles.forEach(title => {
      expect(pagePostTitles).toContain(title.trim());
  });
}
  async createPost() {
    const titleRandom = generateRandomText();
    const contentRandom = generateRandomText();
    await this.page.locator(postsLocators.titleInputLocator).fill(titleRandom);
    await this.page.locator(postsLocators.ContentInputLocator).fill(contentRandom);
    await this.page.locator(postsLocators.CreatePostBtnLocator).click();
    await expect(this.page.locator(postsLocators.titlePostTxtLocator).first()).toHaveText(titleRandom);
    await expect(this.page.locator(postsLocators.contentPostTxtLocator).first()).toHaveText(contentRandom);
    const dbInfoUser = await DatabaseService.getUserInfoFromDatabase(1);
    await expect(this.page.locator(postsLocators.userNamePostTxtLocator).first()).toHaveText(dbInfoUser['User name']);
    let jsonBook;
    try {
      jsonBook = typeof dbInfoUser['User favoriteBook'] === 'string' ? JSON.parse(dbInfoUser['User favoriteBook']) : dbInfoUser['User favoriteBook'];
    } catch (error) {
      throw new Error('Error parsing the favorite book JSON.');
    }
    const authorName = Array.isArray(jsonBook.author_name) ? jsonBook.author_name[0] : jsonBook.author_name;
    await expect(this.page.locator(postsLocators.favoriteBookPostTxtLocator).first()).toHaveText(jsonBook.title + " by " + authorName);
    const currentDate = new Date();
    const formattedDate = (currentDate.getMonth() + 1) + '/' +
      currentDate.getDate().toString() + '/' +
      currentDate.getFullYear();
    await expect(this.page.locator(postsLocators.CreatedDatePostTxtLocator)).toHaveText("Created on " + formattedDate);
  }
}
