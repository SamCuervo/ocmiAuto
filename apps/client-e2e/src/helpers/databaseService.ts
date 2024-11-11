import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export class DatabaseService {
  private static dbInstance: sqlite3.Database | null = null;

  // Método para obtener la información del usuario desde la base de datos
  public static async getUserInfoFromDatabase(
    userId: number,
  ): Promise<{ [key: string]: string }> {
    if (!this.dbInstance) {
      this.dbInstance = await open({
        filename: '../../database.sqlite',
        driver: sqlite3.Database,
      });
    }

    const query = 'SELECT id, username, favoriteBook FROM users WHERE id = ?';
    const row = await this.dbInstance.get(query, userId);

    if (!row) {
      throw new Error(`No se encontró un usuario con ID ${userId}`);
    }

    return {
      'User ID': row['id'].toString(),
      'User name': row['username'].toString(),
      'User favoriteBook':
        row['favoriteBook'] !== null
          ? row['favoriteBook'].toString()
          : 'No favorite book selected',
    };
  }

  public static async getPostsTitlesByAuthor(
    authorId: number,
  ): Promise<string[]> {
    if (!this.dbInstance) {
      this.dbInstance = await open({
        filename: '../../database.sqlite',
        driver: sqlite3.Database,
      });
    }

    const query = 'SELECT title FROM posts WHERE authorId = ?';
    const rows = await this.dbInstance.all(query, authorId);
    return rows.length > 0 ? rows.map((row) => row.title) : [];
  }
  public static async getPostsContentByAuthor(
    authorId: number,
  ): Promise<string[]> {
    if (!this.dbInstance) {
      this.dbInstance = await open({
        filename: '../../database.sqlite',
        driver: sqlite3.Database,
      });
    }

    const query = 'SELECT content FROM posts WHERE authorId = ?';
    const rows = await this.dbInstance.all(query, authorId);
    return rows.length > 0 ? rows.map((row) => row.content) : [];
  }

  // Método para cerrar la conexión a la base de datos (si lo deseas)
  public static async closeDatabase() {
    if (this.dbInstance) {
      await this.dbInstance.close();
      this.dbInstance = null;
    }
  }

  // Método para obtener las tablas en la base de datos SQLite
  public static async getDatabaseTables(): Promise<string[]> {
    const db = await open({
      filename: '../../database.sqlite',
      driver: sqlite3.Database,
    });
    const tables = await db.all(
      `SELECT name FROM sqlite_master WHERE type='table'`,
    );
    await db.close();
    return tables.map((table) => table.name);
  }
  //metodo para traer las columnas de una tabla
  public static async getTableColumns(tabla: String): Promise<string[]> {
    const db = await open({
      filename: '../../database.sqlite',
      driver: sqlite3.Database,
    });
    const columns = await db.all(`PRAGMA table_info(${tabla})`);
    await db.close();
    return columns.map((column) => column.name);
  }
}
