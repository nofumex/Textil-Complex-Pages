import { db } from './db';
import { hashPassword } from './auth';
import { generateSlug, generateSKU, generateProductImages } from './utils';

async function seed() {
  console.log('🌱 Начинаем наполнение базы данных...');

  try {
    // Create admin user
    console.log('👤 Создаём администратора...');
    const adminPassword = await hashPassword('admin123');
    
    const admin = await db.user.upsert({
      where: { email: 'admin@textil-kompleks.ru' },
      update: {},
      create: {
        firstName: 'Администратор',
        lastName: 'Системы',
        email: 'admin@textil-kompleks.ru',
        password: adminPassword,
        phone: '+7 (495) 123-45-67',
        role: 'ADMIN',
      },
    });

    // Create test customer
    console.log('👤 Создаём тестового клиента...');
    const customerPassword = await hashPassword('customer123');
    
    const customer = await db.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'customer@example.com',
        password: customerPassword,
        phone: '+7 (495) 987-65-43',
        company: 'ООО "Тестовая компания"',
        role: 'CUSTOMER',
      },
    });

    // Create categories
    console.log('📂 Создаём категории...');
    const categories = [
      {
        name: 'Постельное белье',
        slug: 'postelnoe-bele',
        description: 'Комплекты постельного белья различных размеров и материалов',
        seoTitle: 'Постельное белье - купить в Москве | Текстиль Комплекс',
        seoDesc: 'Широкий выбор постельного белья: хлопок, сатин, перкаль. Доставка по Москве и области.',
        sortOrder: 1,
      },
      {
        name: 'Подушки',
        slug: 'podushki',
        description: 'Ортопедические и классические подушки',
        seoTitle: 'Подушки для сна - ортопедические и классические | Текстиль Комплекс',
        seoDesc: 'Качественные подушки для комфортного сна. Различные наполнители и размеры.',
        sortOrder: 2,
      },
      {
        name: 'Одеяла',
        slug: 'odeyala',
        description: 'Одеяла из натуральных и синтетических материалов',
        seoTitle: 'Одеяла - пуховые, синтетические, шерстяные | Текстиль Комплекс',
        seoDesc: 'Теплые и легкие одеяла для любого сезона. Большой выбор размеров.',
        sortOrder: 3,
      },
      {
        name: 'Наматрасники',
        slug: 'namatrasniki',
        description: 'Защитные наматрасники и топперы',
        seoTitle: 'Наматрасники - защитные, водонепроницаемые | Текстиль Комплекс',
        seoDesc: 'Защитите ваш матрас с помощью качественных наматрасников.',
        sortOrder: 4,
      },
      {
        name: 'Полотенца',
        slug: 'polotentsa',
        description: 'Банные и кухонные полотенца',
        seoTitle: 'Полотенца - банные, кухонные, махровые | Текстиль Комплекс',
        seoDesc: 'Мягкие и впитывающие полотенца из качественных материалов.',
        sortOrder: 5,
      },
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await db.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData,
      });
      createdCategories.push(category);
    }

    // Create products
    console.log('🛏️ Создаём товары...');
    const products = [
      // Постельное белье
      {
        title: 'Комплект постельного белья "Классик" 1.5-спальный',
        description: 'Элегантный комплект постельного белья из 100% хлопка высшего качества',
        content: 'Комплект включает: пододеяльник 145x210 см, простыня 150x215 см, наволочка 70x70 см - 1 шт. Материал: перкаль, 100% хлопок. Плотность: 120 г/м². Стирка при температуре до 40°C.',
        price: 2500,
        oldPrice: 3000,
        stock: 15,
        material: '100% хлопок, перкаль',
        category: 'MIDDLE',
        categoryId: createdCategories[0].id,
        tags: ['хлопок', 'перкаль', '1.5-спальный', 'классический'],
        seoTitle: 'Комплект постельного белья Классик 1.5-спальный - купить в Москве',
        seoDesc: 'Качественный комплект постельного белья из 100% хлопка. Перкаль, размер 1.5-спальный. Доставка по Москве и области.',
        dimensions: '145x210 см',
        weight: 1.2,
      },
      {
        title: 'Комплект постельного белья "Люкс" 2-спальный',
        description: 'Премиальный комплект из египетского хлопка',
        content: 'Комплект включает: пододеяльник 175x215 см, простыня 180x220 см, наволочки 70x70 см - 2 шт. Материал: сатин премиум, 100% египетский хлопок. Плотность: 140 г/м².',
        price: 4500,
        stock: 8,
        material: '100% египетский хлопок, сатин',
        category: 'LUXURY',
        categoryId: createdCategories[0].id,
        tags: ['египетский хлопок', 'сатин', '2-спальный', 'премиум'],
        seoTitle: 'Комплект постельного белья Люкс 2-спальный из египетского хлопка',
        seoDesc: 'Премиальное постельное белье из египетского хлопка. Сатин высшего качества, размер 2-спальный.',
        dimensions: '175x215 см',
        weight: 1.8,
        isFeatured: true,
      },
      // Подушки
      {
        title: 'Подушка ортопедическая "Комфорт"',
        description: 'Ортопедическая подушка с эффектом памяти',
        content: 'Подушка с наполнителем из пенополиуретана с эффектом памяти. Размер: 60x40x12 см. Чехол съемный, из бамбукового волокна. Поддерживает правильное положение головы и шеи во время сна.',
        price: 1200,
        stock: 25,
        material: 'Пенополиуретан с эффектом памяти',
        category: 'MIDDLE',
        categoryId: createdCategories[1].id,
        tags: ['ортопедическая', 'память', 'бамбук', 'съемный чехол'],
        seoTitle: 'Ортопедическая подушка Комфорт с эффектом памяти',
        seoDesc: 'Качественная ортопедическая подушка для здорового сна. Наполнитель с эффектом памяти.',
        dimensions: '60x40x12 см',
        weight: 0.8,
        isFeatured: true,
      },
      {
        title: 'Подушка пуховая "Премиум"',
        description: 'Подушка из натурального гусиного пуха',
        content: 'Подушка с наполнителем из 90% гусиного пуха и 10% пера. Размер: 70x70 см. Чехол из 100% хлопка. Высокая воздухопроницаемость и терморегуляция.',
        price: 3500,
        stock: 12,
        material: '90% гусиный пух, 10% перо',
        category: 'LUXURY',
        categoryId: createdCategories[1].id,
        tags: ['пух', 'гусиный', 'натуральный', 'премиум'],
        seoTitle: 'Пуховая подушка Премиум из гусиного пуха 70x70',
        seoDesc: 'Роскошная подушка из натурального гусиного пуха. Размер 70x70 см. Высокое качество.',
        dimensions: '70x70 см',
        weight: 1.0,
      },
      // Одеяла
      {
        title: 'Одеяло пуховое "Зимнее"',
        description: 'Теплое пуховое одеяло для зимы',
        content: 'Одеяло с наполнителем из белого гусиного пуха категории Экстра. Размер: 172x205 см. Чехол из сатина. Степень теплоты: очень теплое. Подходит для зимнего периода.',
        price: 5500,
        stock: 6,
        material: 'Белый гусиный пух категории Экстра',
        category: 'LUXURY',
        categoryId: createdCategories[2].id,
        tags: ['пух', 'зимнее', 'теплое', 'сатин'],
        seoTitle: 'Пуховое одеяло Зимнее из белого гусиного пуха',
        seoDesc: 'Очень теплое пуховое одеяло для зимы. Белый гусиный пух категории Экстра.',
        dimensions: '172x205 см',
        weight: 2.2,
        isFeatured: true,
      },
      {
        title: 'Одеяло всесезонное "Комфорт"',
        description: 'Универсальное одеяло для любого сезона',
        content: 'Одеяло с наполнителем из холлофайбера. Размер: 140x205 см. Гипоаллергенное, легко стирается. Подходит для круглогодичного использования.',
        price: 1800,
        stock: 20,
        material: 'Холлофайбер',
        category: 'ECONOMY',
        categoryId: createdCategories[2].id,
        tags: ['холлофайбер', 'всесезонное', 'гипоаллергенное', 'легкий уход'],
        seoTitle: 'Всесезонное одеяло Комфорт из холлофайбера',
        seoDesc: 'Универсальное одеяло для круглогодичного использования. Гипоаллергенный холлофайбер.',
        dimensions: '140x205 см',
        weight: 1.5,
      },
      // Наматрасники
      {
        title: 'Наматрасник водонепроницаемый',
        description: 'Защитный наматрасник с мембраной',
        content: 'Наматрасник с водонепроницаемой мембраной TPU. Размер: 160x200 см. Защищает матрас от жидкостей и загрязнений. Дышащий материал, не создает парникового эффекта.',
        price: 1800,
        stock: 18,
        material: 'Полиэстер + мембрана TPU',
        category: 'MIDDLE',
        categoryId: createdCategories[3].id,
        tags: ['водонепроницаемый', 'мембрана', 'защитный', 'дышащий'],
        seoTitle: 'Водонепроницаемый наматрасник с мембраной TPU',
        seoDesc: 'Качественный защитный наматрасник. Водонепроницаемая мембрана, дышащий материал.',
        dimensions: '160x200 см',
        weight: 0.9,
        isFeatured: true,
      },
      // Полотенца
      {
        title: 'Комплект махровых полотенец',
        description: 'Набор мягких махровых полотенец',
        content: 'Комплект из 3 полотенец: банное 70x140 см, лицевое 50x90 см, для рук 30x50 см. Материал: 100% хлопок, махра. Плотность: 450 г/м². Высокая впитываемость.',
        price: 1200,
        stock: 30,
        material: '100% хлопок, махра',
        category: 'MIDDLE',
        categoryId: createdCategories[4].id,
        tags: ['махра', 'комплект', 'хлопок', 'впитывающие'],
        seoTitle: 'Комплект махровых полотенец из 100% хлопка',
        seoDesc: 'Мягкие махровые полотенца высокого качества. Набор из 3 размеров.',
        dimensions: '70x140, 50x90, 30x50 см',
        weight: 1.1,
      },
    ];

    for (const productData of products) {
      const slug = generateSlug(productData.title);
      const sku = generateSKU(categories.find(c => c.id === productData.categoryId)?.name || 'PRODUCT', productData.title);
      const images = generateProductImages(productData.title, 3);

      const created = await db.product.upsert({
        where: { slug },
        update: {},
        create: {
          ...productData,
          slug,
          sku,
          images,
        },
      });

      // Create sample variants for each product
      await db.productVariant.createMany({
        data: [
          {
            productId: created.id,
            size: 'S',
            color: 'Белый',
            material: created.material || undefined,
            price: Number(productData.price),
            stock: Math.max(0, (productData.stock || 0) - 1),
            sku: `${sku}-S`,
            isActive: true,
          },
          {
            productId: created.id,
            size: 'M',
            color: 'Серый',
            material: created.material || undefined,
            price: Number(productData.price) + 200,
            stock: Math.max(0, (productData.stock || 0) - 2),
            sku: `${sku}-M`,
            isActive: true,
          },
          {
            productId: created.id,
            size: 'L',
            color: 'Бежевый',
            material: created.material || undefined,
            price: Number(productData.price) + 400,
            stock: Math.max(0, (productData.stock || 0) - 3),
            sku: `${sku}-L`,
            isActive: true,
          },
        ],
        skipDuplicates: true,
      });
    }

    // Create sample order
    console.log('📦 Создаём примерный заказ...');
    const products_for_order = await db.product.findMany({ take: 2 });
    
    const order = await db.order.create({
      data: {
        orderNumber: 'TK-' + Date.now().toString().slice(-6) + '-ABC',
        userId: customer.id,
        status: 'NEW',
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        deliveryType: 'COURIER',
        subtotal: 4000,
        delivery: 500,
        total: 4500,
        items: {
          create: [
            {
              productId: products_for_order[0].id,
              quantity: 1,
              price: Number(products_for_order[0].price),
              total: Number(products_for_order[0].price),
            },
            {
              productId: products_for_order[1].id,
              quantity: 2,
              price: Number(products_for_order[1].price),
              total: Number(products_for_order[1].price) * 2,
            },
          ],
        },
      },
    });

    // Create order log
    await db.orderLog.create({
      data: {
        orderId: order.id,
        status: 'NEW',
        comment: 'Заказ создан клиентом',
        createdBy: customer.id,
      },
    });

    // Create sample reviews
    console.log('⭐ Создаём отзывы...');
    const review_products = await db.product.findMany({ take: 3 });
    
    const reviews = [
      {
        productId: review_products[0].id,
        userId: customer.id,
        rating: 5,
        title: 'Отличное качество!',
        content: 'Очень довольны покупкой. Качество материала превосходное, пошив аккуратный. Рекомендую!',
        isActive: true,
      },
      {
        productId: review_products[1].id,
        userId: customer.id,
        rating: 4,
        title: 'Хорошая подушка',
        content: 'Удобная ортопедическая подушка. Спать стало комфортнее. Единственный минус - долго привыкал к новой высоте.',
        isActive: true,
      },
      {
        productId: review_products[2].id,
        userId: customer.id,
        rating: 5,
        title: 'Теплое и легкое',
        content: 'Пуховое одеяло просто великолепное! Очень теплое, но при этом не тяжелое. Сон стал намного лучше.',
        isActive: true,
      },
    ];

    for (const reviewData of reviews) {
      await db.review.create({
        data: reviewData,
      });
    }

    // Create sample leads
    console.log('📝 Создаём лиды...');
    const leads = [
      {
        name: 'Мария Сидорова',
        phone: '+7 (495) 111-22-33',
        email: 'maria@hotel.ru',
        company: 'Отель "Московский"',
        message: 'Интересует оптовая закупка постельного белья для гостиницы на 50 номеров',
        source: 'landing',
        status: 'NEW',
      },
      {
        name: 'Дмитрий Козлов',
        phone: '+7 (495) 444-55-66',
        email: 'dmitry@example.com',
        message: 'Хочу заказать индивидуальную отшивку постельного белья',
        source: 'catalog',
        status: 'CONTACTED',
      },
    ];

    for (const leadData of leads) {
      await db.lead.create({
        data: leadData,
      });
    }

    // Create settings
    console.log('⚙️ Создаём настройки...');
    const settings = [
      { key: 'contactEmail', value: 'za-bol@yandex.ru', type: 'STRING' },
      { key: 'contactPhone', value: '+7 (391) 278‒46‒72', type: 'STRING' },
      { key: 'address', value: 'Маерчака, 49г склад №4', type: 'STRING' },
      {
        key: 'socialLinks',
        value: JSON.stringify([
          { label: 'WB', url: 'Wildberries' },
          { label: 'ВК', url: 'vk.com/stiligoroda' },
        ]),
        type: 'JSON',
      },
      {
        key: 'extraContacts',
        value: JSON.stringify([
          {
            title: 'Отдел продаж готовых изделий',
            values: ['+7 (391) 278-04-60', '+7(967) 608-04-60', '+7 (967) 612-32-54'],
          },
          {
            title: 'Отдел расчета (цех пошива)',
            values: ['+7 (391) 278-04-60', '+7 (905) 976-46-25'],
          },
          {
            title: 'Отдел продаж (одежда для дома)',
            values: ['+7 (923) 015-28-10'],
          },
        ]),
        type: 'JSON',
      },
    ];

    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    console.log('✅ База данных успешно наполнена!');
    console.log(`👤 Администратор: admin@textil-kompleks.ru / admin123`);
    console.log(`👤 Клиент: customer@example.com / customer123`);

  } catch (error) {
    console.error('❌ Ошибка при наполнении базы данных:', error);
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

export default seed;


