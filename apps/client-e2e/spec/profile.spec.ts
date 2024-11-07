import { test } from '@playwright/test';
import { ProfilePage } from '../src/page/profilePage';
import { LoginPage } from '../src/page/loginPage';
import { DatabaseService } from '../src/helpers/databaseService';

test.describe('tests profile', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.performLogin('testuser', 'testpassword');
  });
  test('profile data', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.verifyUserInfo(1);
  });
  test('Show Correct Author For SelectedBook', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.verifyFavoriteBookSelection();
  });
});
test.afterAll(async () => {
  await DatabaseService.closeDatabase();
});