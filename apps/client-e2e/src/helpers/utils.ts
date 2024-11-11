import { Page, Locator } from '@playwright/test';
export const generateRandomText = (length: number = 5): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export const clickRandomLocator = async (
  page: Page,
  locatorSelector: string,
): Promise<number> => {
  const editButtonsLocator = page.locator(locatorSelector);
  const buttonsCount = await editButtonsLocator.count();
  if (buttonsCount === 0) {
    throw new Error('No edit buttons found.');
  }
  const randomIndex = Math.floor(Math.random() * buttonsCount);
  const randomEditButton = editButtonsLocator.nth(randomIndex);
  await randomEditButton.click();
  return randomIndex;
};

export const clickRandomLocatorWithText = async (
  page: Page,
  buttonLocatorSelector: string,
  titleLocatorSelector: string,
): Promise<{ randomIndex: number; titleText: string | null }> => {
  const buttonsLocator = page.locator(buttonLocatorSelector);
  const buttonsCount = await buttonsLocator.count();
  
  if (buttonsCount === 0) throw new Error('No buttons found.');

  const randomIndex = Math.floor(Math.random() * buttonsCount);

   // Obtener el texto del título correspondiente al índice aleatorio
   const titleLocator = page.locator(titleLocatorSelector).nth(randomIndex);
   const titleText = await titleLocator.textContent();

  // Click en el botón seleccionado aleatoriamente
  await buttonsLocator.nth(randomIndex).click();
  return { randomIndex, titleText };
};

