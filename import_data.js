import fs from 'fs';
import zlib from 'zlib';

const backupPath = '/tmp/creator-ally-flow_260717.backup';
const buffer = fs.readFileSync(backupPath);

let decompressed = buffer;
try {
  decompressed = zlib.gunzipSync(buffer);
} catch (e) {
  // ملف غير مضغوط
}

const text = decompressed.toString('utf8');

// استخراج البيانات من كل جدول
console.log('استخراج البيانات من ملف النسخة الاحتياطية...\n');

const tables = ['campaigns', 'influencers', 'messages', 'payments', 'conversations', 'profiles', 'favorites', 'campaign_influencers'];
const tableData = {};

tables.forEach(tableName => {
  // البحث عن COPY بصيغة مختلفة
  const copyPattern = `COPY public.${tableName}`;
  const startIdx = text.indexOf(copyPattern);
  
  if (startIdx !== -1) {
    // نهاية البيانات علامة بـ \.
    const endIdx = text.indexOf('\\.', startIdx);
    
    if (endIdx !== -1) {
      const section = text.substring(startIdx, endIdx);
      const lines = section.split('\n');
      
      // السطر الأول يحتوي على معلومات الأعمدة
      const headerLine = lines[0];
      const match = headerLine.match(/COPY public\.\w+ \(([^)]+)\)/);
      
      if (match) {
        const columns = match[1].split(', ');
        const dataLines = lines.slice(1).filter(line => line.trim());
        
        console.log(`${tableName}:`);
        console.log(`  الأعمدة (${columns.length}): ${columns.join(', ')}`);
        console.log(`  الصفوف: ${dataLines.length}`);
        
        tableData[tableName] = {
          columns,
          data: dataLines.map(line => {
            // تقسيم البيانات بناءً على الأعمدة
            return line.split('\t');
          })
        };
      }
    }
  }
});

// حفظ البيانات كـ JSON للتحليل
const importFile = '/vercel/share/v0-project/backup_data.json';
fs.writeFileSync(importFile, JSON.stringify(tableData, null, 2));

console.log(`\n✓ تم حفظ البيانات في: ${importFile}`);
console.log(`\n=== ملخص البيانات ===`);
let totalRows = 0;
Object.entries(tableData).forEach(([table, data]) => {
  totalRows += data.data.length;
});
console.log(`إجمالي الصفوف: ${totalRows}`);
