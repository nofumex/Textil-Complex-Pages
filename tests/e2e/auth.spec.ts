import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should allow user registration and login', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    
    await page.getByLabel('Имя').fill('Тестовый')
    await page.getByLabel('Фамилия').fill('Пользователь')
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Пароль').fill('testpassword123')
    await page.getByLabel('Телефон').fill('+7 (495) 123-45-67')

    // Submit registration
    await page.getByRole('button', { name: /Зарегистрироваться/i }).click()

    // Should redirect to profile or show success
    await expect(page).toHaveURL(/.*profile|.*login/)

    // Now test login
    await page.goto('/login')
    
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Пароль').fill('testpassword123')
    
    await page.getByRole('button', { name: /Войти/i }).click()

    // Should be logged in
    await expect(page.getByText('Тестовый')).toBeVisible()
  })

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register')

    // Try to submit empty form
    await page.getByRole('button', { name: /Зарегистрироваться/i }).click()

    // Should show validation errors
    await expect(page.getByText(/Имя должно содержать/i)).toBeVisible()
    await expect(page.getByText(/Некорректный email/i)).toBeVisible()
  })

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('nonexistent@example.com')
    await page.getByLabel('Пароль').fill('wrongpassword')
    
    await page.getByRole('button', { name: /Войти/i }).click()

    // Should show error message
    await expect(page.getByText(/Неверный email или пароль/i)).toBeVisible()
  })

  test('should allow logout', async ({ page }) => {
    // First login with test customer
    await page.goto('/login')
    
    await page.getByLabel('Email').fill('customer@example.com')
    await page.getByLabel('Пароль').fill('customer123')
    await page.getByRole('button', { name: /Войти/i }).click()

    // Should be logged in
    await expect(page.getByText('Иван')).toBeVisible()

    // Logout
    await page.getByRole('button', { name: /Иван/i }).click()
    await page.getByRole('button', { name: /Выйти/i }).click()

    // Should be logged out
    await expect(page.getByRole('button', { name: /Войти/i })).toBeVisible()
  })

  test('should protect admin routes', async ({ page }) => {
    // Try to access admin without login
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)

    // Login as regular customer
    await page.getByLabel('Email').fill('customer@example.com')
    await page.getByLabel('Пароль').fill('customer123')
    await page.getByRole('button', { name: /Войти/i }).click()

    // Try admin again
    await page.goto('/admin')

    // Should show access denied or redirect
    await expect(page.getByText(/Доступ запрещён|Недостаточно прав/i)).toBeVisible()
  })

  test('should allow admin access for admin user', async ({ page }) => {
    await page.goto('/login')
    
    // Login as admin
    await page.getByLabel('Email').fill('admin@textil-kompleks.ru')
    await page.getByLabel('Пароль').fill('admin123')
    await page.getByRole('button', { name: /Войти/i }).click()

    // Access admin panel
    await page.goto('/admin')

    // Should show admin dashboard
    await expect(page.getByText(/Админ|Панель управления|Dashboard/i)).toBeVisible()
  })
})


