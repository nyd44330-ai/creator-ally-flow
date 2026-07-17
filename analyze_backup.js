import fs from 'fs';
import zlib from 'zlib';

// قراءة ملف الـ backup
const backupPath = '/tmp/creator-ally-flow_260717.backup';
const buffer = fs.readFileSync(backupPath);

// محاولة فك الضغط إذا كان مضغوطاً
let decompressed = buffer;
try {
  decompressed = zlib.gunzipSync(buffer);
  console.log('[✓] تم فك الضغط بنجاح');
} catch (e) {
  console.log('[!] الملف غير مضغوط - سيتم استخدام البيانات الخام');
}

// تحويل إلى نص
const text = decompressed.toString('utf8', 0, Math.min(decompressed.length, 500000));

// البحث عن جداول بصيغ مختلفة
console.log('\n=== البحث عن الجداول ===');
const tables = [];

// البحث عن COPY (آخر جداول البيانات)
const copyRegex = /COPY public\.(\w+) \(/g;
let match;
while ((match = copyRegex.exec(text)) !== null) {
  const tableName = match[1];
  if (!tables.includes(tableName)) {
    tables.push(tableName);
    console.log(`✓ ${tableName}`);
  }
}

// البحث عن CREATE TABLE
const createTableRegex = /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)/gi;
while ((match = createTableRegex.exec(text)) !== null) {
  const tableName = match[1].replace(/[;"]/g, '').toLowerCase();
  if (!tables.includes(tableName) && tableName.length > 0 && !['auth', 'storage', 'realtime'].includes(tableName)) {
    tables.push(tableName);
    console.log(`✓ ${tableName}`);
  }
}

console.log('\n' + '='.repeat(40));
console.log(`الجداول المكتشفة: ${tables.length}`);
tables.forEach(t => console.log(`  - ${t}`));
console.log('='.repeat(40));
console.log(`[معلومة] حجم البيانات: ${(decompressed.length / 1024).toFixed(2)} KB`);
