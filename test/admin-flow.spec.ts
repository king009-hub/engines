import { test, expect } from "../playwright-fixture";

test.describe("Admin Flow", () => {
  test("should login as admin and manage categories", async ({ page }) => {
    // Intercept the RPC call to mock admin role
    await page.route("**/rest/v1/rpc/has_role", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(true),
      });
    });

    // Go to login page
    await page.goto("http://localhost:8080/login");

    // Try to login (we'll assume the user exists or registration works)
    // If login fails, we'll try to register
    await page.fill('input[type="email"]', "admin@admin.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for either navigation or error toast
    // If we see an error toast about invalid credentials, we'll try to register
    const errorToast = page.locator('div:has-text("Invalid login credentials")');
    if (await errorToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Login failed, trying to register...");
      await page.goto("http://localhost:8080/register");
      await page.fill('input[id="full_name"]', "Admin User");
      await page.fill('input[id="email"]', "admin@admin.com");
      await page.fill('input[id="password"]', "password");
      await page.click('button[type="submit"]');
      
      // After registration, it should redirect to home or login
      await page.waitForURL(/.*\/$/);
      await page.goto("http://localhost:8080/login");
      await page.fill('input[type="email"]', "admin@admin.com");
      await page.fill('input[type="password"]', "password");
      await page.click('button[type="submit"]');
    }

    // Wait for navigation to /admin
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator("h1")).toContainText("Admin Dashboard");

    // Navigate to Manage Categories
    await page.click('a[href="/admin/categories"]');
    await expect(page).toHaveURL(/.*\/admin\/categories/);
    await expect(page.locator("h1")).toContainText("Manage Categories");

    // Add a new category
    await page.click('button:has-text("Add Category")');
    await page.fill('input[id="name"]', "Test Category");
    await page.fill('input[id="slug"]', "test-category");
    await page.click('button:has-text("Save")');

    // Verify category was added
    await expect(page.locator("table")).toContainText("Test Category");

    // Edit the category
    await page.click('tr:has-text("Test Category") button:has(svg.lucide-pencil)');
    await page.fill('input[id="name"]', "Test Category Updated");
    await page.click('button:has-text("Save Changes")');

    // Verify category was updated
    await expect(page.locator("table")).toContainText("Test Category Updated");

    // Delete the category
    await page.click('tr:has-text("Test Category Updated") button:has(svg.lucide-trash2)');
    // Assuming there's a confirmation dialog
    await page.click('button:has-text("Delete")');

    // Verify category was deleted
    await expect(page.locator("table")).not.toContainText("Test Category Updated");
  });

  test("should redirect non-admin from /admin", async ({ page }) => {
    // Intercept the RPC call to mock non-admin role
    await page.route("**/rest/v1/rpc/has_role", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(false),
      });
    });

    // Try to access /admin directly without login
    await page.goto("http://localhost:8080/admin");
    await expect(page).toHaveURL(/.*\/$/); // Should redirect to home or login
  });
});
