import { Metadata } from 'next';

interface GenerateMetadataProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'product';
}

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage = '/og-image.jpg',
  canonical,
  noindex = false,
  type = 'website',
}: GenerateMetadataProps): Metadata {
  const siteName = 'Текстиль Комплекс';
  const siteUrl = process.env.SITE_URL || 'https://textil-kompleks.ru';
  
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;

  return {
    title: fullTitle,
    description,
    keywords,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    canonical: fullCanonical,
    openGraph: {
      type,
      locale: 'ru_RU',
      url: fullCanonical,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullOgImage],
    },
    alternates: {
      canonical: fullCanonical,
    },
    other: {
      'yandex-verification': process.env.YANDEX_VERIFICATION || '',
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    },
  };
}

// Predefined metadata for common pages
export const metadataTemplates = {
  home: {
    title: 'Текстиль Комплекс — постельные принадлежности оптом и в розницу',
    description: 'ООО Текстиль Комплекс — постельные принадлежности в наличии. Работаем с 2004 года. Быстрая доставка собственным автотранспортом. Большой склад, индивидуальная отшивка.',
    keywords: 'постельное белье, текстиль, постельные принадлежности, оптом, розница, отшивка, доставка, Москва',
  },
  catalog: {
    title: 'Каталог постельных принадлежностей',
    description: 'Широкий выбор постельного белья, подушек, одеял и наматрасников. Качественные материалы, доступные цены, быстрая доставка по Москве и области.',
    keywords: 'каталог, постельное белье, подушки, одеяла, наматрасники, хлопок, сатин',
  },
  about: {
    title: 'О компании Текстиль Комплекс',
    description: 'ООО «Текстиль Комплекс» работает с 2004 года. Производство и продажа качественных постельных принадлежностей. Собственный склад и автотранспорт.',
    keywords: 'о компании, текстиль комплекс, производство, опыт работы, качество',
  },
  contacts: {
    title: 'Контакты — Текстиль Комплекс',
    description: 'Свяжитесь с нами: телефон +7 (495) 123-45-67, email info@textil-kompleks.ru. Адрес: г. Москва, ул. Примерная, д. 123. Режим работы: Пн-Пт 9:00-18:00.',
    keywords: 'контакты, телефон, адрес, режим работы, связь',
  },
  delivery: {
    title: 'Доставка и оплата — Текстиль Комплекс',
    description: 'Доставка постельных принадлежностей по Москве и области собственным автотранспортом. Различные способы оплаты. Быстрая отгрузка заказов.',
    keywords: 'доставка, оплата, автотранспорт, быстрая доставка, способы оплаты',
  },
  return: {
    title: 'Возврат и обмен товаров — Текстиль Комплекс',
    description: 'Условия возврата и обмена постельных принадлежностей. Гарантия качества. Защита прав потребителей.',
    keywords: 'возврат, обмен, гарантия, права потребителей, качество',
  },
  privacy: {
    title: 'Политика конфиденциальности — Текстиль Комплекс',
    description: 'Политика обработки персональных данных. Защита конфиденциальности клиентов. Соответствие требованиям законодательства.',
    keywords: 'политика конфиденциальности, персональные данные, защита данных',
  },
  terms: {
    title: 'Условия использования — Текстиль Комплекс',
    description: 'Пользовательское соглашение и условия использования интернет-магазина постельных принадлежностей.',
    keywords: 'условия использования, пользовательское соглашение, правила',
  },
};

// Generate category metadata
export function generateCategoryMetadata(categoryName: string, categorySlug: string) {
  return {
    title: `${categoryName} — купить в Москве | Текстиль Комплекс`,
    description: `Широкий выбор ${categoryName.toLowerCase()} высокого качества. Доставка по Москве и области. Работаем с 2004 года.`,
    keywords: `${categoryName.toLowerCase()}, купить ${categoryName.toLowerCase()}, текстиль, постельные принадлежности`,
    canonical: `/catalog/${categorySlug}`,
  };
}

// Generate product metadata
export function generateProductMetadata(product: {
  title: string;
  description?: string;
  price: number;
  material?: string;
  category: string;
  slug: string;
}) {
  const priceText = new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: 'RUB',
    minimumFractionDigits: 0 
  }).format(product.price);

  return {
    title: `${product.title} — купить за ${priceText} | Текстиль Комплекс`,
    description: product.description || `${product.title} из качественных материалов. ${product.material ? `Материал: ${product.material}.` : ''} Цена: ${priceText}. Доставка по Москве и области.`,
    keywords: `${product.title.toLowerCase()}, ${product.category.toLowerCase()}, ${product.material?.toLowerCase() || ''}, купить, цена`,
    canonical: `/products/${product.slug}`,
    type: 'product' as const,
  };
}

// Generate blog/article metadata
export function generateArticleMetadata(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt?: Date;
  author?: string;
}) {
  return {
    title: `${article.title} | Блог Текстиль Комплекс`,
    description: article.description,
    canonical: `/blog/${article.slug}`,
    type: 'article' as const,
    openGraph: {
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author ? [article.author] : undefined,
    },
  };
}


