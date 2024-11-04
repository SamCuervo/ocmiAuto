import { expect, type Page } from '@playwright/test';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { homeLocators } from '../data/homeLocators';

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
}

