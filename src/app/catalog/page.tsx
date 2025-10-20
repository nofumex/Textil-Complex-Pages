'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductsList, useCategories } from '@/hooks/useApi';
import { debounce, getImageUrl } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbStructuredData } from '@/components/seo/structured-data';
import { generateMetadata } from '@/components/seo/meta-tags';

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [filters, setFilters] = useState({
    category: '',
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    inStock: undefined as boolean | undefined,
    productCategory: '',
    material: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: products, pagination, loading: productsLoading } = useProductsList({ ...filters, search: searchQuery, page, limit });
  const { data: categories } = useCategories(true);

  useEffect(() => {
    // Apply URL params on load
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
    if (search) {
      setSearchQuery(search);
    }
    if (pageParam) setPage(Number(pageParam) || 1);
    if (limitParam) setLimit(Number(limitParam) || 12);
  }, [searchParams]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // reset page on filter change
    const params = new URLSearchParams(searchParams.toString());
    Object.entries({ ...filters, ...newFilters, search: searchQuery, page: 1, limit }).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`/catalog?${params.toString()}`);
  };

  // Debounced search syncing to URL
  const syncSearch = React.useMemo(() => debounce((value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('search', value); else params.delete('search');
    params.set('page', '1');
    params.set('limit', String(limit));
    Object.entries(filters).forEach(([key, v]) => {
      if (v === undefined || v === null || v === '') params.delete(key); else params.set(key, String(v));
    });
    router.push(`/catalog?${params.toString()}`);
  }, 400), [searchParams, router, filters, limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    syncSearch(searchQuery);
  };

  const breadcrumbItems = [
    { name: 'Главная', url: 'https://textil-kompleks.ru/' },
    { name: 'Каталог', url: 'https://textil-kompleks.ru/catalog' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout; remove local header to avoid duplication */}
      {/* <Header /> */}
      
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Каталог постельных принадлежностей
              </h1>
              <p className="text-xl text-gray-600">
                Широкий выбор качественной продукции от ООО «Текстиль Комплекс». 
                Работаем с 2004 года, гарантируем качество и быструю доставку.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with filters */}
            <div className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  categories={categories || []}
                />
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              {/* Search and controls */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          syncSearch(e.target.value);
                        }}
                        placeholder="Поиск товаров..."
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* Controls */}
                  <div className="flex items-center space-x-4">
                    {/* Sort */}
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        handleFilterChange({ sortBy, sortOrder });
                      }}
                      className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="createdAt-desc">Новинки</option>
                      <option value="price-asc">Цена: по возрастанию</option>
                      <option value="price-desc">Цена: по убыванию</option>
                      <option value="name-asc">Название: А-Я</option>
                      <option value="rating-desc">Популярные</option>
                    </select>

                    {/* View mode */}
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Mobile filter button */}
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center space-x-2"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Фильтры</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  {productsLoading ? 'Загрузка...' : `Найдено ${pagination?.total || products?.length || 0} товаров`}
                </p>
              </div>

              {/* Products grid */}
              {productsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{ ...product, images: Array.isArray(product.images) ? product.images : [] }}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Товары не найдены
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Попробуйте изменить параметры поиска или фильтры
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      category: '',
                      priceMin: undefined,
                      priceMax: undefined,
                      inStock: undefined,
                      productCategory: '',
                      material: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                    });
                  }}>
                    Сбросить фильтры
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => {
                        const newPage = Math.max(1, page - 1);
                        setPage(newPage);
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(newPage));
                        params.set('limit', String(limit));
                        router.push(`/catalog?${params.toString()}`);
                      }}
                    >
                      Предыдущая
                    </Button>
                    {Array.from({ length: pagination.pages }).map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <Button
                          key={p}
                          variant="outline"
                          className={p === page ? 'bg-primary-600 text-white' : ''}
                          onClick={() => {
                            setPage(p);
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('page', String(p));
                            params.set('limit', String(limit));
                            router.push(`/catalog?${params.toString()}`);
                          }}
                        >
                          {p}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      disabled={page >= pagination.pages}
                      onClick={() => {
                        const newPage = Math.min(pagination.pages, page + 1);
                        setPage(newPage);
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(newPage));
                        params.set('limit', String(limit));
                        router.push(`/catalog?${params.toString()}`);
                      }}
                    >
                      Следующая
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories showcase */}
        {categories && (
          <div className="bg-white py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
                Категории товаров
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/catalog?category=${category.slug}`}
                    className="group text-center"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden group-hover:shadow-lg transition-shadow">
                      <img
                        src={(category.image && category.image.length > 0) ? category.image : (category.products?.[0]?.images?.[0] || '/category-placeholder.jpg')}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category._count?.products || 0} товаров
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer is global from RootLayout; remove local footer to avoid duplication */}
      {/* <Footer /> */}
    </div>
  );
}


