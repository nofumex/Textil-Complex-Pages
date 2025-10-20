import { db } from './db';
import { generateSlug, generateSKU } from './utils';
import { ProductCategory, ProductVisibility } from '@/types';
import { XMLParser } from 'fast-xml-parser';

export interface WPImportOptions {
  defaultCurrency?: string;
  updateExisting?: boolean;
  skipInvalid?: boolean;
  categoryMapping?: Record<string, string>;
  autoCreateCategories?: boolean;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  warnings: string[];
}

type WXRItem = {
  title?: string;
  link?: string;
  'wp:post_id'?: string | number;
  'wp:post_name'?: string;
  'wp:post_type'?: string;
  'wp:status'?: string;
  description?: string;
  'content:encoded'?: string;
  'excerpt:encoded'?: string;
  category?: Array<{ '@_domain': string; '@_nicename': string; '#text'?: string }> | { '@_domain': string; '@_nicename': string; '#text'?: string };
  'wp:postmeta'?: Array<{ 'wp:meta_key': string; 'wp:meta_value'?: string }>|{ 'wp:meta_key': string; 'wp:meta_value'?: string };
};

export class WPXMLImporter {
  private errors: string[] = [];
  private warnings: string[] = [];
  private processed = 0;
  private created = 0;
  private updated = 0;

  async importFromXML(xmlContent: string | string[], options: WPImportOptions = {}): Promise<ImportResult> {
    this.reset();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', trimValues: false, decodeHTMLchar: true });

    const contents = Array.isArray(xmlContent) ? xmlContent : [xmlContent];
    const items: WXRItem[] = [];

    try {
      for (const content of contents) {
        const doc = parser.parse(content);
        const channel = doc?.rss?.channel;
        const rawItems: any[] = channel?.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];
        for (const it of rawItems) items.push(it as any);
      }
    } catch (e) {
      this.errors.push('Не удалось распарсить XML');
      return this.getResult();
    }

    // Build attachment map: id -> url
    const attachmentUrlById = new Map<string, string>();
    for (const it of items) {
      const postType = (it['wp:post_type'] || '').toString();
      if (postType === 'attachment') {
        const id = (it['wp:post_id'] || '').toString();
        const url = (it as any)['wp:attachment_url'] || (it as any)?.guid || '';
        const urlStr = (typeof url === 'object' && '#text' in url) ? url['#text'] : url?.toString();
        if (id && urlStr) {
          attachmentUrlById.set(id, urlStr);
        }
      }
    }

    // Preload categories map
    const categories = await db.category.findMany({ select: { id: true, name: true, slug: true } });
    const categoryMap = new Map<string, string>();
    for (const c of categories) {
      categoryMap.set(c.name.toLowerCase(), c.id);
      categoryMap.set(c.slug.toLowerCase(), c.id);
    }
    if (options.categoryMapping) {
      for (const [k, v] of Object.entries(options.categoryMapping)) {
        categoryMap.set(k.toLowerCase(), v);
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNumber = i + 1;
      try {
        if ((item['wp:post_type'] || '').toString() !== 'product') continue;
        if ((item['wp:status'] || '') !== 'publish') {
          // skip drafts
        }

        await this.processProduct(item, rowNumber, categoryMap, options, attachmentUrlById);
        this.processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
        this.errors.push(`Элемент ${rowNumber}: ${msg}`);
        if (!options.skipInvalid) break;
      }
    }

    return this.getResult();
  }

