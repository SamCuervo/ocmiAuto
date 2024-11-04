import { test } from '@playwright/test';
import { ProfilePage } from '../src/page/profilePage';
import { LoginPage } from '../src/page/loginPage';

test.describe('tests profile', ()=>{
  test.beforeEach(async ({page})=>{
      const loginPage = new LoginPage(page);
      await loginPage.loginCorrect();
  });
  test('profile data', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.verifyUserInfo(1);
  });
});
