import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVariants() {
  console.log('🧪 Тестируем функциональность вариантов...');

  try {
    // Получаем товар с вариантами
    const product = await prisma.product.findFirst({
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
        categoryObj: true,
      },
    });

    if (!product) {
      console.log('❌ Товары не найдены. Запустите seed скрипт сначала.');
      return;
    }

    console.log(`\n📦 Товар: ${product.title}`);
    console.log(`📂 Категория: ${product.categoryObj.name}`);
    console.log(`💰 Базовая цена: ${product.price} ₽`);
    console.log(`📦 Количество на складе: ${product.stock}`);

    if (product.variants.length === 0) {
      console.log('⚠️ У товара нет вариантов');
      return;
    }

    console.log(`\n🎨 Варианты (${product.variants.length}):`);
    
    // Группируем варианты по цветам
    const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
    const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];

    console.log(`\n🎨 Доступные цвета: ${colors.join(', ')}`);
    console.log(`📏 Доступные размеры: ${sizes.join(', ')}`);

    console.log('\n📋 Детали вариантов:');
    product.variants.forEach((variant, index) => {
      console.log(`${index + 1}. ${variant.color || 'Без цвета'} / ${variant.size || 'Без размера'} - ${variant.price} ₽ (${variant.stock} шт.)`);
    });

    // Тестируем поиск варианта
    const testVariant = product.variants[0];
    if (testVariant) {
      console.log(`\n🔍 Тестируем поиск варианта:`);
      console.log(`Ищем: цвет="${testVariant.color}", размер="${testVariant.size}"`);
      
      const foundVariant = product.variants.find(v => 
        v.color === testVariant.color && v.size === testVariant.size
      );
      
      if (foundVariant) {
        console.log(`✅ Найден: ${foundVariant.sku} - ${foundVariant.price} ₽`);
      } else {
        console.log(`❌ Вариант не найден`);
      }
    }

    // Проверяем цены
    const minPrice = Math.min(...product.variants.map(v => Number(v.price)));
    const maxPrice = Math.max(...product.variants.map(v => Number(v.price)));
    const basePrice = Number(product.price);

    console.log(`\n💰 Анализ цен:`);
    console.log(`Базовая цена: ${basePrice} ₽`);
    console.log(`Минимальная цена варианта: ${minPrice} ₽`);
    console.log(`Максимальная цена варианта: ${maxPrice} ₽`);
    
    if (minPrice !== basePrice || maxPrice !== basePrice) {
      console.log(`✅ Цены вариантов отличаются от базовой цены`);
    } else {
      console.log(`⚠️ Все варианты имеют базовую цену`);
    }

    // Проверяем наличие
    const inStockVariants = product.variants.filter(v => v.stock > 0);
    const outOfStockVariants = product.variants.filter(v => v.stock === 0);

    console.log(`\n📦 Наличие:`);
    console.log(`В наличии: ${inStockVariants.length} вариантов`);
    console.log(`Нет в наличии: ${outOfStockVariants.length} вариантов`);

    if (outOfStockVariants.length > 0) {
      console.log(`\n❌ Варианты без наличия:`);
      outOfStockVariants.forEach(v => {
        console.log(`- ${v.color || 'Без цвета'} / ${v.size || 'Без размера'} (${v.sku})`);
      });
    }

    console.log('\n✅ Тест завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testVariants();