  private async processProduct(
    item: WXRItem,
    rowNumber: number,
    categoryMap: Map<string, string>,
    options: WPImportOptions,
    attachmentUrlById: Map<string, string>
  ): Promise<void> {
    const title = (item.title || '').toString().trim();
    if (!title) throw new Error('Отсутствует название товара');

    const htmlContent = (item['content:encoded'] || '').toString().trim();
    const excerpt = (item['excerpt:encoded'] || item.description || '').toString().trim();

    // Extract categories (prefer product_cat); fallback to first taxonomy present
    const cats = this.asArray(item.category).filter(c => c && typeof c === 'object');
    const productCats = cats.filter(c => c['@_domain'] === 'product_cat');
    const chosenCat = (productCats[0]?.['#text'] || cats[0]?.['#text'] || '').toString();
    if (!chosenCat) throw new Error('Не удалось определить категорию');

    let categoryId = categoryMap.get(chosenCat.toLowerCase());
    if (!categoryId) {
      if (options.autoCreateCategories !== false) {
        const categorySlug = generateSlug(chosenCat);
        try {
          const created = await db.category.create({ data: { name: chosenCat, slug: categorySlug } });
          categoryId = created.id;
          categoryMap.set(chosenCat.toLowerCase(), created.id);
          categoryMap.set(categorySlug.toLowerCase(), created.id);
          this.warnings.push(`Создана категория "${chosenCat}"`);
        } catch (e) {
          throw new Error(`Категория "${chosenCat}" не найдена и не удалось создать автоматически`);
        }
      } else {
        throw new Error(`Категория "${chosenCat}" не найдена. Создайте её заранее или укажите сопоставление.`);
      }
    }

    // Gather meta
    const metas = this.asArray(item['wp:postmeta']);
    const metaMap = new Map<string, string | undefined>();
    for (const m of metas) {
      if (!m) continue;
      metaMap.set((m['wp:meta_key'] || '').toString(), m['wp:meta_value']?.toString());
    }

    const sku = (metaMap.get('_sku') || '').toString().trim();
    const priceRaw = (metaMap.get('_price') || '').toString().trim();
    const stockStatus = (metaMap.get('_stock_status') || '').toString().trim();
    const stockRaw = (metaMap.get('_stock') || '').toString().trim();

    const price = priceRaw ? parseFloat(priceRaw.replace(',', '.')) : 0;
    if (isNaN(price) || price < 0) throw new Error('Некорректная цена');

    const stock = stockRaw ? parseInt(stockRaw, 10) : stockStatus === 'instock' ? 10 : 0;

    // Extract product attributes (colors, sizes)
    const color = this.extractAttribute(cats, 'pa_cvet');
    const size = this.extractAttribute(cats, 'pa_razmer');

    // Build images using _thumbnail_id and _product_image_gallery if attachment URLs are available
    const images: string[] = [];
    const thumbId = metaMap.get('_thumbnail_id');
    if (thumbId) {
      const u = attachmentUrlById.get(thumbId);
      if (u) images.push(u);
    }
    const galleryIds = (metaMap.get('_product_image_gallery') || '').split(',').map(s => s.trim()).filter(Boolean);
    for (const gid of galleryIds) {
      const u = attachmentUrlById.get(gid);
      if (u && !images.includes(u)) images.push(u);
    }

    let slug = decodeURIComponent((item['wp:post_name'] || '').toString());
    if (!slug) slug = generateSlug(title);

    let finalSku = sku;
    if (!finalSku) {
      const cat = await db.category.findUnique({ where: { id: categoryId } });
      finalSku = generateSKU(cat?.name || 'PRODUCT', title);
    }

    // Basic product category mapping heuristic
    let productCategory: ProductCategory = 'MIDDLE';
    const catLower = chosenCat.toLowerCase();
    if (catLower.includes('эконом')) productCategory = 'ECONOMY';
    if (catLower.includes('люкс') || catLower.includes('премиум')) productCategory = 'LUXURY';

    const visibility: ProductVisibility = 'VISIBLE';

    const data = {
      sku: finalSku,
      title,
      slug,
      description: excerpt || htmlContent.replace(/<[^>]*>/g, '').slice(0, 300),
      content: htmlContent || null,
      price,
      oldPrice: null as number | null,
      currency: options.defaultCurrency || 'RUB',
      stock,
      material: '',
      dimensions: '',
      weight: null as number | null,
      category: productCategory,
      tags: [] as string[],
      images,
      categoryId,
      visibility,
      isActive: true,
      isInStock: stock > 0,
      seoTitle: title,
      seoDesc: (excerpt || htmlContent.replace(/<[^>]*>/g, '')).slice(0, 160),
      metaTitle: title,
      metaDesc: (excerpt || htmlContent.replace(/<[^>]*>/g, '')).slice(0, 160),
    };

    const existing = await db.product.findFirst({ where: { OR: [{ sku: data.sku }, { slug: data.slug }] } });
    let product;
    
    if (existing) {
      if (options.updateExisting) {
        product = await db.product.update({ where: { id: existing.id }, data });
        this.updated++;
        this.warnings.push(`Товар "${title}" обновлён`);
      } else {
        this.warnings.push(`Товар с SKU "${data.sku}" уже существует (пропущен)`);
        return;
      }
    } else {
      product = await db.product.create({ data });
      this.created++;
    }

    // Create product variants for variable products
    const isVariable = this.asArray(item.category).some(c => 
      c && typeof c === 'object' && c['@_domain'] === 'product_type' && c['#text'] === 'variable'
    );
    
    if (isVariable) {
      await this.createAllVariants(product, item, options);
    } else if (color || size) {
      // Single variant for simple products
      const variantSku = sku || `${finalSku}-${color || 'default'}-${size || 'default'}`;
      const variantData = {
        productId: product.id,
        color: color || null,
        size: size || null,
        price: price,
        stock: stock,
        sku: variantSku,
        isActive: true,
      };

      const existingVariant = await db.productVariant.findFirst({
        where: {
          productId: product.id,
          color: color || null,
          size: size || null,
        }
      });

      if (existingVariant) {
        if (options.updateExisting) {
          await db.productVariant.update({
            where: { id: existingVariant.id },
            data: variantData
          });
          this.warnings.push(`Вариация товара "${title}" обновлена`);
        }
      } else {
        await db.productVariant.create({ data: variantData });
        this.warnings.push(`Создана вариация для товара "${title}"`);
      }
    }
  }

