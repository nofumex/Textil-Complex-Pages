import { PrismaClient } from '@prisma/client';
import { WPXMLImporter } from '../src/lib/wp-import';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdminAndImport() {
  console.log('🚀 Настройка админа и импорт товаров с вариациями...\n');

  try {
    // 1. Создаем админа, если не существует
    console.log('1. Создание администратора...');
    
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Администратор уже существует');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@textil-complex.ru',
          password: hashedPassword,
          firstName: 'Администратор',
          lastName: 'Системы',
          role: 'ADMIN',
          isBlocked: false
        }
      });

      console.log('✅ Администратор создан:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Пароль: admin123`);
    }

    // 2. Создаем базовые категории
    console.log('\n2. Создание базовых категорий...');
    
    const categories = [
      { name: 'Полотенца', slug: 'polotenca' },
      { name: 'Постельное белье', slug: 'postelnoe-bele' },
      { name: 'Скатерти', slug: 'skaterti' },
      { name: 'Шторы', slug: 'shtory' },
      { name: 'Ковры', slug: 'kovry' }
    ];

    for (const catData of categories) {
      const existing = await prisma.category.findUnique({
        where: { slug: catData.slug }
      });

      if (!existing) {
        await prisma.category.create({
          data: catData
        });
        console.log(`   ✅ Создана категория: ${catData.name}`);
      } else {
        console.log(`   ℹ️  Категория уже существует: ${catData.name}`);
      }
    }

    // 3. Импортируем товары из XML
    console.log('\n3. Импорт товаров из WordPress XML...');
    
    const xmlFiles = [
      'WordPress.2025-10-07.xml',
      'WordPress.2025-10-07 (1).xml'
    ].filter(file => fs.existsSync(file));

    if (xmlFiles.length === 0) {
      console.log('⚠️  XML файлы не найдены. Пропускаем импорт.');
    } else {
      console.log(`Найдено XML файлов: ${xmlFiles.length}`);
      
      const importer = new WPXMLImporter();
      let totalProcessed = 0;
      let totalCreated = 0;
      let totalUpdated = 0;

      for (const xmlFile of xmlFiles) {
        console.log(`\n📄 Обработка файла: ${xmlFile}`);
        
        try {
          const xmlContent = fs.readFileSync(xmlFile, 'utf-8');
          const result = await importer.importFromXML(xmlContent, {
            updateExisting: true,
            autoCreateCategories: true,
            defaultCurrency: 'RUB'
          });

          totalProcessed += result.processed;
          totalCreated += result.created;
          totalUpdated += result.updated;

          console.log(`   ✅ Обработано: ${result.processed}`);
          console.log(`   ✅ Создано: ${result.created}`);
          console.log(`   ✅ Обновлено: ${result.updated}`);
          console.log(`   ⚠️  Ошибки: ${result.errors.length}`);
          console.log(`   ℹ️  Предупреждения: ${result.warnings.length}`);

          if (result.errors.length > 0) {
            console.log('   Ошибки:');
            result.errors.slice(0, 3).forEach(error => console.log(`     - ${error}`));
          }

        } catch (error) {
          console.error(`   ❌ Ошибка при обработке ${xmlFile}:`, error);
        }
      }

      console.log(`\n📊 Итого импортировано:`);
      console.log(`   📦 Обработано товаров: ${totalProcessed}`);
      console.log(`   ➕ Создано новых: ${totalCreated}`);
      console.log(`   🔄 Обновлено существующих: ${totalUpdated}`);
    }

    // 4. Проверяем результат
    console.log('\n4. Проверка результата...');
    
    const totalProducts = await prisma.product.count();
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

    console.log(`   📦 Всего товаров: ${totalProducts}`);
    console.log(`   🎨 Товаров с вариациями: ${productsWithVariants}`);
    console.log(`   🔧 Всего вариаций: ${totalVariants}`);
    console.log(`   ✅ Активных вариаций: ${activeVariants}`);

    // 5. Показываем примеры
    if (productsWithVariants > 0) {
      console.log('\n5. Примеры товаров с вариациями:');
      
      const sampleProducts = await prisma.product.findMany({
        where: {
          variants: {
            some: {}
          }
        },
        include: {
          variants: {
            take: 3
          },
          categoryObj: true
        },
        take: 3
      });

      sampleProducts.forEach(product => {
        console.log(`\n📦 ${product.title}`);
        console.log(`   Категория: ${product.categoryObj?.name}`);
        console.log(`   Базовая цена: ${product.price} руб.`);
        console.log(`   Вариации:`);
        
        product.variants.forEach(variant => {
          console.log(`     - ${variant.color || 'Без цвета'} | ${variant.size || 'Без размера'} | ${variant.price} руб. | Склад: ${variant.stock}`);
        });
      });
    }

    // 6. Создаем настройки сайта
    console.log('\n6. Создание настроек сайта...');
    
    const settings = [
      { key: 'site_name', value: 'Текстиль Комплекс' },
      { key: 'site_description', value: 'Качественные текстильные товары для дома и офиса' },
      { key: 'contact_email', value: 'info@textil-complex.ru' },
      { key: 'contact_phone', value: '+7 (495) 123-45-67' },
      { key: 'address', value: 'Москва, ул. Примерная, д. 1' },
      { key: 'working_hours', value: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00' },
      { key: 'free_delivery_from', value: '5000' },
      { key: 'default_delivery_price', value: '500' }
    ];

    for (const setting of settings) {
      const existing = await prisma.setting.findUnique({
        where: { key: setting.key }
      });

      if (!existing) {
        await prisma.setting.create({
          data: setting
        });
        console.log(`   ✅ Создана настройка: ${setting.key}`);
      }
    }

    console.log('\n🎉 Настройка завершена успешно!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Запустите сервер: npm run dev');
    console.log('2. Откройте админку: http://localhost:3000/admin');
    console.log('3. Войдите как admin@textil-complex.ru / admin123');
    console.log('4. Проверьте импортированные товары в разделе "Товары"');
    console.log('5. Протестируйте вариации на странице товара');

  } catch (error) {
    console.error('❌ Ошибка при настройке:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminAndImport();