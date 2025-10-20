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
  createAllVariants?: boolean;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  variantsCreated: number;
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
  'wp:post_parent'?: string | number;
  description?: string;
  'content:encoded'?: string;
  'excerpt:encoded'?: string;
  category?: Array<{ '@_domain': string; '@_nicename': string; '#text'?: string }> | { '@_domain': string; '@_nicename': string; '#text'?: string };
  'wp:postmeta'?: Array<{ 'wp:meta_key': string; 'wp:meta_value'?: string }>|{ 'wp:meta_key': string; 'wp:meta_value'?: string };
  'wp:attachment_url'?: string;
  guid?: string;
};

interface ProductAttributes {
  colors: string[];
  sizes: string[];
  isVariable: boolean;
}

interface VariantData {
  color?: string;
  size?: string;
  price: number;
  sku: string;
  imageUrl?: string;
  stock: number;
}

export class WPVariantsImporterV3 {
  private errors: string[] = [];
  private warnings: string[] = [];
  private processed = 0;
  private created = 0;
  private updated = 0;
  private variantsCreated = 0;
  private attachmentUrlById = new Map<string, string>();

  async importFromXML(xmlContent: string | string[], options: WPImportOptions = {}): Promise<ImportResult> {
    this.reset();

    const parser = new XMLParser({ 
      ignoreAttributes: false, 
      attributeNamePrefix: '@_', 
      textNodeName: '#text', 
      trimValues: false, 
      decodeHTMLchar: true 
    });

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
    this.buildAttachmentMap(items);

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

    // Process products
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNumber = i + 1;
      try {
        if ((item['wp:post_type'] || '').toString() !== 'product') continue;
        if ((item['wp:status'] || '') !== 'publish') {
          continue; // skip drafts
        }

        await this.processProduct(item, rowNumber, categoryMap, options);
        this.processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
        this.errors.push(`Элемент ${rowNumber}: ${msg}`);
        if (!options.skipInvalid) break;
      }
    }

