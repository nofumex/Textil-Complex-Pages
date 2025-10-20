import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { ToastProvider } from '@/components/ui/toast';
import { BackToTop } from '@/components/ui/back-to-top';
import { SitePopup } from '@/components/ui/site-popup';
import { FaviconManager } from '@/components/seo/favicon-manager';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: {
    default: 'Текстиль Комплекс — постельные принадлежности',
    template: '%s | Текстиль Комплекс',
  },
  description: 'ООО Текстиль Комплекс — постельные принадлежности в наличии. Работаем с 2004 года. Быстрая доставка собственным автотранспортом. Большой склад, индивидуальная отшивка.',
  keywords: 'постельное белье, текстиль, постельные принадлежности, оптом, отшивка, доставка',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://textil-kompleks.ru',
    siteName: 'Текстиль Комплекс',
    title: 'Текстиль Комплекс — постельные принадлежности с 2004 года',
    description: 'ООО Текстиль Комплекс — постельные принадлежности в наличии. Работаем с 2004 года. Быстрая доставка собственным автотранспортом.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Текстиль Комплекс',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Текстиль Комплекс — постельные принадлежности с 2004 года',
    description: 'ООО Текстиль Комплекс — постельные принадлежности в наличии. Работаем с 2004 года.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className={inter.className}>
        <FaviconManager />
        <ToastProvider>
          <Header />
          <SitePopup />
          {children}
          <Footer />
          <CartDrawer />
          <BackToTop />
        </ToastProvider>
      </body>
    </html>
  );
}


