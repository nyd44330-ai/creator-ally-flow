import fs from 'fs';
import zlib from 'zlib';
import { createClient } from '@supabase/supabase-js';

// قراءة البيانات المستخرجة
const backupPath = '/tmp/creator-ally-flow_260717.backup';
const buffer = fs.readFileSync(backupPath);

let decompressed = buffer;
try {
  decompressed = zlib.gunzipSync(buffer);
} catch (e) {
  // non-compressed
}

const text = decompressed.toString('utf8');

// إنشاء عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ لم يتم العثور على SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('جاري استيراد البيانات إلى Supabase...\n');

// استخراج البيانات لكل جدول
const tables = ['campaigns', 'influencers', 'messages', 'payments', 'conversations', 'profiles', 'favorites', 'campaign_influencers'];

async function insertTableData(tableName) {
  try {
    // البحث عن COPY
    const copyPattern = `COPY public.${tableName}`;
    const startIdx = text.indexOf(copyPattern);
    
    if (startIdx === -1) {
      console.log(`⚠️  ${tableName}: لم تُجد بيانات`);
      return 0;
    }
    
    const endIdx = text.indexOf('\\.', startIdx);
    if (endIdx === -1) {
      console.log(`⚠️  ${tableName}: لم تُجد نهاية البيانات`);
      return 0;
    }
    
    const section = text.substring(startIdx, endIdx);
    const lines = section.split('\n');
    
    // استخراج الأعمدة والبيانات
    const headerLine = lines[0];
    const match = headerLine.match(/COPY public\.\w+ \(([^)]+)\)/);
    
    if (!match) {
      console.log(`⚠️  ${tableName}: لم يتم العثور على الأعمدة`);
      return 0;
    }
    
    const columns = match[1].split(', ');
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    // تحويل البيانات إلى JSON
    const rows = dataLines.map(line => {
      const values = line.split('\t');
      const row = {};
      
      columns.forEach((col, idx) => {
        let value = values[idx];
        
        // معالجة القيم الخاصة
        if (value === '\\N') {
          value = null;
        } else if (value === '\\' || value === '') {
          value = null;
        }
        
        row[col] = value;
      });
      
      return row;
    });
    
    if (rows.length === 0) {
      console.log(`⚠️  ${tableName}: لا توجد صفوف للإدراج`);
      return 0;
    }
    
    // إدراج البيانات في دفعات (كل 100 صف)
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from(tableName)
          .insert(batch, { ignoreDuplicates: false });
        
        if (error) {
          console.warn(`  ⚠️  خطأ في الدفعة ${Math.floor(i/batchSize)+1}: ${error.message}`);
        } else {
          inserted += batch.length;
        }
      } catch (e) {
        console.warn(`  ⚠️  خطأ في الدفعة ${Math.floor(i/batchSize)+1}: ${e.message}`);
      }
    }
    
    console.log(`✅ ${tableName}: تم إدراج ${inserted} صف من ${rows.length}`);
    return inserted;
    
  } catch (error) {
    console.error(`❌ ${tableName}: ${error.message}`);
    return 0;
  }
}

// تنفيذ الإدراج لكل الجداول
let totalInserted = 0;
for (const table of tables) {
  const count = await insertTableData(table);
  totalInserted += count;
}

console.log(`\n${'='.repeat(50)}`);
console.log(`✓ انتهى الاستيراد: تم إدراج ${totalInserted} صف في المجموع`);
console.log('='.repeat(50));
