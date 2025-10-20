'use client';
import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { usePublicSettings } from '@/hooks/useApi';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { data: publicSettings } = usePublicSettings();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ТК</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Текстиль Комплекс</h3>
                <p className="text-sm text-gray-400">Работаем с 2004 года</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              ООО «Текстиль Комплекс» — ваш надёжный партнёр в сфере постельных принадлежностей. 
              Большой склад, оперативная отшивка, собственный автотранспорт для быстрой доставки.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-gray-300 hover:text-white transition-colors">
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-300 hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Услуги</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services/custom" className="text-gray-300 hover:text-white transition-colors">
                  Индивидуальная отшивка
                </Link>
              </li>
              <li>
                <Link href="/services/wholesale" className="text-gray-300 hover:text-white transition-colors">
                  Оптовые поставки
                </Link>
              </li>
              <li>
                <Link href="/services/samples" className="text-gray-300 hover:text-white transition-colors">
                  Заказ образцов
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  Часто задаваемые вопросы
                </Link>
              </li>
              <li>
                <Link href="/return" className="text-gray-300 hover:text-white transition-colors">
                  Возврат и обмен
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Контакты</h4>
            <div className="space-y-3">
              <div className="text-gray-300">Адрес</div>
              <div className="text-white font-medium">{publicSettings?.address || ''}</div>
              <div className="text-gray-300">Единый номер телефона</div>
              <div className="text-white">{publicSettings?.contactPhone || ''}</div>
              <div className="text-gray-300">Единая почта</div>
              <div className="text-white">{publicSettings?.contactEmail || ''}</div>
              <div className="text-gray-300">660048, г. Красноярск, ул. Маерчака, 49Г, склад № 5Б</div>
              {(publicSettings?.extraContacts || []).length > 0 && (
                <div className="space-y-3 mt-4">
                  {publicSettings?.extraContacts?.map((group: any, idx: number) => (
                    <div key={idx}>
                      <div className="text-gray-300">{group.title}</div>
                      {(group.values || []).map((v: string, i: number) => (
                        <div key={i} className="text-white">{v}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-400">20+</div>
              <p className="text-gray-300">лет на рынке</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-400">5000+</div>
              <p className="text-gray-300">довольных клиентов</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-400">24/7</div>
              <p className="text-gray-300">поддержка клиентов</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <h4 className="text-lg font-semibold mb-4">Наш адрес на карте</h4>
          <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-800">
            <iframe
              title={"Карта — " + (publicSettings?.address || '')}
              src={"https://www.google.com/maps?q=" + encodeURIComponent(publicSettings?.address || '') + "&output=embed"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} ООО «Текстиль Комплекс». Все права защищены.
            </div>
            <div className="flex items-center">
              <a
                href="https://casadigital.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-md border border-gray-800 bg-gray-800/40 px-3 py-2 text-gray-300 hover:text-white hover:border-gray-700 hover:bg-gray-800 transition-colors"
                aria-label="Сайт разработан агентством Casa Digital"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded">
                  <img
                    src="/CasaDigitalLogo.png"
                    alt="Casa Digital"
                    className="h-6 w-6 object-contain"
                  />
                </span>
                <span className="text-sm">Сайт разработан агентством <span className="font-semibold">Casa Digital</span></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


