'use client';
import React from 'react';
import { usePublicSettings } from '@/hooks/useApi';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function ContactsPage() {
  const { data: publicSettings } = usePublicSettings();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout */}
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Контакты и реквизиты</h1>

          <div className="prose prose-lg max-w-none text-gray-800">
            <p><strong>Обращаем ваше внимание:</strong> мы работаем только с оптовыми покупателями!</p>
            <p>Убедительно просим вас обратить внимание на <a href="/delivery" className="text-primary-600 hover:underline">Условия сотрудничества</a>.</p>

            <h2>Наши магазины</h2>
            <ul>
              {(publicSettings?.socialLinks || []).map((s: any, i: number) => (
                <li key={i}>
                  {s.label} — <a href={(s.url || '').startsWith('http') ? s.url : `https://${s.url}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{s.url}</a>
                </li>
              ))}
            </ul>

            <p><strong>Единый номер телефона:</strong> {publicSettings?.contactPhone || ''}</p>
            <p><strong>Единый адрес электронной почты:</strong> {publicSettings?.contactEmail || ''}</p>
            <p><strong>Адрес:</strong> {publicSettings?.address || ''}</p>

            <h3>Отдел продаж и склад в г. Красноярске</h3>
            <ul>
              {(publicSettings?.extraContacts || []).map((group: any, idx: number) => (
                <li key={idx}>
                  {group.title}: {Array.isArray(group.values) ? group.values.join(', ') : ''}
                </li>
              ))}
            </ul>

            <h2>ООО «Текстиль Комплекс»</h2>
            <p><strong>Адрес фактический и юридический:</strong> 660048, г. Красноярск, ул. Маерчака, 49Г, склад № 2</p>
            <p><strong>А/Я:</strong> 27165</p>
            <p><strong>Телефон:</strong> 8 (391) 278-46-72, 278-04-60</p>
            <p><strong>ИНН:</strong> 2465086283 &nbsp; <strong>КПП:</strong> 246001001</p>
            <p><strong>ОГРН:</strong> 1042402661047</p>
            <p>15 октября 2020 г. Инспекция ФНС по Железнодорожному району г. Красноярска</p>
            <p><strong>ОКПО:</strong> 74875317 &nbsp; <strong>ОКВЭД:</strong> 46.41 &nbsp; <strong>ОКОПФ:</strong> 65 &nbsp; <strong>ОКАТО:</strong> 04401374000 &nbsp; <strong>ОКТМО:</strong> 04701000</p>

            <h3>Юридический адрес</h3>
            <p>Россия, 660048, г. Красноярск, ул. Маерчака, д. 49Г, склад 2</p>
            <p>Email: Za-bol@yandex.ru</p>

            <h3>Фактический адрес</h3>
            <p>Россия, 660048, г. Красноярск, ул. Маерчака, д. 49Г, склад 2</p>

            <h3>Почтовый адрес</h3>
            <p>Россия, 660048, г. Красноярск, А/Я 27165</p>
            <p>Телефон: 8 (391) 278-04-60</p>

            <h3>Банковские реквизиты</h3>
            <p><strong>Филиал «Новосибирский» АО «АЛЬФА-БАНК»</strong>, г. Новосибирск</p>
            <p><strong>Р/с:</strong> 40702810123300002643 &nbsp; <strong>К/с:</strong> 30101810600000000774 &nbsp; <strong>БИК:</strong> 045004774</p>

            <h2>ООО «Текстиль Комплекс»</h2>
            <p><strong>Факт. адрес:</strong> 660048, г. Красноярск, ул. Маерчака, 49Г, склад № 4, помещение № 2</p>
            <p><strong>Телефон:</strong> 8 (391) 278-46-72, 278-04-60</p>
            <p><strong>ИНН:</strong> 2460114770 &nbsp; <strong>КПП:</strong> 246001001</p>

            <h3>Регистрационные данные</h3>
            <p><strong>ОГРН:</strong> 1192468035726</p>
            <p>22 октября 2019 г. Инспекция ФНС по Железнодорожному району г. Красноярска</p>

            <h3>Юридический адрес</h3>
            <p>Россия, 660048, г. Красноярск, ул. Маерчака, 49г, стр. 4, помещение 2</p>
            <p>Email: Za-bol@yandex.ru</p>

            <h3>Банковские реквизиты</h3>
            <p><strong>Филиал «Новосибирский» АО «АЛЬФА-БАНК»</strong>, г. Новосибирск</p>
            <p><strong>Р/с:</strong> 40702810023300005685 &nbsp; <strong>К/с:</strong> 30101810600000000774 &nbsp; <strong>БИК:</strong> 045004774</p>
          </div>
        </div>
      </main>
      {/* Footer is global from RootLayout */}
    </div>
  );
}


