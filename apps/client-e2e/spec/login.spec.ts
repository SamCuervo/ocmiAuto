import { test } from '@playwright/test';
import { LoginPage } from '../src/page/loginPage';

test.describe('tests login correct', () => {
  test.only('user and password correct', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginCorrect();
  });
});

test.describe('tests login incorrect', () => {
    test('user correct and password incorrect', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.loginWithCorrectUserIncorrectPassword();
    });
    
    test('user incorrect and password correct', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.loginWithIncorrectUserCorrectPassword();
    });
    
    test('both user and password incorrect', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.loginWithBothIncorrect();
    });
});
