import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanVariantColors() {
  console.log('🧹 Очищаем неправильные цвета в вариациях товаров...');

  try {
    // Получаем все вариации с неправильными цветами
    const variantsWithBadColors = await prisma.productVariant.findMany({
      where: {
        OR: [
          { color: { contains: 'пестротканное', mode: 'insensitive' } },
          { color: { contains: 'пестротканые', mode: 'insensitive' } },
          { color: { contains: 'гладкокрашеное', mode: 'insensitive' } },
          { color: { contains: 'гладкокрашеные', mode: 'insensitive' } },
        ],
      },
    });

    console.log(`📦 Найдено вариаций с неправильными цветами: ${variantsWithBadColors.length}`);

    // Обновляем все вариации, устанавливая цвет в null
    const result = await prisma.productVariant.updateMany({
      where: {
        OR: [
          { color: { contains: 'пестротканное', mode: 'insensitive' } },
          { color: { contains: 'пестротканые', mode: 'insensitive' } },
          { color: { contains: 'гладкокрашеное', mode: 'insensitive' } },
          { color: { contains: 'гладкокрашеные', mode: 'insensitive' } },
        ],
      },
      data: {
        color: null,
      },
    });

    console.log(`✅ Очищено цветов: ${result.count}`);

    // Показываем статистику по цветам после очистки
    const colorStats = await prisma.productVariant.groupBy({
      by: ['color'],
      _count: { color: true },
      where: { color: { not: null } },
      orderBy: { _count: { color: 'desc' } },
      take: 10,
    });

    console.log(`\n🎨 Топ-10 цветов после очистки:`);
    colorStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.color}: ${stat._count.color} вариаций`);
    });

    // Показываем количество вариаций без цвета
    const variantsWithoutColor = await prisma.productVariant.count({
      where: { color: null },
    });

    console.log(`\n📊 Вариаций без цвета: ${variantsWithoutColor}`);

  } catch (error) {
    console.error('❌ Ошибка при очистке цветов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем очистку
cleanVariantColors();

