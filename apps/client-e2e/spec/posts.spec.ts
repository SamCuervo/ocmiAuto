import { expect, test } from '@playwright/test';
import { LoginPage } from '../src/page/loginPage';
import { homeLocators } from '../src/data/homeLocators';
import { HomePage } from '../src/page/homePage';
import { postsLocators } from '../src/data/postsLocators';
import { PostsPage } from '../src/page/postsPage';
import { clickRandomLocator } from '../src/helpers/utils';
import { DatabaseService } from '../src/helpers/databaseService';

test.use({
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
});

const apiUrl = (url: string) => `http://localhost:3000${url}`;

const testUser = {
  username: 'testuser',
  password: 'testpassword',
};

//test de ejemplo
test.describe.skip('Posts Home Screen', () => {
  // Initialize session token for API calls
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login via API to get auth token for cleanup operations
    const loginResponse = await request.post(apiUrl('/auth/login'), {
      data: {
        username: 'testuser',
        password: 'testpassword',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const session = await loginResponse.json();
    authToken = session.token;
  });

  test.beforeEach(async ({ page, request }) => {
    // Clean up existing posts via API
    try {
      const postsResponse = await request.get(apiUrl('/posts'), {
        headers: {
          Authorization: authToken,
        },
      });
      const posts = await postsResponse.json();

      // Delete each post
      for (const post of posts) {
        await request.delete(apiUrl(`/posts/${post.id}`), {
          headers: {
            Authorization: authToken,
          },
        });
      }
    } catch (error) {
      console.error('Failed to cleanup posts:', error);
    }

    // Login via UI
    try {
      await page.goto('/login');
      await page.getByPlaceholder('Username').fill(testUser.username);
      await page.getByPlaceholder('Password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL('/login');
    } catch (error) {
      await page.screenshot({
        path: `./test-results/login-failure-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('displays correct layout and elements', async ({ page }) => {
    try {
      await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create Post' }),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: 'Posts' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    } catch (error) {
      await page.screenshot({
        path: `./test-results/layout-elements-failure-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('shows empty state when no posts exist', async ({ page }) => {
    try {
      const emptyStateText = page.getByText(
        'No posts found. Create your first post!',
      );
      await expect(emptyStateText).toBeVisible();
    } catch (error) {
      await page.screenshot({
        path: `./test-results/empty-state-failure-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('displays posts in correct format', async ({ page }) => {
    try {
      // Create a test post
      await page.getByRole('button', { name: 'Create Post' }).click();
      await page
        .getByPlaceholder('Enter your post title')
        .fill('Test Post Title');
      await page
        .getByPlaceholder('Write your post content here...')
        .fill('Test post content');
      await page.getByRole('button', { name: 'Create Post' }).click();

      // Verify post appears in list
      await expect(
        page.getByRole('heading', { name: 'Test Post Title' }),
      ).toBeVisible();
      await expect(page.getByText('Test post content')).toBeVisible();

      // Check post card elements
      const postCard = page.getByRole('article').first();
      await expect(postCard.locator('.edit-button')).toBeVisible();
      await expect(postCard.locator('.delete-button')).toBeVisible();
      await expect(postCard.getByText(/Created on/)).toBeVisible();
    } catch (error) {
      await page.screenshot({
        path: `./test-results/post-display-failure-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('supports post management actions', async ({ page }) => {
    try {
      await page.getByRole('button', { name: 'Create Post' }).click();
      await expect(page).toHaveURL('/posts/new');

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page).toHaveURL('/posts');
    } catch (error) {
      await page.screenshot({
        path: `./test-results/post-management-failure-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('navigation works correctly', async ({ page }) => {
    try {
      // Test profile navigation
      await page.getByRole('link', { name: 'Profile' }).click();
      await expect(page).toHaveURL('/profile');

      // Return to posts
      await page.getByRole('link', { name: 'Posts' }).click();
      await expect(page).toHaveURL('/posts');

      // Test logout
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page).toHaveURL('/login');
    } catch (error) {
      await page.screenshot({
        path: `./test-results/navigation-failure-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  // Cleanup after each test (belt and suspenders approach)
  test.afterEach(async ({ request }, testInfo) => {
    // Additional cleanup after each test if needed
    try {
      const postsResponse = await request.get(apiUrl('/posts'), {
        headers: {
          Authorization: authToken,
        },
      });
      const posts = await postsResponse.json();

      for (const post of posts) {
        await request.delete(apiUrl(`/posts/${post.id}`), {
          headers: {
            Authorization: authToken,
          },
        });
      }
    } catch (error) {
      console.error('Failed to cleanup posts after test:', error);
    }

    // Debug information for failed tests
    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`Test "${testInfo.title}" failed`);
    }
  });

  // Final cleanup and logout
  test.afterAll(async ({ request }) => {
    try {
      // Logout to cleanup session
      await request.post(apiUrl('/auth/logout'), {
        headers: {
          Authorization: authToken,
        },
      });
    } catch (error) {
      console.error('Failed to logout after tests:', error);
    }
  });
});

test.describe('tests profile new post CANCEL', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.performLogin('testuser', 'testpassword');
    await page.locator(homeLocators.createPostBtnLocator).click();
  });
  test('verify Cancel Button Functionality On New Post Creation', async ({
    page,
  }) => {
    await page.locator(postsLocators.cancelBtnLocator).click();
    const homePage = new HomePage(page);
    await homePage.validateHomePageElementsVisibility();
  });
  test('verify Close Button Functionality On New Post Creation', async ({
    page,
  }) => {
    await page.locator(postsLocators.closeBtnLocator).click();
    const homePage = new HomePage(page);
    await homePage.validateHomePageElementsVisibility();
  });
});

test.describe('tests profile post', () => {
  -test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.performLogin('testuser', 'testpassword');
  });
  test('Create Post', async ({ page }) => {
    const postsPage = new PostsPage(page);
    await postsPage.createPost();
  });
  test('list Posts', async ({ page }) => {
    const postsPage = new PostsPage(page);
    await postsPage.validateListPostsBD();
  });
});

test.describe('tests profile update post CANCEL', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.performLogin('testuser', 'testpassword');
    await page.waitForSelector(postsLocators.editBtnLocator, { timeout: 5000 });
    await clickRandomLocator(page, postsLocators.editBtnLocator);
  });
  test('verify Cancel Button Functionality On Update Post Creation', async ({
    page,
  }) => {
    await page.locator(postsLocators.cancelBtnLocator).click();
    const homePage = new HomePage(page);
    await homePage.validateHomePageElementsVisibility();
  });
  test('verify Close Button Functionality On Update Post Creation', async ({
    page,
  }) => {
    await page.locator(postsLocators.closeBtnLocator).click();
    const homePage = new HomePage(page);
    await homePage.validateHomePageElementsVisibility();
  });
});

test.describe('tests profile update post', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.performLogin('testuser', 'testpassword');
  });
  test('Update Post', async ({ page }) => {
    const postsPage = new PostsPage(page);
    await postsPage.updatePost();
  });
});

test.describe('tests profile delete post CANCEL', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.performLogin('testuser', 'testpassword');
    await page.waitForSelector(postsLocators.deleteBtnLocator, { timeout: 5000 });
  });
  test( 'DELETE CANCEL', async ({ page }) => {
    const postsPage = new PostsPage(page);
    await postsPage.deletePostCancel();
  });
  test( 'DELETE ', async ({ page }) => {
    const postsPage = new PostsPage(page);
    await postsPage.deletePost();
  });
});