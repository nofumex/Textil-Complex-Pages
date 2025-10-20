import { test, expect } from '@playwright/test'

test.describe('Shopping Flow', () => {
  test('should allow browsing and adding products to cart', async ({ page }) => {
    await page.goto('/')

    // Go to catalog
    await page.getByRole('link', { name: 'Каталог' }).click()
    await expect(page).toHaveURL(/.*catalog/)

    // Should show products
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await expect(firstProduct).toBeVisible()

    // Click on first product
    await firstProduct.click()

    // Should show product page
    await expect(page.getByText(/В наличии на складе/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Добавить в корзину/i })).toBeVisible()

    // Add to cart
    await page.getByRole('button', { name: /Добавить в корзину/i }).click()

    // Should show cart notification or update cart counter
    await expect(page.locator('[data-testid="cart-counter"]')).toContainText('1')
  })

  test('should allow cart management', async ({ page }) => {
    await page.goto('/catalog')

    // Add first product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.locator('button:has-text("В корзину")').click()

    // Add second product to cart
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1)
    await secondProduct.locator('button:has-text("В корзину")').click()

    // Open cart
    await page.locator('[data-testid="cart-button"]').click()

    // Should show 2 items in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2)

    // Update quantity
    await page.locator('[data-testid="quantity-increase"]').first().click()
    
    // Remove item
    await page.locator('[data-testid="remove-item"]').first().click()

    // Should show 1 item now
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
  })

  test('should complete checkout flow', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.getByLabel('Email').fill('customer@example.com')
    await page.getByLabel('Пароль').fill('customer123')
    await page.getByRole('button', { name: /Войти/i }).click()

    // Add product to cart
    await page.goto('/catalog')
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.locator('button:has-text("В корзину")').click()

    // Go to checkout
    await page.locator('[data-testid="cart-button"]').click()
    await page.getByRole('button', { name: /Оформить заказ/i }).click()

    // Should be on checkout page
    await expect(page).toHaveURL(/.*checkout/)

    // Fill checkout form
    await page.getByLabel('Имя').fill('Иван')
    await page.getByLabel('Фамилия').fill('Петров')
    await page.getByLabel('Телефон').fill('+7 (495) 123-45-67')
    await page.getByLabel('Email').fill('customer@example.com')

    // Select delivery type
    await page.getByLabel('Курьер').check()

    // Submit order
    await page.getByRole('button', { name: /Оформить заказ/i }).click()

    // Should show success message
    await expect(page.getByText(/Заказ оформлен|Спасибо за заказ/i)).toBeVisible()
  })

  test('should show order in profile', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel('Email').fill('customer@example.com')
    await page.getByLabel('Пароль').fill('customer123')
    await page.getByRole('button', { name: /Войти/i }).click()

    // Go to profile
    await page.goto('/profile')

    // Check orders section
    await page.getByRole('tab', { name: /Заказы|История заказов/i }).click()

    // Should show at least one order
    await expect(page.locator('[data-testid="order-item"]').first()).toBeVisible()
  })

  test('should apply promo code', async ({ page }) => {
    // Login and add item to cart (similar to above)
    await page.goto('/login')
    await page.getByLabel('Email').fill('customer@example.com')
    await page.getByLabel('Пароль').fill('customer123')
    await page.getByRole('button', { name: /Войти/i }).click()

    await page.goto('/catalog')
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.locator('button:has-text("В корзину")').click()

    // Go to cart
    await page.locator('[data-testid="cart-button"]').click()

    // Try to apply promo code
    await page.getByLabel('Промокод').fill('TEST10')
    await page.getByRole('button', { name: /Применить/i }).click()

    // Should show discount or error message
    await expect(page.locator('[data-testid="promo-result"]')).toBeVisible()
  })

  test('should handle out of stock products', async ({ page }) => {
    await page.goto('/catalog')

    // Look for out of stock product (if any)
    const outOfStockProduct = page.locator('[data-testid="product-card"]:has-text("Нет в наличии")')
    
    if (await outOfStockProduct.count() > 0) {
      // Button should be disabled
      await expect(outOfStockProduct.locator('button')).toBeDisabled()
    }
  })
})


