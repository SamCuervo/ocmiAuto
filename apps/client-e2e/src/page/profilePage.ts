import { expect, type Page } from '@playwright/test';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { homeLocators } from '../data/homeLocators';
import { profileLocators } from '../data/profileLocators';

export class ProfilePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Método para obtener la información desde la página web
  private async getUserInfoFromPage(): Promise<{ [key: string]: string }> {
    await this.page.locator(homeLocators.profileBtnLocator).click();
    const userInfo: { [key: string]: string } = {};
    await this.page.waitForSelector('.space-y-4 > .border-t');
    const userNameElement = await this.page.locator('h3.tracking-tight.text-2xl.font-bold').first();
    if (userNameElement) {
      userInfo["User name"] = await userNameElement.innerText();
    }
    const infoSections = await this.page.$$('.space-y-4 > .border-t');

    for (const section of infoSections) {
      const keyElement = await section.$('h3');
      const valueElement = await section.$('p');

      if (keyElement && valueElement) {
        const key = await keyElement.innerText();
        const value = await valueElement.innerText();
        userInfo[key] = value;
      }
    }

    return userInfo;
  }

  // Método para obtener la información del usuario desde la base de datos SQLite
  //NOTA no supe de donde sale el Account status para poder realizar tambien una assercion de este apartado
  private async getUserInfoFromDatabase(userId: number): Promise<{ [key: string]: string }> {
    const db = await open({
      filename: '../../database.sqlite',
      driver: sqlite3.Database,
    });

    const query = 'SELECT id, username, favoriteBook FROM users WHERE id = ?';
    const row = await db.get(query, userId);
    await db.close();

    if (!row) {
      throw new Error(`No se encontró un usuario con ID ${userId}`);
    }

    return {
      "User ID": row["id"].toString(),
      "User name": row["username"].toString(),
      "User favoriteBook": row["favoriteBook"] !== null ? row["favoriteBook"].toString() : "No favorite book selected",
    };
  }

  // Método para comparar la información de la página con la de la base de datos
  async verifyUserInfo(userId: number) {
    const pageInfo = await this.getUserInfoFromPage();
    const dbInfo = await this.getUserInfoFromDatabase(userId);

    expect(pageInfo['User name']).toEqual(dbInfo['User name']);
    expect(pageInfo['User ID']).toEqual(dbInfo['User ID']);
    expect(pageInfo['User favoriteBook']).toEqual(dbInfo['Favorite Book']);

  }

  // Método para obtener las tablas en la base de datos SQLite
  async getDatabaseTables(): Promise<string[]> {
    const db = await open({
      filename: '../../database.sqlite',
      driver: sqlite3.Database,
    });
    const tables = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
    await db.close();
    return tables.map(table => table.name);
  }
  //metodo para traer las columnas de una tabla
  async getUserTableColumns(): Promise<string[]> {
    const db = await open({
      filename: '../../database.sqlite',
      driver: sqlite3.Database,
    });
    const columns = await db.all(`PRAGMA table_info(users)`);
    await db.close();
    return columns.map(column => column.name);
  }
  private async getBookInfoFromAPI(book: string): Promise<{ author_name: string, title: string, first_publish_year: number | null }> {
    const response = await this.page.context().request.get(`https://openlibrary.org/search.json?q=${book}&limit=5`);
  
    if (response.ok()) {
      const data = await response.json();
  
      if (data.docs && data.docs.length > 0) {
        const firstBook = data.docs[0];
  
        // Obtener el nombre del autor, verificando si es un array y tomando el primer valor
        const authorName = Array.isArray(firstBook.author_name) ? firstBook.author_name[0] : firstBook.author_name;
  
        // Devolver un diccionario con los datos relevantes del primer libro
        return {
          author_name: authorName || 'No author found', // Devolver el nombre del autor o un valor por defecto
          title: firstBook.title || 'No title found', // Devolver el título del libro o un valor por defecto
          first_publish_year: firstBook.first_publish_year || null // Devolver el año de la primera publicación o null si no está disponible
        };
      } else {
        throw new Error('No books found for the search query');
      }
    } else {
      throw new Error('Error fetching data from OpenLibrary');
    }
  }
  

  async verifyFavoriteBookSelection() {

    const book = `Harry Potter and the Philosopher's Stone`;
    const expectedAuthor = 'J. K. Rowling';
    const infoApi = await this.getBookInfoFromAPI(book);
    const dbInfo = await this.getUserInfoFromDatabase(1);
    const expectedAuthorDate="by " + infoApi['author_name'] + " ("+infoApi['first_publish_year']+")";

    await this.page.locator(homeLocators.profileBtnLocator).click();
    await this.page.locator(profileLocators.editIcoLocator).click();
    await this.page.locator(profileLocators.searchBookInputLocator).fill(book);
    await expect(this.page.locator(profileLocators.searchAuthorBookTxt)).toHaveText(expectedAuthorDate);
    await expect(this.page.locator(profileLocators.titleBookTxt).first()).toHaveText(infoApi['title']);

    await this.page.locator(profileLocators.optionsBookLocator).first().click();
    await expect(this.page.locator(profileLocators.authorBookTxt)).toHaveText("by " + infoApi['author_name'] );
    
    expect(dbInfo['User favoriteBook']).not.toBeNull();
    expect(dbInfo['User favoriteBook']).not.toBe('No favorite book selected');

    let jsonBook;
    try {
      jsonBook = typeof dbInfo['User favoriteBook'] === 'string' ? JSON.parse(dbInfo['User favoriteBook']) : dbInfo['User favoriteBook'];
    } catch (error) {
      throw new Error('Error parsing the favorite book JSON.');
    }

    expect(jsonBook).toHaveProperty('title');
    expect(jsonBook).toHaveProperty('author_name');
    expect(jsonBook.title).toBe(book);
    //condición ? valor_si_verdadero : valor_si_falso;
    const authorName = Array.isArray(jsonBook.author_name) ? jsonBook.author_name[0] : jsonBook.author_name;
    expect(authorName).toBe(expectedAuthor);
  }
}

