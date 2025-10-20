import { ProductWithDetails } from '@/types';

interface OrganizationStructuredDataProps {
  className?: string;
}

export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({ className }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ООО Текстиль Комплекс',
    alternateName: 'Текстиль Комплекс',
    url: 'https://textil-kompleks.ru',
    logo: 'https://textil-kompleks.ru/logo.png',
    foundingDate: '2004',
    description: 'Постельные принадлежности высокого качества. Работаем с 2004 года. Большой склад, оперативная отшивка, собственный автотранспорт.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Примерная, д. 123',
      addressLocality: 'Москва',
      addressCountry: 'RU'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+7-495-123-45-67',
        contactType: 'customer service',
        areaServed: 'RU',
        availableLanguage: 'Russian'
      },
      {
        '@type': 'ContactPoint',
        email: 'info@textil-kompleks.ru',
        contactType: 'customer service'
      }
    ],
    sameAs: [
      'https://vk.com/textil_kompleks',
      'https://t.me/textil_kompleks'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Каталог постельных принадлежностей',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Постельное белье',
          url: 'https://textil-kompleks.ru/catalog/postelnoe-bele'
        },
        {
          '@type': 'OfferCatalog',
          name: 'Подушки',
          url: 'https://textil-kompleks.ru/catalog/podushki'
        },
        {
          '@type': 'OfferCatalog',
          name: 'Одеяла',
          url: 'https://textil-kompleks.ru/catalog/odeyala'
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

interface ProductStructuredDataProps {
  product: ProductWithDetails;
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({ product }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: product.images.length > 0 ? product.images : ['https://textil-kompleks.ru/placeholder.jpg'],
    brand: {
      '@type': 'Brand',
      name: 'Текстиль Комплекс'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'ООО Текстиль Комплекс'
    },
    sku: product.sku,
    mpn: product.sku,
    category: product.categoryObj.name,
    material: product.material || '',
    offers: {
      '@type': 'Offer',
      url: `https://textil-kompleks.ru/products/${product.slug}`,
      priceCurrency: product.currency,
      price: Number(product.price),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      availability: product.isInStock && product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'ООО Текстиль Комплекс'
      }
    },
    aggregateRating: product.averageRating && product._count?.reviews ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product._count.reviews,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    review: product.reviews?.slice(0, 5).map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      author: {
        '@type': 'Person',
        name: `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
      },
      reviewBody: review.content,
      datePublished: new Date(review.createdAt).toISOString().split('T')[0]
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export const BreadcrumbStructuredData: React.FC<BreadcrumbStructuredDataProps> = ({ items }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

interface WebsiteStructuredDataProps {}

export const WebsiteStructuredData: React.FC<WebsiteStructuredDataProps> = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Текстиль Комплекс',
    alternateName: 'ООО Текстиль Комплекс',
    url: 'https://textil-kompleks.ru',
    description: 'Интернет-магазин постельных принадлежностей. Работаем с 2004 года.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://textil-kompleks.ru/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ООО Текстиль Комплекс',
      logo: {
        '@type': 'ImageObject',
        url: 'https://textil-kompleks.ru/logo.png'
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQStructuredData: React.FC<FAQStructuredDataProps> = ({ faqs }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};


