import { WPVariantsImporter } from '../src/lib/wp-variants-import';
import { WPXMLImporter } from '../src/lib/wp-import';
import fs from 'fs';
import path from 'path';

// Тестовый XML контент на основе предоставленного примера
const testXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/" version="2.0">
<channel>
<title>Текстиль Комплекс</title>
<link>https://xn----itbbkjcbecjvntkbd6o.xn--p1ai</link>
<description>ТЕКСТИЛЬ ОПТОМ</description>
<item>
<title><![CDATA[ Полотенце махровое Baldric! ]]></title>
<link>https://xn----itbbkjcbecjvntkbd6o.xn--p1ai/product/%d0%bf%d0%be%d0%bb%d0%be%d1%82%d0%b5%d0%bd%d1%86%d0%b5-%d0%bc%d0%b0%d1%85%d1%80%d0%be%d0%b2%d0%be%d0%b5-baldric/</link>
<wp:post_id>1519</wp:post_id>
<wp:post_type>product</wp:post_type>
<wp:status>publish</wp:status>
<content:encoded><![CDATA[ Полотенце Baldric, ткань - махра, хлопок 100%, плотность 400гр/м2, графический бордюр ]]></content:encoded>
<category domain="pa_razmer" nicename="100x150"><![CDATA[ 100x150 ]]></category>
<category domain="pa_razmer" nicename="30x30"><![CDATA[ 30x30 ]]></category>
<category domain="pa_razmer" nicename="30x60"><![CDATA[ 30x60 ]]></category>
<category domain="pa_razmer" nicename="50x90"><![CDATA[ 50x90 ]]></category>
<category domain="pa_razmer" nicename="70x130"><![CDATA[ 70x130 ]]></category>
<category domain="product_type" nicename="variable"><![CDATA[ variable ]]></category>
<category domain="pa_cvet" nicename="%d0%b1%d0%b5%d0%bb%d1%8b%d0%b9"><![CDATA[ Белый ]]></category>
<category domain="pa_cvet" nicename="%d0%b1%d0%b8%d1%80%d1%8e%d0%b7%d0%b0"><![CDATA[ Бирюза ]]></category>
<category domain="pa_cvet" nicename="%d0%b3%d0%be%d0%bb%d1%83%d0%b1%d0%be%d0%b9"><![CDATA[ Голубой ]]></category>
<category domain="pa_cvet" nicename="%d0%bb%d0%b8%d0%bb%d0%be%d0%b2%d1%8b%d0%b9"><![CDATA[ Лиловый ]]></category>
<category domain="pa_cvet" nicename="%d0%bf%d0%b5%d1%80%d1%81%d0%b8%d0%ba"><![CDATA[ Персик ]]></category>
<category domain="product_cat" nicename="%d0%bf%d0%be%d0%bb%d0%be%d1%82%d0%b5%d0%bd%d1%86%d0%b5-%d0%bc%d0%b0%d1%85%d1%80%d0%be%d0%b2%d0%be%d0%b5-%d0%b3%d0%bb%d0%b0%d0%b4%d0%ba%d0%be%d0%ba%d1%80%d0%b0%d1%88%d0%b5%d0%bd%d0%be%d0%b5-baldric"><![CDATA[ Полотенце махровое гладкокрашеное Baldric ]]></category>
<category domain="pa_cvet" nicename="%d1%80%d0%be%d0%b7%d0%be%d0%b2%d1%8b%d0%b9"><![CDATA[ Розовый ]]></category>
<category domain="pa_cvet" nicename="%d1%81%d0%b0%d0%bb%d0%b0%d1%82%d0%be%d0%b2%d1%8b%d0%b9"><![CDATA[ Салатовый ]]></category>
<category domain="pa_cvet" nicename="%d1%81%d0%b5%d1%80%d1%8b%d0%b9"><![CDATA[ Серый ]]></category>
<category domain="pa_cvet" nicename="%d1%81%d0%b8%d0%bd%d0%b8%d0%b9"><![CDATA[ Синий ]]></category>
<category domain="pa_cvet" nicename="%d1%81%d0%b8%d1%80%d0%b5%d0%bd%d0%b5%d0%b2%d1%8b%d0%b9"><![CDATA[ Сиреневый ]]></category>
<wp:postmeta>
<wp:meta_key><![CDATA[ _sku ]]></wp:meta_key>
<wp:meta_value><![CDATA[ 772 ]]></wp:meta_value>
</wp:postmeta>
<wp:postmeta>
<wp:meta_key><![CDATA[ _price ]]></wp:meta_key>
<wp:meta_value><![CDATA[ 64 ]]></wp:meta_value>
</wp:postmeta>
<wp:postmeta>
<wp:meta_key><![CDATA[ _price ]]></wp:meta_key>
<wp:meta_value><![CDATA[ 125 ]]></wp:meta_value>
</wp:postmeta>
<wp:postmeta>
<wp:meta_key><![CDATA[ _price ]]></wp:meta_key>
<wp:meta_value><![CDATA[ 242 ]]></wp:meta_value>
</wp:postmeta>
<wp:postmeta>
<wp:meta_key><![CDATA[ _price ]]></wp:meta_key>
<wp:meta_value><![CDATA[ 477 ]]></wp:meta_value>
</wp:postmeta>
<wp:postmeta>
<wp:meta_key><![CDATA[ _price ]]></wp:meta_key>
<wp:meta_value><![CDATA[ 783 ]]></wp:meta_value>
</wp:postmeta>
<wp:postmeta>
<wp:meta_key><![CDATA[ _stock_status ]]></wp:meta_key>
<wp:meta_value><![CDATA[ instock ]]></wp:meta_value>
</wp:postmeta>
</item>
</channel>
</rss>`;

async function testImportSystem() {
  console.log('🧪 Тестирование системы импорта с вариациями...');
  
  try {
    // Тест 1: Новый импортер с вариациями
    console.log('\n📥 Тест 1: WPVariantsImporter');
    const variantsImporter = new WPVariantsImporter();
    
    const options = {
      defaultCurrency: 'RUB',
      updateExisting: false,
      skipInvalid: true,
      autoCreateCategories: true,
      createAllVariants: true,
    };

    const result1 = await variantsImporter.importFromXML(testXML, options);
    
    console.log('✅ Результаты WPVariantsImporter:');
    console.log(`   Обработано: ${result1.processed}`);
    console.log(`   Создано: ${result1.created}`);
    console.log(`   Обновлено: ${result1.updated}`);
    console.log(`   Вариаций создано: ${result1.variantsCreated}`);
    
    if (result1.errors.length > 0) {
      console.log('❌ Ошибки:');
      result1.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (result1.warnings.length > 0) {
      console.log('⚠️  Предупреждения:');
      result1.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // Тест 2: Обновленный импортер
    console.log('\n📥 Тест 2: WPXMLImporter (обновленный)');
    const xmlImporter = new WPXMLImporter();
    
    const result2 = await xmlImporter.importFromXML(testXML, options);
    
    console.log('✅ Результаты WPXMLImporter:');
    console.log(`   Обработано: ${result2.processed}`);
    console.log(`   Создано: ${result2.created}`);
    console.log(`   Обновлено: ${result2.updated}`);
    
    if (result2.errors.length > 0) {
      console.log('❌ Ошибки:');
      result2.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (result2.warnings.length > 0) {
      console.log('⚠️  Предупреждения:');
      result2.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n🎉 Тестирование завершено!');
    console.log('\n📋 Ожидаемые результаты:');
    console.log('   - Товар: Полотенце махровое Baldric');
    console.log('   - Цвета: Белый, Бирюза, Голубой, Лиловый, Персик, Розовый, Салатовый, Серый, Синий, Сиреневый (10 цветов)');
    console.log('   - Размеры: 100x150, 30x30, 30x60, 50x90, 70x130 (5 размеров)');
    console.log('   - Всего вариаций: 10 × 5 = 50 комбинаций');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  }
}

testImportSystem();
