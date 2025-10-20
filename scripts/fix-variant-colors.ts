import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVariantColors() {
  console.log('🔧 Исправляем цвета в вариациях товаров...');

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
      include: {
        product: true,
      },
    });

    console.log(`📦 Найдено вариаций с неправильными цветами: ${variantsWithBadColors.length}`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const variant of variantsWithBadColors) {
      try {
        // Определяем правильный цвет на основе названия товара или других данных
        let newColor: string | null = null;

        // Попробуем извлечь цвет из названия товара
        const productTitle = variant.product.title.toLowerCase();
        
        // Список возможных цветов
        const possibleColors = [
          'белый', 'черный', 'красный', 'синий', 'зеленый', 'желтый', 'розовый', 
          'фиолетовый', 'оранжевый', 'коричневый', 'серый', 'бежевый', 'голубой',
          'сиреневый', 'темно-серый', 'светло-серый', 'кремовый', 'бордовый'
        ];

        // Ищем цвет в названии товара
        for (const color of possibleColors) {
          if (productTitle.includes(color)) {
            newColor = color;
            break;
          }
        }

        // Если цвет не найден, оставляем null
        if (!newColor) {
          console.log(`⏭️ Пропускаем вариацию ${variant.sku} - цвет не определен`);
          skippedCount++;
          continue;
        }

        // Обновляем вариацию
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { color: newColor },
        });

        console.log(`✅ Исправлена вариация ${variant.sku}: "${variant.color}" → "${newColor}"`);
        fixedCount++;

      } catch (error) {
        console.error(`❌ Ошибка при исправлении вариации ${variant.sku}:`, error);
        skippedCount++;
      }
    }

    console.log(`\n📊 Результаты исправления:`);
    console.log(`  Исправлено: ${fixedCount}`);
    console.log(`  Пропущено: ${skippedCount}`);

    // Показываем статистику по цветам после исправления
    const colorStats = await prisma.productVariant.groupBy({
      by: ['color'],
      _count: { color: true },
      where: { color: { not: null } },
      orderBy: { _count: { color: 'desc' } },
      take: 10,
    });

    console.log(`\n🎨 Топ-10 цветов после исправления:`);
    colorStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.color}: ${stat._count.color} вариаций`);
    });

  } catch (error) {
    console.error('❌ Ошибка при исправлении цветов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем исправление
fixVariantColors();

