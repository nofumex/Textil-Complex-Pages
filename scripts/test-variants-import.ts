import { WPVariantsImporter } from '../src/lib/wp-variants-import';
import fs from 'fs';
import path from 'path';

async function testImport() {
  console.log('🧪 Тестирование импорта товаров с вариациями...');
  
  try {
    // Читаем XML файл
    const xmlPath = path.join(process.cwd(), 'WordPress.2025-10-07.xml');
    
    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML файл не найден:', xmlPath);
      return;
    }

    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    
    const importer = new WPVariantsImporter();
    
    const options = {
      defaultCurrency: 'RUB',
      updateExisting: false,
      skipInvalid: true,
      autoCreateCategories: true,
      createAllVariants: true,
    };

    console.log('📥 Начинаем импорт...');
    const result = await importer.importFromXML(xmlContent, options);
    
    console.log('✅ Результаты импорта:');
    console.log(`   Обработано: ${result.processed}`);
    console.log(`   Создано: ${result.created}`);
    console.log(`   Обновлено: ${result.updated}`);
    console.log(`   Вариаций создано: ${result.variantsCreated}`);
    
    if (result.errors.length > 0) {
      console.log('❌ Ошибки:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️  Предупреждения:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('🎉 Импорт завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  }
}

testImport();
