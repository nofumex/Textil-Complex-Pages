'use client';

import React from 'react';
import Link from 'next/link';
import { useFavoritesStore } from '@/store/favorites';
import { ProductCard } from '@/components/product/product-card';

export default function FavoritesPage() {
  const { ids } = useFavoritesStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {ids.length === 0 ? (
        <p className="text-gray-600">Список избранного пуст. <Link href="/catalog" className="text-primary-600 underline">Перейти в каталог</Link></p>
      ) : (
        <FavoritesList ids={ids} />
      )}
    </div>
  );
}

function FavoritesList({ ids }: { ids: string[] }) {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        ids.forEach(id => params.append('id', id));
        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        if (json.success) setProducts(json.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [JSON.stringify(ids)]);

  if (loading) return <div>Загрузка...</div>;
  if (!products || products.length === 0) return <div>Товары не найдены</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}








