import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportedData() {
  console.log('🔍 Проверяем импортированные данные...');
  
  try {
    // Проверяем категории
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            variants: true
          }
        }
      }
    });
    
    console.log(`\n📂 Категории (${categories.length}):`);
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category.products.length} товаров)`);
    });
    
    // Проверяем товары
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        categoryObj: true
      }
    });
    
    console.log(`\n📦 Товары (${products.length}):`);
    products.slice(0, 5).forEach(product => {
      console.log(`  - ${product.title}`);
      console.log(`    Категория: ${product.categoryObj?.name || 'Без категории'}`);
      console.log(`    Цена: ${product.price} ${product.currency}`);
      console.log(`    Изображения: ${product.images.length}`);
      console.log(`    Варианты: ${product.variants.length}`);
      if (product.variants.length > 0) {
        console.log(`    Варианты:`);
        product.variants.slice(0, 3).forEach(variant => {
          console.log(`      - ${variant.color || 'Без цвета'} ${variant.size || 'Без размера'} (${variant.price} руб.)`);
        });
      }
      console.log('');
    });
    
    // Проверяем варианты товаров
    const variants = await prisma.productVariant.findMany({
      include: {
        product: true
      }
    });
    
    console.log(`\n🎨 Варианты товаров (${variants.length}):`);
    variants.slice(0, 5).forEach(variant => {
      console.log(`  - ${variant.product.title}`);
      console.log(`    Цвет: ${variant.color || 'Не указан'}`);
      console.log(`    Размер: ${variant.size || 'Не указан'}`);
      console.log(`    Цена: ${variant.price} руб.`);
      console.log(`    Остаток: ${variant.stock} шт.`);
      console.log('');
    });
    
    // Проверяем изображения в папке uploads
    const fs = require('fs');
    const path = require('path');
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      console.log(`\n🖼️ Изображения в папке uploads (${files.length}):`);
      // @ts-ignore
files.slice(0, 10).forEach(file => {
  console.log(`  - ${file}`);
});

      if (files.length > 10) {
        console.log(`  ... и еще ${files.length - 10} файлов`);
      }
    }
    
    console.log('\n✅ Проверка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkImportedData();
}

export default checkImportedData;
