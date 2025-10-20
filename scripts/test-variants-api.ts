import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVariantsAPI() {
  console.log('🧪 Тестирование API вариаций товаров...\n');

  try {
    // Получаем товар с вариациями
    const product = await prisma.product.findFirst({
      where: {
        variants: {
          some: {}
        }
      },
      include: {
        variants: {
          where: { isActive: true },
          take: 5
        }
      }
    });

    if (!product) {
      console.log('❌ Товары с вариациями не найдены');
      return;
    }

    console.log(`📦 Тестируем товар: ${product.title}`);
    console.log(`🆔 ID товара: ${product.id}`);
    console.log(`🔗 Slug товара: ${product.slug}`);
    console.log(`🎨 Количество вариаций: ${product.variants.length}\n`);

    // Тестируем API endpoint для получения всех вариаций
    console.log('🔍 Тестирование GET /api/products/[slug]/variations');
    try {
      const response = await fetch(`http://localhost:3000/api/products/${product.slug}/variations`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Успешно получены все вариации:');
        console.log(`  - Цвета: ${data.colors.join(', ')}`);
        console.log(`  - Размеры: ${data.sizes.join(', ')}`);
        console.log(`  - Комбинаций: ${data.combinations.length}`);
        console.log(`  - Есть вариации: ${data.hasVariations}\n`);
      } else {
        console.log(`❌ Ошибка: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Ошибка при тестировании API: ${error}`);
    }

    // Тестируем API endpoint для получения конкретной вариации
    if (product.variants.length > 0) {
      const variant = product.variants[0];
      console.log(`🔍 Тестирование GET /api/products/[slug]/variation`);
      console.log(`  - Цвет: ${variant.color || 'не указан'}`);
      console.log(`  - Размер: ${variant.size || 'не указан'}`);
      
      try {
        const params = new URLSearchParams();
        if (variant.color) params.append('color', variant.color);
        if (variant.size) params.append('size', variant.size);
        
        const response = await fetch(`http://localhost:3000/api/products/${product.slug}/variation?${params}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Успешно получена вариация:');
          console.log(`  - Цена: ${data.price} руб.`);
          console.log(`  - SKU: ${data.sku}`);
          console.log(`  - Наличие: ${data.stock}`);
          console.log(`  - Изображение: ${data.image ? 'есть' : 'нет'}`);
          console.log(`  - Активна: ${data.isActive}\n`);
        } else {
          console.log(`❌ Ошибка: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка при тестировании API: ${error}`);
      }
    }

    // Показываем примеры вариаций
    console.log('📋 Примеры вариаций товара:');
    product.variants.forEach((variant, index) => {
      console.log(`  ${index + 1}. ${variant.color || 'Без цвета'} | ${variant.size || 'Без размера'} | ${variant.price} руб. | ${variant.sku}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantsAPI();