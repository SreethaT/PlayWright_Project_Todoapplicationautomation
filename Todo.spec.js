
import { test, expect } from '@playwright/test';
import TodoPage from '../Pages/todoPage.js';  

test.describe('TodoMVC Application Tests', () => {  // Main group for all TodoMVC tests
  let todoPage;

  // Global hook: Runs once before all tests in this group (e.g., for setup)
  test.beforeAll(async () => {
    console.log('Starting TodoMVC test suite...');  // Optional: Log for debugging
  });

  // Hook: Runs before each test (initialize page object and switch to All view for visibility)
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.gotoHome();  // Start on the base page (renamed method)
    await todoPage.goToAll();  // Switch to All view so all todos (active/completed) are visible for marking
  });

  // Hook: Runs after each test (e.g., take screenshot on failure, with error handling)
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      try {
        // Take a screenshot on failure (only if page is still open)
        await page.screenshot({ path: `screenshots/${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}-failure.png`, fullPage: true });
        console.log(`Screenshot saved for failed test: ${testInfo.title}`);
      } catch (error) {
        console.log(`Screenshot failed (page may be closed): ${error.message}`);
      }
    }
  });

  // Global hook: Runs once after all tests
  test.afterAll(async () => {
    console.log('TodoMVC test suite completed.');
  });

  // Sub-group for basic todo management tests
  test.describe('Basic Todo Management', () => {
    test('Add and manage todos @todo', async ({ page }) => {
      // Add multiple todos
      await todoPage.addTodo('walk');
      await todoPage.addTodo('Have Breakfast');
      await todoPage.addTodo('Goto Work');
      await todoPage.addTodo('Complete todays task');

      // Manual screenshot after adding todos
      await page.screenshot({ path: 'screenshots/after-adding-todos.png', fullPage: true });

      // Navigate to Active and verify
      await todoPage.goToActive();
      await todoPage.expectTodoVisible('walk');

      // Go back to All, mark some complete, and clear them
      await todoPage.goToAll();
      await todoPage.markTodoComplete('walk');
      await todoPage.markTodoComplete('Goto Work');
      await todoPage.clearCompleted();

      // Verify remaining todos
      await todoPage.expectTodoVisible('Have Breakfast');
      await todoPage.expectTodoVisible('Complete todays task');
    });

    // Expanded test: Edge case - Adding an empty todo
    test('Handle empty todo input', async ({ page }) => {
      const initialTodos = await page.locator('[data-testid="todo-item"]').count();
      await todoPage.addTodo('');  // Try to add empty
      const finalTodos = await page.locator('[data-testid="todo-item"]').count();
      expect(finalTodos).toBe(initialTodos);

      // Manual screenshot after attempting empty input
      await page.screenshot({ path: 'screenshots/after-empty-input.png' });
    });
  });

  // Sub-group for advanced todo operations
  test.describe('Advanced Todo Operations', () => {
    test('Mark all todos complete and clear', async ({ page }) => {
      await todoPage.addTodo('Task 1');
      await todoPage.addTodo('Task 2');
      await todoPage.addTodo('Task 3');

      // Mark all complete
      await todoPage.markTodoComplete('Task 1');
      await todoPage.markTodoComplete('Task 2');
      await todoPage.markTodoComplete('Task 3');

      // Clear completed
      await todoPage.clearCompleted();

      // Verify no todos left
      const remainingTodos = await page.locator('[data-testid="todo-item"]').count();
      expect(remainingTodos).toBe(0);

      // Manual screenshot after clearing all
      await page.screenshot({ path: 'screenshots/after-clearing-all.png', fullPage: true });
    });

    test('Filter todos by Active', async ({ page }) => {
      await todoPage.addTodo('Active Task');
      await todoPage.addTodo('Completed Task');
      await todoPage.markTodoComplete('Completed Task');  // Mark this one complete first

      await todoPage.goToActive();  // Then filter to Active
      await todoPage.expectTodoVisible('Active Task');  // Should only see active ones

      // Manual screenshot in Active view
      await page.screenshot({ path: 'screenshots/active-filter-view.png' });
    });
  });
}); 

