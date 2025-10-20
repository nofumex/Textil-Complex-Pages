import { ExportService } from '../src/lib/export-service';
import * as fs from 'fs';
import * as path from 'path';

async function testExport() {
  console.log('🧪 Тестируем систему экспорта...');
  
  try {
    const exportService = new ExportService();
    
    // Тестируем экспорт в ZIP
    console.log('📦 Создаем ZIP архив...');
    const zipBuffer = await exportService.exportData('zip');
    
    // Сохраняем файл
    const outputPath = path.join(process.cwd(), 'export-test.zip');
    await fs.promises.writeFile(outputPath, zipBuffer);
    
    console.log(`✅ ZIP архив создан: ${outputPath}`);
    console.log(`📊 Размер архива: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Тестируем экспорт в JSON
    console.log('📄 Создаем JSON файл...');
    const jsonBuffer = await exportService.exportData('json');
    
    const jsonPath = path.join(process.cwd(), 'export-test.json');
    await fs.promises.writeFile(jsonPath, jsonBuffer);
    
    console.log(`✅ JSON файл создан: ${jsonPath}`);
    console.log(`📊 Размер JSON: ${(jsonBuffer.length / 1024).toFixed(2)} KB`);
    
    // Проверяем содержимое JSON
    const jsonData = JSON.parse(jsonBuffer.toString());
    console.log(`📈 Статистика экспорта:`);
    console.log(`   - Товаров: ${jsonData.products.length}`);
    console.log(`   - Категорий: ${jsonData.categories.length}`);
    console.log(`   - Медиафайлов: ${jsonData.mediaIndex.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании экспорта:', error);
  }
}

if (require.main === module) {
  testExport();
}

export default testExport;
