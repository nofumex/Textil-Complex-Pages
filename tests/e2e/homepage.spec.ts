import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage correctly', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/Текстиль Комплекс/)

    // Check main heading with required text
    await expect(page.locator('h1')).toContainText('ООО Текстиль Комплекс — постельные принадлежности в наличии')
    await expect(page.locator('h1')).toContainText('Работаем с 2004 года')
    await expect(page.locator('h1')).toContainText('Быстрая доставка собственным автотранспортом')

    // Check navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Главная' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Каталог' })).toBeVisible()

    // Check hero section CTAs
    await expect(page.getByRole('button', { name: /Посмотреть каталог/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Заказать образец/i })).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Test catalog link
    await page.getByRole('link', { name: 'Каталог' }).click()
    await expect(page).toHaveURL(/.*catalog/)

    // Go back to homepage
    await page.goto('/')

    // Test contact info
    await expect(page.getByText('+7 (495) 123-45-67')).toBeVisible()
  })

  test('should show featured products', async ({ page }) => {
    await page.goto('/')

    // Check featured products section
    await expect(page.getByText('Популярные товары')).toBeVisible()
    
    // Should have product cards
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards.first()).toBeVisible()
  })

  test('should have trust indicators', async ({ page }) => {
    await page.goto('/')

    // Check trust section
    await expect(page.getByText('Почему выбирают нас')).toBeVisible()
    await expect(page.getByText('Опыт с 2004 года')).toBeVisible()
    await expect(page.getByText('Большой склад')).toBeVisible()
    await expect(page.getByText('Собственный автотранспорт')).toBeVisible()
  })

  test('should have contact form', async ({ page }) => {
    await page.goto('/')

    // Scroll to contact section
    await page.getByText('Свяжитесь с нами').scrollIntoViewIfNeeded()

    // Check contact form
    await expect(page.getByLabel('Имя')).toBeVisible()
    await expect(page.getByLabel('Телефон')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: /Отправить заявку/i })).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check mobile menu
    await page.getByRole('button', { name: /menu/i }).click()
    await expect(page.getByRole('link', { name: 'Каталог' })).toBeVisible()

    // Check hero section is readable
    await expect(page.locator('h1')).toBeVisible()
  })
})


