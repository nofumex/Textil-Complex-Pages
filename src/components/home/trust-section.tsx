import React from 'react';
import { Shield, Award, Users, Truck, Clock, CheckCircle } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const features = [
    {
      icon: Award,
      title: 'Опыт с 2004 года',
      description: 'Более 20 лет успешной работы в сфере текстильной продукции',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: CheckCircle,
      title: 'Большой склад',
      description: 'Всегда в наличии широкий ассортимент постельных принадлежностей',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Truck,
      title: 'Собственный автотранспорт',
      description: 'Быстрая доставка по Москве и области собственным транспортом',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      title: 'Оперативная отшивка',
      description: 'Индивидуальные заказы выполняем в кратчайшие сроки',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Shield,
      title: 'Гарантия качества',
      description: 'Все товары проходят строгий контроль качества',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Users,
      title: 'Довольные клиенты',
      description: 'Более 5000 постоянных клиентов доверяют нам',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ООО «Текстиль Комплекс» — надёжный партнёр для вашего бизнеса. 
            Мы предлагаем качественную продукцию и безупречный сервис.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 card-hover"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">20+</div>
              <div className="text-gray-600">лет на рынке</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">5000+</div>
              <div className="text-gray-600">товаров в наличии</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">99%</div>
              <div className="text-gray-600">довольных клиентов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">24ч</div>
              <div className="text-gray-600">быстрая отгрузка</div>
            </div>
          </div>
        </div>

        {/* Testimonial removed by request */}
      </div>
    </section>
  );
};