    return this.getResult();
  }

  private buildAttachmentMap(items: WXRItem[]): void {
    for (const item of items) {
      const postType = (item['wp:post_type'] || '').toString();
      if (postType === 'attachment') {
        const id = (item['wp:post_id'] || '').toString();
        const url = item['wp:attachment_url'] || item.guid || '';
        const urlStr = (typeof url === 'object' && '#text' in url) ? url['#text'] : url?.toString();
        if (id && urlStr) {
          this.attachmentUrlById.set(id, urlStr);
        }
      }
    }
  }

  private async processProduct(
    item: WXRItem,
    rowNumber: number,
    categoryMap: Map<string, string>,
    options: WPImportOptions
  ): Promise<void> {
    const title = (item.title || '').toString().trim();
    if (!title) throw new Error('Отсутствует название товара');

    const htmlContent = (item['content:encoded'] || '').toString().trim();
    const excerpt = (item['excerpt:encoded'] || item.description || '').toString().trim();

    // Extract categories
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
    const stockStatus = (metaMap.get('_stock_status') || '').toString().trim();
    const stockRaw = (metaMap.get('_stock') || '').toString().trim();

    // Extract product attributes
    const attributes = this.extractProductAttributes(cats);
    
    const stock = stockRaw ? parseInt(stockRaw, 10) : stockStatus === 'instock' ? 10 : 0;

    // Build images
    const images: string[] = [];
    const thumbId = metaMap.get('_thumbnail_id');
    if (thumbId) {
      const u = this.attachmentUrlById.get(thumbId);
      if (u) images.push(u);
    }
    const galleryIds = (metaMap.get('_product_image_gallery') || '').split(',').map(s => s.trim()).filter(Boolean);
    for (const gid of galleryIds) {
      const u = this.attachmentUrlById.get(gid);
      if (u && !images.includes(u)) images.push(u);
    }

    let slug = decodeURIComponent((item['wp:post_name'] || '').toString());
    if (!slug) slug = generateSlug(title);

    let finalSku = sku;
    if (!finalSku) {
      const cat = await db.category.findUnique({ where: { id: categoryId } });
      finalSku = generateSKU(cat?.name || 'PRODUCT', title);
    }

    // Basic product category mapping
    let productCategory: ProductCategory = 'MIDDLE';
    const catLower = chosenCat.toLowerCase();
    if (catLower.includes('эконом')) productCategory = 'ECONOMY';
    if (catLower.includes('люкс') || catLower.includes('премиум')) productCategory = 'LUXURY';

    const visibility: ProductVisibility = 'VISIBLE';

    // Calculate base price (minimum price from variants or first price)
    const basePrice = this.calculateBasePrice(attributes);

    const data = {
      sku: finalSku,
      title,
      slug,
      description: excerpt || htmlContent.replace(/<[^>]*>/g, '').slice(0, 300),
      content: htmlContent || null,
      price: basePrice,
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

    // Create variants
    if (attributes.isVariable && (attributes.colors.length > 0 || attributes.sizes.length > 0)) {
      await this.createProductVariants(product, attributes, images, options);
    }
  }

  private extractProductAttributes(categories: any[]): ProductAttributes {
    const colors: string[] = [];
    const sizes: string[] = [];
    let isVariable = false;

    // Extract from categories
    for (const cat of categories) {
      if (!cat || typeof cat !== 'object') continue;
      
      const domain = cat['@_domain'];
      const value = cat['#text'];
      
      if (domain === 'pa_cvet' && value) {
        const color = decodeURIComponent(value.toString().trim());
        // Filter out non-color values
        if (!this.isNonColorValue(color)) {
          colors.push(color);
        }
      } else if (domain === 'pa_razmer' && value) {
        sizes.push(decodeURIComponent(value.toString().trim()));
      } else if (domain === 'product_type' && value === 'variable') {
        isVariable = true;
      }
    }

    return { colors, sizes, isVariable };
  }

  private isNonColorValue(value: string): boolean {
    const nonColorKeywords = [
      'пестротканное', 'пестротканые', 'гладкокрашеное', 'гладкокрашеные',
      'махра', 'хлопок', 'ткань', 'материал'
    ];
    return nonColorKeywords.some(keyword => 
      value.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private calculateBasePrice(attributes: ProductAttributes): number {
    // Calculate base price based on product type and smallest size
    // Base price is for the smallest size (30x30)
    
    // Check if it's a blanket/throw (large sizes)
    const hasLargeSizes = attributes.sizes.some(size => {
      const normalizedSize = size.toLowerCase().trim();
      return normalizedSize.includes('180x200') || normalizedSize.includes('200x230');
    });
    
    if (hasLargeSizes) {
      // For blankets/throws - base price for smallest size
      return 200; // Base price for smallest blanket size
    } else {
      // For towels - base price for smallest size (30x30)
      return 50; // Base price for smallest towel size
    }
  }

  private async createProductVariants(
    product: any,
    attributes: ProductAttributes,
    images: string[],
    options: WPImportOptions
  ): Promise<void> {
    const { colors, sizes } = attributes;
    
    // If no colors or sizes, create a default variant
    if (colors.length === 0 && sizes.length === 0) {
      const variantSku = `${product.sku}-default`;
      const variantData = {
        productId: product.id,
        color: null,
        size: null,
        price: product.price,
        stock: product.stock,
        sku: variantSku,
        imageUrl: images[0] || null,
        isActive: true,
      };

      const existingVariant = await db.productVariant.findFirst({
        where: { productId: product.id, color: null, size: null }
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
        this.variantsCreated++;
      }
      return;
    }

    // Create all combinations of colors and sizes
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
      const variantPrice = this.calculateVariantPrice(product.price, combination);
      const variantImage = this.findVariantImage(images, combination);
      
      const variantData = {
        productId: product.id,
        color: combination.color || null,
        size: combination.size || null,
        price: variantPrice,
        stock: product.stock,
        sku: variantSku,
        imageUrl: variantImage,
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
          this.warnings.push(`Вариация товара "${product.title}" обновлена`);
        }
      } else {
        await db.productVariant.create({ data: variantData });
        this.variantsCreated++;
      }
    }
  }

  private generateVariantSKU(baseSku: string, color?: string, size?: string): string {
    let variantSku = baseSku;
    if (color) {
      const colorCode = this.getColorCode(color);
      variantSku += `-${colorCode}`;
    }
    if (size) {
      variantSku += `-${size.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return variantSku;
  }

  private getColorCode(color: string): string {
    const colorMap: Record<string, string> = {
      'белый': 'W',
      'синий': 'B',
      'красный': 'R',
      'зеленый': 'G',
      'желтый': 'Y',
      'черный': 'K',
      'серый': 'GR',
      'розовый': 'P',
      'голубой': 'LB',
      'лиловый': 'LV',
      'персик': 'PE',
      'салатовый': 'LG',
      'сиреневый': 'SR',
      'бирюза': 'TQ'
    };
    
    return colorMap[color.toLowerCase()] || color.substring(0, 2).toUpperCase();
  }

  private calculateVariantPrice(basePrice: number, combination: { color?: string; size?: string }): number {
    // Calculate price based on size - larger sizes should cost more
    let price = basePrice;
    
    if (combination.size) {
      // Calculate price based on size multiplier
      const sizeMultiplier = this.getSizeMultiplier(combination.size);
      price = basePrice * sizeMultiplier;
    }
    
    return Math.round(price);
  }

  private getSizeMultiplier(size: string): number {
    // Size-based pricing logic - calculate based on area
    const sizeMap: Record<string, number> = {
      // Small towels - base prices
      '30x30': 1.0,    // 900 cm² (base size)
      '30x60': 2.0,    // 1800 cm²
      '30x70': 2.3,    // 2100 cm²
      '50x90': 5.0,    // 4500 cm²
      '50x100': 5.6,   // 5000 cm²
      
      // Medium towels
      '70x130': 10.1,  // 9100 cm²
      '70x140': 10.9,  // 9800 cm²
      '100x150': 16.7, // 15000 cm²
      '100х150': 16.7, // 15000 cm² (with cyrillic х)
      
      // Large blankets/throws
      '180x200': 40.0, // 36000 cm²
      '200x230': 51.1, // 46000 cm²
      
      // Handle variations with cyrillic characters
      '50х90': 5.0,    // 4500 cm² (with cyrillic х)
      '70х130': 10.1,  // 9100 cm² (with cyrillic х)
      '70х140': 10.9,  // 9800 cm² (with cyrillic х)
    };
    
    // If size not found, try to calculate based on dimensions
    const normalizedSize = size.toLowerCase().trim();
    if (!sizeMap[normalizedSize]) {
      // Try to parse dimensions and calculate area-based multiplier
      const dimensions = normalizedSize.match(/(\d+)x?х?(\d+)/);
      if (dimensions) {
        const width = parseInt(dimensions[1]);
        const height = parseInt(dimensions[2]);
        const area = width * height;
        
        // Calculate multiplier based on area (base area is 900 cm² for 30x30)
        const baseArea = 900;
        const multiplier = Math.max(1.0, area / baseArea);
        return Math.round(multiplier * 10) / 10; // Round to 1 decimal place
      }
    }
    
    return sizeMap[normalizedSize] || 1.0;
  }

  private findVariantImage(images: string[], combination: { color?: string; size?: string }): string | null {
    if (!images || images.length === 0) return null;
    
    // Try to find image that matches the color
    if (combination.color) {
      const colorLower = combination.color.toLowerCase();
      for (const image of images) {
        if (image.toLowerCase().includes(colorLower)) {
          return image;
        }
      }
    }
    
    // Return first image if no color match found
    return images[0] || null;
  }

  private asArray<T>(v: T | T[] | undefined): T[] {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }

  private reset(): void {
    this.errors = [];
    this.warnings = [];
    this.processed = 0;
    this.created = 0;
    this.updated = 0;
    this.variantsCreated = 0;
    this.attachmentUrlById.clear();
  }

  private getResult(): ImportResult {
    return {
      success: this.errors.length === 0,
      processed: this.processed,
      created: this.created,
      updated: this.updated,
      variantsCreated: this.variantsCreated,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}
