import fs from 'fs';
import zlib from 'zlib';
import { createClient } from '@supabase/supabase-js';

// Get environment variables from .env.project
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read and decompress backup file
const backupPath = '/tmp/creator-ally-flow_260717.backup';
console.log('📂 Reading backup file...');

let backupText = '';
try {
  const buffer = fs.readFileSync(backupPath);
  const decompressed = zlib.gunzipSync(buffer);
  backupText = decompressed.toString('utf8');
  console.log(`✓ File decompressed: ${(decompressed.length / 1024).toFixed(2)} KB`);
} catch (err) {
  console.error('❌ Error decompressing:', err.message);
  process.exit(1);
}

// Extract data sections
const dataMap = {};
const tables = ['campaigns', 'influencers', 'conversations', 'messages', 'payments', 'profiles', 'favorites', 'campaign_influencers'];

for (const table of tables) {
  const regex = new RegExp(`COPY public\\.${table} \\((.*?)\\) FROM stdin;([\\s\\S]*?)\n\\\\.`, 'i');
  const match = backupText.match(regex);
  
  if (match) {
    const columns = match[1].split(',').map(col => col.trim());
    const dataLines = match[2].trim().split('\n').filter(line => line && !line.startsWith('\\'));
    
    dataMap[table] = {
      columns,
      rows: dataLines.map(line => {
        const values = line.split('\t');
        const row = {};
        columns.forEach((col, i) => {
          let value = values[i];
          // Handle NULL
          if (value === '\\N') value = null;
          // Parse JSON
          else if ((col === 'services' || col === 'languages' || col === 'portfolio') && value && value.startsWith('[')) {
            value = JSON.parse(value);
          }
          // Parse boolean
          else if (value === 't') value = true;
          else if (value === 'f') value = false;
          row[col] = value;
        });
        return row;
      })
    };
    
    console.log(`✓ ${table}: ${dataMap[table].rows.length} rows`);
  } else {
    console.log(`⚠ ${table}: No data found`);
  }
}

// Import data to Supabase
async function importData() {
  console.log('\n📤 Importing data to Supabase...\n');
  
  let totalInserted = 0;
  
  for (const table of tables) {
    if (!dataMap[table] || dataMap[table].rows.length === 0) {
      console.log(`⏭ ${table}: Skipped (no data)`);
      continue;
    }
    
    const rows = dataMap[table].rows;
    
    // Insert in batches of 100
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase
        .from(table)
        .insert(batch);
      
      if (error) {
        console.error(`❌ ${table} batch ${i}-${i + batch.length}: ${error.message}`);
      } else {
        console.log(`✓ ${table}: inserted ${batch.length} rows (${i + batch.length}/${rows.length})`);
        totalInserted += batch.length;
      }
    }
  }
  
  console.log(`\n✅ Total inserted: ${totalInserted} rows`);
  
  // Verify counts
  console.log('\n📊 Verifying data:\n');
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    } else {
      console.log(`✓ ${table}: ${count} rows`);
    }
  }
}

importData().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
