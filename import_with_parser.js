import { parsePgDump } from 'pg-dump-parser';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const backupPath = '/tmp/creator-ally-flow_260717.backup';

console.log('📂 Parsing PostgreSQL backup...');

const backup = fs.readFileSync(backupPath);

const data = parsePgDump(backup);

async function importData() {
  try {
    console.log('✓ Backup parsed successfully');
    
    // Extract table data
    const tables = ['campaigns', 'influencers', 'conversations', 'messages', 'payments', 'profiles', 'favorites', 'campaign_influencers'];
    let totalInserted = 0;

    console.log('\n📤 Importing data to Supabase...\n');
    console.log('[v0] Data structure keys:', Object.keys(data).slice(0, 20));

    for (const table of tables) {
      if (!data[table] || !Array.isArray(data[table])) {
        console.log(`⏭ ${table}: No data found`);
        continue;
      }

      const rows = data[table];
      console.log(`📍 ${table}: ${rows.length} rows to insert`);

      // Insert in batches
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase
          .from(table)
          .insert(batch);

        if (error) {
          console.error(`  ❌ Batch ${i}-${i + batch.length}: ${error.message}`);
        } else {
          totalInserted += batch.length;
          process.stdout.write(`  ✓ ${batch.length} rows\n`);
        }
      }
    }

    console.log(`\n✅ Total inserted: ${totalInserted} rows`);

    // Verify counts
    console.log('\n📊 Final verification:\n');
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
