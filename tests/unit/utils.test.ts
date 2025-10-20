import {
  formatPrice,
  formatDate,
  generateSlug,
  generateOrderNumber,
  generateSKU,
  truncateText,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  calculateDiscount,
  getStockStatus,
  getOrderStatusText,
  getOrderStatusColor,
} from '@/lib/utils'

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format price in RUB by default', () => {
      expect(formatPrice(1000)).toBe('1 000 ₽')
      expect(formatPrice(1234.56)).toBe('1 235 ₽')
    })

    it('should format price with specified currency', () => {
      expect(formatPrice(1000, 'USD')).toContain('1,000')
    })

    it('should handle string input', () => {
      expect(formatPrice('1000')).toBe('1 000 ₽')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25')
      const formatted = formatDate(date)
      expect(formatted).toContain('декабря')
      expect(formatted).toContain('2023')
    })

    it('should handle string input', () => {
      const formatted = formatDate('2023-12-25')
      expect(formatted).toContain('декабря')
    })
  })

  describe('generateSlug', () => {
    it('should generate slug from Russian text', () => {
      expect(generateSlug('Постельное белье')).toBe('postelnoe-bele')
      expect(generateSlug('Комплект "Люкс"')).toBe('komplekt-lyuks')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Test & Special @ Characters!')).toBe('test-special-characters')
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^TK-\d{6}-[A-Z]{3}$/)
    })

    it('should generate unique numbers', () => {
      const num1 = generateOrderNumber()
      const num2 = generateOrderNumber()
      expect(num1).not.toBe(num2)
    })
  })

  describe('generateSKU', () => {
    it('should generate SKU with correct format', () => {
      const sku = generateSKU('Подушки', 'Ортопедическая подушка')
      expect(sku).toMatch(/^ПОД.*\d{4}$/)
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
    })

    it('should not truncate short text', () => {
      const shortText = 'Short'
      expect(truncateText(shortText, 20)).toBe('Short')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate Russian phone numbers', () => {
      expect(isValidPhone('+7 (495) 123-45-67')).toBe(true)
      expect(isValidPhone('8 495 123 45 67')).toBe(true)
      expect(isValidPhone('84951234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('invalid')).toBe(false)
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('84951234567')).toBe('+74951234567')
      expect(formatPhoneNumber('74951234567')).toBe('+74951234567')
    })
  })

  describe('calculateDiscount', () => {
    it('should calculate discount percentage', () => {
      expect(calculateDiscount(1000, 800)).toBe(20)
      expect(calculateDiscount(2000, 1500)).toBe(25)
    })
  })

  describe('getStockStatus', () => {
    it('should return correct status for different stock levels', () => {
      expect(getStockStatus(0)).toEqual({
        status: 'out_of_stock',
        message: 'Нет в наличии',
        color: 'text-red-600'
      })

      expect(getStockStatus(3)).toEqual({
        status: 'low_stock',
        message: 'Осталось 3 шт.',
        color: 'text-orange-600'
      })

      expect(getStockStatus(10)).toEqual({
        status: 'in_stock',
        message: 'В наличии',
        color: 'text-green-600'
      })
    })
  })

  describe('getOrderStatusText', () => {
    it('should return correct Russian text for order statuses', () => {
      expect(getOrderStatusText('NEW')).toBe('Новый')
      expect(getOrderStatusText('PROCESSING')).toBe('В обработке')
      expect(getOrderStatusText('SHIPPED')).toBe('Отгружен')
      expect(getOrderStatusText('DELIVERED')).toBe('Доставлен')
      expect(getOrderStatusText('CANCELLED')).toBe('Отменён')
    })
  })

  describe('getOrderStatusColor', () => {
    it('should return correct CSS classes for order statuses', () => {
      expect(getOrderStatusColor('NEW')).toBe('bg-blue-100 text-blue-800')
      expect(getOrderStatusColor('DELIVERED')).toBe('bg-green-100 text-green-800')
      expect(getOrderStatusColor('CANCELLED')).toBe('bg-red-100 text-red-800')
    })
  })
})


