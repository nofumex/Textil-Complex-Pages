import { ImportService } from '../src/lib/import-service';
import * as fs from 'fs';
import * as path from 'path';

async function testImport() {
  console.log('🧪 Тестируем систему импорта...');
  
  try {
    const importService = new ImportService();
    
    // Читаем ZIP архив
    const zipPath = path.join(process.cwd(), 'export-test.zip');
    
    if (!fs.existsSync(zipPath)) {
      console.error('❌ Файл export-test.zip не найден. Сначала запустите test-export.ts');
      return;
    }
    
    console.log('📦 Читаем ZIP архив...');
    const zipBuffer = fs.readFileSync(zipPath);
    
    // Опции импорта
    const options = {
      updateExisting: true, // Обновлять существующие записи
      skipExisting: false, // Не пропускать существующие
      importMedia: true,    // Импортировать медиафайлы
    };
    
    console.log('📥 Начинаем импорт...');
    const result = await importService.importData(zipBuffer, options);
    
    console.log('\n📊 Результаты импорта:');
    console.log(`✅ Успешно: ${result.success ? 'Да' : 'Нет'}`);
    console.log(`📦 Товаров обработано: ${result.processed.products}`);
    console.log(`📂 Категорий обработано: ${result.processed.categories}`);
    console.log(`🖼️ Медиафайлов обработано: ${result.processed.media}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Ошибки:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Предупреждения:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (result.skipped.products.length > 0) {
      console.log('\n⏭️ Пропущенные товары:');
      result.skipped.products.forEach(product => console.log(`  - ${product}`));
    }
    
    if (result.skipped.categories.length > 0) {
      console.log('\n⏭️ Пропущенные категории:');
      result.skipped.categories.forEach(category => console.log(`  - ${category}`));
    }
    
    console.log('\n✅ Импорт завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании импорта:', error);
  }
}

if (require.main === module) {
  testImport();
}

export default testImport;
