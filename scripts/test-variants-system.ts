import { PrismaClient } from '@prisma/client';
import { WPXMLImporter } from '../src/lib/wp-import';

const prisma = new PrismaClient();

async function testVariantsSystem() {
  console.log('🧪 Тестирование системы вариаций товаров...\n');

  try {
    // 1. Проверяем существующие товары с вариациями
    console.log('1. Проверка существующих товаров с вариациями:');
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {}
        }
      },
      include: {
        variants: true,
        categoryObj: true
      },
      take: 5
    });

    console.log(`Найдено товаров с вариациями: ${productsWithVariants.length}`);
    
    productsWithVariants.forEach(product => {
      console.log(`\n📦 Товар: ${product.title}`);
      console.log(`   Категория: ${product.categoryObj?.name}`);
      console.log(`   Базовая цена: ${product.price} руб.`);
      console.log(`   Вариации (${product.variants.length}):`);
      
      product.variants.forEach(variant => {
        console.log(`     - ${variant.color || 'Без цвета'} | ${variant.size || 'Без размера'} | ${variant.price} руб. | Склад: ${variant.stock}`);
      });
    });

    // 2. Проверяем статистику вариаций
    console.log('\n2. Статистика вариаций:');
    const totalVariants = await prisma.productVariant.count();
    const activeVariants = await prisma.productVariant.count({
      where: { isActive: true }
    });
    const variantsWithColor = await prisma.productVariant.count({
      where: { color: { not: null } }
    });
    const variantsWithSize = await prisma.productVariant.count({
      where: { size: { not: null } }
    });

    console.log(`   Всего вариаций: ${totalVariants}`);
    console.log(`   Активных вариаций: ${activeVariants}`);
    console.log(`   С цветом: ${variantsWithColor}`);
    console.log(`   С размером: ${variantsWithSize}`);

    // 3. Проверяем уникальные цвета и размеры
    console.log('\n3. Уникальные атрибуты:');
    const uniqueColors = await prisma.productVariant.findMany({
      where: { color: { not: null } },
      select: { color: true },
      distinct: ['color']
    });
    
    const uniqueSizes = await prisma.productVariant.findMany({
      where: { size: { not: null } },
      select: { size: true },
      distinct: ['size']
    });

    console.log(`   Уникальные цвета (${uniqueColors.length}): ${uniqueColors.map(c => c.color).join(', ')}`);
    console.log(`   Уникальные размеры (${uniqueSizes.length}): ${uniqueSizes.map(s => s.size).join(', ')}`);

    // 4. Тестируем поиск товаров по атрибутам
    console.log('\n4. Тестирование поиска по атрибутам:');
    
    if (uniqueColors.length > 0) {
      const firstColor = uniqueColors[0].color;
      const productsWithColor = await prisma.product.findMany({
        where: {
          variants: {
            some: { color: firstColor }
          }
        },
        include: { variants: true }
      });
      console.log(`   Товары с цветом "${firstColor}": ${productsWithColor.length}`);
    }

    if (uniqueSizes.length > 0) {
      const firstSize = uniqueSizes[0].size;
      const productsWithSize = await prisma.product.findMany({
        where: {
          variants: {
            some: { size: firstSize }
          }
        },
        include: { variants: true }
      });
      console.log(`   Товары с размером "${firstSize}": ${productsWithSize.length}`);
    }

    // 5. Проверяем корректность данных
    console.log('\n5. Проверка корректности данных:');
    
    const invalidVariants = await prisma.productVariant.findMany({
      where: {
        OR: [
          { price: { lte: 0 } },
          { stock: { lt: 0 } },
          { sku: { equals: '' } }
        ]
      }
    });

    if (invalidVariants.length > 0) {
      console.log(`   ⚠️  Найдены некорректные вариации: ${invalidVariants.length}`);
      invalidVariants.forEach(variant => {
        console.log(`     - ID: ${variant.id}, SKU: ${variant.sku}, Цена: ${variant.price}, Склад: ${variant.stock}`);
      });
    } else {
      console.log('   ✅ Все вариации корректны');
    }

    // 6. Тестируем импорт с вариациями
    console.log('\n6. Тестирование импорта с вариациями:');
    
    // Создаем тестовый XML с вариациями
    const testXml = `
    <rss>
      <channel>
        <item>
          <title><![CDATA[Тестовое полотенце]]></title>
          <wp:post_id>9999</wp:post_id>
          <wp:post_type>product</wp:post_type>
          <wp:status>publish</wp:status>
          <category domain="product_cat" nicename="test"><![CDATA[Тест]]></category>
          <category domain="pa_cvet" nicename="красный"><![CDATA[Красный]]></category>
          <category domain="pa_razmer" nicename="50x90"><![CDATA[50x90]]></category>
          <wp:postmeta><wp:meta_key><![CDATA[_sku]]></wp:meta_key><wp:meta_value><![CDATA[TEST-001]]></wp:meta_value></wp:postmeta>
          <wp:postmeta><wp:meta_key><![CDATA[_price]]></wp:meta_key><wp:meta_value><![CDATA[150]]></wp:meta_value></wp:postmeta>
          <wp:postmeta><wp:meta_key><![CDATA[_stock]]></wp:meta_key><wp:meta_value><![CDATA[10]]></wp:meta_value></wp:postmeta>
        </item>
      </channel>
    </rss>`;

    const importer = new WPXMLImporter();
    const result = await importer.importFromXML(testXml, {
      updateExisting: true,
      autoCreateCategories: true
    });

    console.log(`   Результат импорта:`);
    console.log(`     - Обработано: ${result.processed}`);
    console.log(`     - Создано: ${result.created}`);
    console.log(`     - Обновлено: ${result.updated}`);
    console.log(`     - Ошибки: ${result.errors.length}`);
    console.log(`     - Предупреждения: ${result.warnings.length}`);

    if (result.warnings.length > 0) {
      console.log(`   Предупреждения:`);
      result.warnings.forEach(warning => console.log(`     - ${warning}`));
    }

    console.log('\n✅ Тестирование завершено успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantsSystem();