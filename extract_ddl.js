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

// استخراج DDL الكامل
console.log('استخراج تعريفات الجداول...\n');

// البحث عن CREATE TABLE بصيغة محسنة
const lines = text.split('\n');
let inCreateTable = false;
let currentDDL = '';
const ddlStatements = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('CREATE TABLE') && line.includes('public.')) {
    inCreateTable = true;
    currentDDL = line;
  } else if (inCreateTable) {
    currentDDL += '\n' + line;
    if (line.trim().endsWith(';')) {
      ddlStatements.push(currentDDL);
      inCreateTable = false;
      currentDDL = '';
    }
  }
}

console.log(`وجدت ${ddlStatements.length} جدول\n`);

// حفظ DDL إلى ملف
const ddlFile = '/vercel/share/v0-project/tables_ddl.sql';
const ddlContent = ddlStatements.join('\n\n');
fs.writeFileSync(ddlFile, ddlContent);

console.log(`تم حفظ DDL في: ${ddlFile}`);
console.log(`\nأول 500 حرف من DDL:`);
console.log(ddlContent.substring(0, 500));
console.log('...\n');

// استخراج البيانات أيضاً
const copyStatements = [];
let inCopy = false;
let currentCopy = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('COPY public.')) {
    inCopy = true;
    currentCopy = line;
  } else if (inCopy) {
    if (line === '\\.') {
      copyStatements.push(currentCopy);
      inCopy = false;
      currentCopy = '';
    } else {
      currentCopy += '\n' + line;
    }
  }
}

console.log(`وجدت ${copyStatements.length} جداول بيانات`);
copyStatements.forEach((stmt, idx) => {
  const match = stmt.match(/COPY public\.(\w+)/);
  if (match) {
    const tableName = match[1];
    const rows = stmt.split('\n').slice(1).filter(l => l.trim()).length;
    console.log(`  ${idx + 1}. ${tableName}: ${rows} صف`);
  }
});
