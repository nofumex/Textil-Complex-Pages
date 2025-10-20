import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addVariantsToProducts() {
  console.log('🛍️ Добавляем варианты к товарам...');

  try {
    // Получаем все товары
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
    });

    for (const product of products) {
      // Если у товара уже есть варианты, пропускаем
      if (product.variants.length > 0) {
        console.log(`⏭️ Товар "${product.title}" уже имеет варианты`);
        continue;
      }

      console.log(`➕ Добавляем варианты для "${product.title}"`);

      // Создаем варианты в зависимости от категории товара
      const variants = [];

      if (product.categoryId.includes('postelnoe-bele') || product.categoryId.includes('odeyala')) {
        // Для постельного белья и одеял
        variants.push(
          {
            productId: product.id,
            size: '1.5-спальный',
            color: 'Белый',
            price: Number(product.price),
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-15-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '1.5-спальный',
            color: 'Серый',
            price: Number(product.price) + 200,
            stock: Math.max(0, product.stock - 1),
            sku: `${product.sku}-15-GRAY`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '2-спальный',
            color: 'Белый',
            price: Number(product.price) + 500,
            stock: Math.max(0, product.stock - 3),
            sku: `${product.sku}-20-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '2-спальный',
            color: 'Бежевый',
            price: Number(product.price) + 700,
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-20-BEIGE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: 'Евро',
            color: 'Белый',
            price: Number(product.price) + 800,
            stock: Math.max(0, product.stock - 1),
            sku: `${product.sku}-EU-WHITE`,
            isActive: true,
          }
        );
      } else if (product.categoryId.includes('podushki')) {
        // Для подушек
        variants.push(
          {
            productId: product.id,
            size: '50x70',
            color: 'Белый',
            price: Number(product.price),
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-50x70-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '50x70',
            color: 'Серый',
            price: Number(product.price) + 100,
            stock: Math.max(0, product.stock - 1),
            sku: `${product.sku}-50x70-GRAY`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '70x70',
            color: 'Белый',
            price: Number(product.price) + 300,
            stock: Math.max(0, product.stock - 3),
            sku: `${product.sku}-70x70-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '70x70',
            color: 'Бежевый',
            price: Number(product.price) + 400,
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-70x70-BEIGE`,
            isActive: true,
          }
        );
      } else if (product.categoryId.includes('polotentsa')) {
        // Для полотенец
        variants.push(
          {
            productId: product.id,
            size: '50x90',
            color: 'Белый',
            price: Number(product.price),
            stock: Math.max(0, product.stock - 3),
            sku: `${product.sku}-50x90-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '50x90',
            color: 'Серый',
            price: Number(product.price) + 50,
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-50x90-GRAY`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '70x140',
            color: 'Белый',
            price: Number(product.price) + 200,
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-70x140-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '70x140',
            color: 'Бежевый',
            price: Number(product.price) + 250,
            stock: Math.max(0, product.stock - 1),
            sku: `${product.sku}-70x140-BEIGE`,
            isActive: true,
          }
        );
      } else {
        // Для остальных товаров (наматрасники и т.д.)
        variants.push(
          {
            productId: product.id,
            size: '160x200',
            color: 'Белый',
            price: Number(product.price),
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-160x200-WHITE`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '160x200',
            color: 'Серый',
            price: Number(product.price) + 100,
            stock: Math.max(0, product.stock - 1),
            sku: `${product.sku}-160x200-GRAY`,
            isActive: true,
          },
          {
            productId: product.id,
            size: '180x200',
            color: 'Белый',
            price: Number(product.price) + 200,
            stock: Math.max(0, product.stock - 2),
            sku: `${product.sku}-180x200-WHITE`,
            isActive: true,
          }
        );
      }

      // Создаем варианты
      await prisma.productVariant.createMany({
        data: variants,
        skipDuplicates: true,
      });

      console.log(`✅ Добавлено ${variants.length} вариантов для "${product.title}"`);
    }

    console.log('🎉 Все варианты успешно добавлены!');

  } catch (error) {
    console.error('❌ Ошибка при добавлении вариантов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
addVariantsToProducts();

