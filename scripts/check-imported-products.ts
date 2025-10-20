import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportedProducts() {
  console.log('🔍 Проверяем импортированные товары...');

  try {
    // Получаем товары с вариациями
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {},
        },
      },
      include: {
        variants: {
          orderBy: [
            { color: 'asc' },
            { size: 'asc' },
          ],
        },
        categoryObj: true,
      },
      take: 5, // Показываем только первые 5
    });

    console.log(`\n📦 Найдено товаров с вариациями: ${productsWithVariants.length}`);

    for (const product of productsWithVariants) {
      console.log(`\n🏷️ Товар: ${product.title}`);
      console.log(`📂 Категория: ${product.categoryObj.name}`);
      console.log(`💰 Базовая цена: ${product.price} ₽`);
      console.log(`📦 Общий остаток: ${product.stock}`);
      console.log(`🎨 Вариаций: ${product.variants.length}`);

      // Группируем по цветам
      const colors = Array.from(new Set(product.variants.map(v => v.color).filter(Boolean)));
      const sizes = Array.from(new Set(product.variants.map(v => v.size).filter(Boolean)));

      console.log(`   Цвета: ${colors.join(', ')}`);
      console.log(`   Размеры: ${sizes.join(', ')}`);

      // Показываем первые несколько вариаций
      console.log(`   Примеры вариаций:`);
      product.variants.slice(0, 3).forEach((variant, index) => {
        console.log(`     ${index + 1}. ${variant.color || 'Без цвета'} / ${variant.size || 'Без размера'} - ${variant.price} ₽ (${variant.stock} шт.)`);
      });

      if (product.variants.length > 3) {
        console.log(`     ... и ещё ${product.variants.length - 3} вариаций`);
      }
    }

    // Статистика по вариациям
    const totalVariants = await prisma.productVariant.count();
    const activeVariants = await prisma.productVariant.count({
      where: { isActive: true },
    });

    console.log(`\n📊 Общая статистика:`);
    console.log(`   Всего вариаций: ${totalVariants}`);
    console.log(`   Активных вариаций: ${activeVariants}`);

    // Статистика по цветам и размерам
    const colorStats = await prisma.productVariant.groupBy({
      by: ['color'],
      _count: { color: true },
      where: { color: { not: null } },
      orderBy: { _count: { color: 'desc' } },
      take: 5,
    });

    const sizeStats = await prisma.productVariant.groupBy({
      by: ['size'],
      _count: { size: true },
      where: { size: { not: null } },
      orderBy: { _count: { size: 'desc' } },
      take: 5,
    });

    console.log(`\n🎨 Топ-5 цветов:`);
    colorStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.color}: ${stat._count.color} вариаций`);
    });

    console.log(`\n📏 Топ-5 размеров:`);
    sizeStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.size}: ${stat._count.size} вариаций`);
    });

  } catch (error) {
    console.error('❌ Ошибка при проверке:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем проверку
checkImportedProducts();
