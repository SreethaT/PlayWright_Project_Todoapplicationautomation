
import { expect } from '@playwright/test';  // Import for assertions

class TodoPage {
  constructor(page) {
    this.page = page;  // The Playwright page instance
  }

  // Locators (selectors for elements on the page) - Refined for TodoMVC React structure
  get textInput() { return this.page.getByTestId('text-input'); }
  get activeLink() { return this.page.getByRole('link', { name: 'Active' }); }
  get allLink() { return this.page.getByRole('link', { name: 'All' }); }
  get clearCompletedButton() { return this.page.getByRole('button', { name: 'Clear completed' }); }
  getTodoItem(text) { return this.page.locator('[data-testid="todo-item"]').filter({ hasText: text }); }  // Use data-testid for the li
  getTodoToggle(text) { return this.getTodoItem(text).locator('.toggle'); }  // Target the checkbox by class

  // Actions (methods to perform on the page)
  async gotoHome() {  // Renamed from gotoCompleted for clarity; starts on the base page
   await this.page.goto('http://todomvc.com/examples/react/dist/');
   await this.page.waitForLoadState('domcontentloaded');  
    await this.page.getByTestId('text-input').waitFor(); // todo input
  }

  async addTodo(todoText) {
    await this.textInput.click();
    await this.textInput.fill(todoText);
    await this.textInput.press('Enter');
  }

  async markTodoComplete(todoText) {
    const toggle = this.getTodoToggle(todoText);
    await toggle.check();  // Playwright waits automatically
  }

  async clearCompleted() {
    await this.clearCompletedButton.click();
  }

  async goToActive() {
    await this.activeLink.click();
  }
//Only click filters if they exist
 async goToAll() {
  const allFilter = this.page.getByRole('link', { name: 'All' });
  if (await allFilter.isVisible()) {
    await allFilter.click();
  }
}
  // Assertions (checks for visibility or state)
  async expectTodoVisible(todoText) {
    await expect(this.page.getByText(todoText)).toBeVisible();
  }
}

export default TodoPage;  // Export for ES6 import