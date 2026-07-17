import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read backup file
const backupPath = '/tmp/creator-ally-flow_260717.backup';
console.log('📂 Reading PostgreSQL custom backup format...');

const buffer = fs.readFileSync(backupPath);

// Parse binary format
function parseCustomBackup(buffer) {
  const magic = buffer.toString('ascii', 0, 5);
  if (magic !== 'PGDMP') {
    throw new Error('Invalid backup format');
  }

  console.log(`✓ Valid PostgreSQL backup (version ${buffer[7]}.${buffer[8]})`);

  // Find COPY statements by searching for text patterns
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 5000000), 'utf8');
  
  // Extract data sections
  const dataMap = {};
  const tables = ['campaigns', 'influencers', 'conversations', 'messages', 'payments', 'profiles', 'favorites', 'campaign_influencers'];

  for (const table of tables) {
    // Look for COPY statements
    const copyPattern = `COPY public.${table}`;
    const copyIdx = text.indexOf(copyPattern);
    
    if (copyIdx > -1) {
      // Find column definitions
      const openParen = text.indexOf('(', copyIdx);
      const closeParen = text.indexOf(')', openParen);
      const columnDef = text.substring(openParen + 1, closeParen);
      const columns = columnDef.split(',').map(col => col.trim());

      // Find data end marker \.
      const dataStart = text.indexOf('\n', closeParen) + 1;
      const dataEnd = text.indexOf('\n\\.', dataStart);
      
      if (dataEnd > -1) {
        const dataLines = text.substring(dataStart, dataEnd).split('\n').filter(line => line && !line.startsWith('\\'));
        
        const rows = dataLines.map(line => {
          const values = line.split('\t');
          const row = {};
          columns.forEach((col, i) => {
            let value = values[i];
            if (value === '\\N') value = null;
            else if (value === 't') value = true;
            else if (value === 'f') value = false;
            else if ((col === 'services' || col === 'languages' || col === 'portfolio') && value && value.startsWith('[')) {
              try { value = JSON.parse(value); } catch (e) {}
            }
            row[col] = value;
          });
          return row;
        });

        dataMap[table] = { columns, rows };
        console.log(`✓ ${table}: ${rows.length} rows found`);
      }
    }
  }

  return dataMap;
}

async function importData() {
  try {
    const dataMap = parseCustomBackup(buffer);
    const tables = Object.keys(dataMap).filter(t => dataMap[t].rows.length > 0);

    console.log('\n📤 Importing data to Supabase...\n');
    let totalInserted = 0;

    for (const table of tables) {
      const rows = dataMap[table].rows;
      
      // Insert in batches
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase
          .from(table)
          .insert(batch);

        if (error) {
          console.error(`❌ ${table} batch error: ${error.message}`);
        } else {
          totalInserted += batch.length;
          console.log(`✓ ${table}: ${batch.length} rows inserted`);
        }
      }
    }

    console.log(`\n✅ Total: ${totalInserted} rows imported`);

    // Verify
    console.log('\n📊 Verifying data:\n');
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      console.log(`${error ? '❌' : '✓'} ${table}: ${count || 0} rows`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

importData();
