import { PrismaClient } from '@prisma/client';
import { WPVariantsImporterV3 } from '../src/lib/wp-variants-import-v3';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importWordPressVariantsV3() {
  console.log('📥 Импорт товаров с вариациями из WordPress XML (v3)...\n');

  try {
    // Ищем XML файлы в корне проекта
    const xmlFiles = [
      'WordPress.2025-10-07.xml',
      'WordPress.2025-10-07 (1).xml'
    ].filter(file => fs.existsSync(file));

    if (xmlFiles.length === 0) {
      console.log('❌ XML файлы не найдены. Убедитесь, что файлы WordPress.2025-10-07.xml находятся в корне проекта.');
      return;
    }

    console.log(`Найдено XML файлов: ${xmlFiles.length}`);
    xmlFiles.forEach(file => console.log(`  - ${file}`));

    // Читаем и импортируем каждый файл
    const importer = new WPVariantsImporterV3();
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalVariantsCreated = 0;
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const xmlFile of xmlFiles) {
      console.log(`\n📄 Обработка файла: ${xmlFile}`);
      
      try {
        const xmlContent = fs.readFileSync(xmlFile, 'utf-8');
        const result = await importer.importFromXML(xmlContent, {
          updateExisting: true,
          autoCreateCategories: true,
          defaultCurrency: 'RUB',
          createAllVariants: true
        });

        totalProcessed += result.processed;
        totalCreated += result.created;
        totalUpdated += result.updated;
        totalVariantsCreated += result.variantsCreated;
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);

        console.log(`  ✅ Обработано: ${result.processed}`);
        console.log(`  ✅ Создано: ${result.created}`);
        console.log(`  ✅ Обновлено: ${result.updated}`);
        console.log(`  🎨 Создано вариаций: ${result.variantsCreated}`);
        console.log(`  ⚠️  Ошибки: ${result.errors.length}`);
        console.log(`  ℹ️  Предупреждения: ${result.warnings.length}`);

      } catch (error) {
        console.error(`  ❌ Ошибка при обработке ${xmlFile}:`, error);
        allErrors.push(`Ошибка при обработке ${xmlFile}: ${error}`);
      }
    }

    // Итоговая статистика
    console.log('\n📊 Итоговая статистика импорта:');
    console.log(`  📦 Всего обработано товаров: ${totalProcessed}`);
    console.log(`  ➕ Создано новых: ${totalCreated}`);
    console.log(`  🔄 Обновлено существующих: ${totalUpdated}`);
    console.log(`  🎨 Создано вариаций: ${totalVariantsCreated}`);
    console.log(`  ❌ Всего ошибок: ${allErrors.length}`);
    console.log(`  ⚠️  Всего предупреждений: ${allWarnings.length}`);

    // Показываем ошибки, если есть
    if (allErrors.length > 0) {
      console.log('\n❌ Ошибки:');
      allErrors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (allErrors.length > 10) {
        console.log(`  ... и еще ${allErrors.length - 10} ошибок`);
      }
    }

    // Показываем предупреждения, если есть
    if (allWarnings.length > 0) {
      console.log('\n⚠️  Предупреждения:');
      allWarnings.slice(0, 10).forEach(warning => console.log(`  - ${warning}`));
      if (allWarnings.length > 10) {
        console.log(`  ... и еще ${allWarnings.length - 10} предупреждений`);
      }
    }

    // Проверяем результат
    console.log('\n🔍 Проверка результата:');
    
    const productsWithVariants = await prisma.product.count({
      where: {
        variants: {
          some: {}
        }
      }
    });

    const totalVariants = await prisma.productVariant.count();
    const activeVariants = await prisma.productVariant.count({
      where: { isActive: true }
    });

    console.log(`  📦 Товаров с вариациями: ${productsWithVariants}`);
    console.log(`  🎨 Всего вариаций: ${totalVariants}`);
    console.log(`  ✅ Активных вариаций: ${activeVariants}`);

    // Показываем примеры созданных вариаций
    const sampleVariants = await prisma.productVariant.findMany({
      take: 5,
      include: {
        product: {
          select: {
            title: true,
            sku: true
          }
        }
      }
    });

    if (sampleVariants.length > 0) {
      console.log('\n🎨 Примеры созданных вариаций:');
      sampleVariants.forEach(variant => {
        console.log(`  - ${variant.product.title} | ${variant.color || 'Без цвета'} | ${variant.size || 'Без размера'} | ${variant.price} руб. | ${variant.sku}`);
      });
    }

    // Показываем товары с разными ценами вариаций
    const productsWithPriceVariations = await prisma.product.findMany({
      where: {
        variants: {
          some: {
            price: {
              not: undefined
            }
          }
        }
      },
      include: {
        variants: {
          select: {
            color: true,
            size: true,
            price: true,
            sku: true
          }
        }
      },
      take: 3
    });

    if (productsWithPriceVariations.length > 0) {
      console.log('\n💰 Примеры товаров с разными ценами вариаций:');
      productsWithPriceVariations.forEach(product => {
        console.log(`  📦 ${product.title}:`);
        product.variants.forEach(variant => {
          console.log(`    - ${variant.color || 'Без цвета'} ${variant.size || 'Без размера'}: ${variant.price} руб. (${variant.sku})`);
        });
      });
    }

    console.log('\n✅ Импорт завершен!');

  } catch (error) {
    console.error('❌ Критическая ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importWordPressVariantsV3();
