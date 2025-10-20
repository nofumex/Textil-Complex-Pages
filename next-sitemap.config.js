/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://textil-kompleks.ru',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/admin/*',
    '/api/*',
    '/profile/*',
    '/checkout/*',
    '/login',
    '/register',
    '/404',
    '/500',
  ],
  additionalPaths: async (config) => {
    const result = []

    // Add dynamic product pages
    // Note: In production, you'd fetch these from your database
    const sampleProducts = [
      'komplekt-klassik',
      'podushka-komfort', 
      'odeyalo-premium',
      'namatrasnik-waterproof',
    ]

    sampleProducts.forEach((slug) => {
      result.push({
        loc: `/products/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      })
    })

    // Add dynamic category pages
    const sampleCategories = [
      'postelnoe-bele',
      'podushki',
      'odeyala',
      'namatrasniki',
      'polotentsa',
    ]

    sampleCategories.forEach((slug) => {
      result.push({
        loc: `/catalog/${slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      })
    })

    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/checkout/',
          '/login',
          '/register',
          '/*?*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/checkout/',
        ],
      },
    ],
    additionalSitemaps: [
      'https://textil-kompleks.ru/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom transformation for specific pages
    const customPages = {
      '/': {
        priority: 1.0,
        changefreq: 'daily',
      },
      '/catalog': {
        priority: 0.9,
        changefreq: 'daily',
      },
      '/about': {
        priority: 0.6,
        changefreq: 'monthly',
      },
      '/contacts': {
        priority: 0.6,
        changefreq: 'monthly',
      },
      '/delivery': {
        priority: 0.5,
        changefreq: 'monthly',
      },
    }

    if (customPages[path]) {
      return {
        loc: path,
        changefreq: customPages[path].changefreq,
        priority: customPages[path].priority,
        lastmod: new Date().toISOString(),
      }
    }

    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}


