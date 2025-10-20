import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout */}
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">О компании</h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              ООО «Текстиль Комплекс» более 10 лет является официальным дистрибутором Фабрики по производству
              махровых и вафельных изделий «Донецкая Мануфактура» на территории Красноярского края
            </p>
            <p>
              Фабрика «Донецкая Мануфактура» – крупнейший высокотехнологичный производственный комплекс в России.
              Она оснащена новейшей техникой ведущих европейских компаний
            </p>
            <p>
              Высокое качество изделий «ДМ Текстиль» подтверждено сертификатами на соответствие Техническим регламентам
              Таможенного союза ТРТС 017/2011 «О безопасности продукции легкой промышленности» и ТРТС 007/2011 «О безопасности
              продукции, предназначенной для детей и подростков», а также авторитетным международным Сертификатом соответствия
              международному стандарту ISO 9001:2008.
            </p>
            <p>
              Продукция фабрики «Донецкая Мануфактура» – это махровые, вафельные, гладкотканые и рельефные текстильные изделия
              мирового уровня. В ассортимент компании входят халаты, полотенца, коврики для ванной, продукция для детей,
              столовое и постельное белье, интерьерные пледы.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">Преимущества «ДМ Текстиль»</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Мягкость, легкость и пушистость, дополнительная обработка «АЭРО»</li>
              <li>Эстетичный внешний вид (идеальные швы, четкий рисунок)</li>
              <li>Прекрасная впитываемость и воздухопроницаемость</li>
              <li>Простота в уходе</li>
              <li>Долгий срок службы</li>
              <li>Сохранение формы, цвета и мягкости даже после большого количества стирок</li>
              <li>Противоусадочная обработка всех изделий</li>
            </ul>

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border">
              <p className="mb-4">
                На нашем складе Вы можете приобрести продукцию «ДМ Текстиль». Чтобы посмотреть каталог 2024–2025,
                нажмите на кнопку ниже:
              </p>
              <a
                href="https://drive.google.com/drive/folders/1xkSlPnJg_3nHcGZzTG8-HFveKZAxXdQi?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Открыть каталог 2024–2025
              </a>
            </div>
          </div>
        </div>
      </main>
      {/* Footer is global from RootLayout */}
    </div>
  );
}


