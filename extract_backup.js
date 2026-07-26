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

// استخراج DDL لجميع الجداول
console.log('=== استخراج الـ DDL ===\n');

// البحث عن CREATE TABLE
const ddlRegex = /(CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?[\w_]+ \([^;]*?\);)/gs;
const ddlMatches = [...text.matchAll(ddlRegex)];
console.log(`وجدت ${ddlMatches.length} تعريف جدول\n`);

ddlMatches.forEach((match, idx) => {
  const ddl = match[1].substring(0, 150) + (match[1].length > 150 ? '...' : '');
  console.log(`${idx + 1}. ${ddl}`);
});

// استخراج عدد الصفوف لكل جدول
console.log('\n=== عدد الصفوف ===\n');
const tables = ['campaigns', 'influencers', 'messages', 'payments', 'conversations', 'profiles', 'favorites', 'campaign_influencers'];

tables.forEach(tableName => {
  // البحث عن COPY public.tableName
  const copyRegex = new RegExp(`COPY public\\.${tableName} \\(([^)]+)\\) FROM stdin;([\\s\\S]*?)\\\\\\\\`, 'i');
  const match = text.match(copyRegex);
  
  if (match) {
    const columns = match[1];
    const data = match[2];
    const rows = data.trim().split('\n').filter(line => line.trim() && line !== '\\.');
    console.log(`${tableName}: ${rows.length} صف`);
  } else {
    console.log(`${tableName}: لم تُجد بيانات`);
  }
});

// استخراج بعض البيانات الفعلية كعينة
console.log('\n=== عينة من البيانات (campaigns) ===\n');
const campaignsRegex = /COPY public\.campaigns \(([^)]+)\) FROM stdin;([\s\S]*?)\\\./;
const campaignsMatch = text.match(campaignsRegex);
if (campaignsMatch) {
  const columns = campaignsMatch[1].split(', ');
  const dataLines = campaignsMatch[2].trim().split('\n').slice(0, 3);
  console.log('الأعمدة:', columns);
  console.log('\nأول صفين:');
  dataLines.forEach(line => {
    if (line.trim()) console.log(line.substring(0, 100) + (line.length > 100 ? '...' : ''));
  });
}