  private asArray<T>(v: T | T[] | undefined): T[] {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }

  private extractAttribute(categories: any[], domain: string): string | null {
    const attribute = categories.find(c => c['@_domain'] === domain);
    if (attribute && attribute['#text']) {
      return decodeURIComponent(attribute['#text'].toString().trim());
    }
    return null;
  }

  private reset(): void {
    this.errors = [];
    this.warnings = [];
    this.processed = 0;
    this.created = 0;
    this.updated = 0;
  }

  private async createAllVariants(product: any, item: WXRItem, options: WPImportOptions): Promise<void> {
    const cats = this.asArray(item.category).filter(c => c && typeof c === 'object');
    
    // Extract all colors and sizes
    const colors: string[] = [];
    const sizes: string[] = [];
    
    for (const cat of cats) {
      const domain = cat['@_domain'];
      const value = cat['#text'];
      
      if (domain === 'pa_cvet' && value) {
        colors.push(decodeURIComponent(value.toString().trim()));
      } else if (domain === 'pa_razmer' && value) {
        sizes.push(decodeURIComponent(value.toString().trim()));
      }
    }

    // Create all combinations
    const combinations: { color?: string; size?: string }[] = [];
    
    if (colors.length > 0 && sizes.length > 0) {
      // All combinations
      for (const color of colors) {
        for (const size of sizes) {
          combinations.push({ color, size });
        }
      }
    } else if (colors.length > 0) {
      // Only colors
      for (const color of colors) {
        combinations.push({ color });
      }
    } else if (sizes.length > 0) {
      // Only sizes
      for (const size of sizes) {
        combinations.push({ size });
      }
    }

    // Create variants for each combination
    for (const combination of combinations) {
      const variantSku = this.generateVariantSKU(product.sku, combination.color, combination.size);
      
      const variantData = {
        productId: product.id,
        color: combination.color || null,
        size: combination.size || null,
        price: product.price, // Use base product price for now
        stock: product.stock,
        sku: variantSku,
        isActive: true,
      };

      const existingVariant = await db.productVariant.findFirst({
        where: {
          productId: product.id,
          color: combination.color || null,
          size: combination.size || null,
        }
      });

      if (existingVariant) {
        if (options.updateExisting) {
          await db.productVariant.update({
            where: { id: existingVariant.id },
            data: variantData
          });
        }
      } else {
        await db.productVariant.create({ data: variantData });
        this.warnings.push(`Создана вариация ${combination.color || 'без цвета'} ${combination.size || 'без размера'} для "${product.title}"`);
      }
    }
  }

  private generateVariantSKU(baseSku: string, color?: string, size?: string): string {
    let variantSku = baseSku;
    if (color) variantSku += `-${color.toLowerCase().replace(/\s+/g, '-')}`;
    if (size) variantSku += `-${size.toLowerCase().replace(/\s+/g, '-')}`;
    return variantSku;
  }

  private getResult(): ImportResult {
    return {
      success: this.errors.length === 0,
      processed: this.processed,
      created: this.created,
      updated: this.updated,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}


