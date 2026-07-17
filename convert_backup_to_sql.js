import fs from 'fs';
import zlib from 'zlib';

const backupPath = '/tmp/creator-ally-flow_260717.backup';
const outputPath = '/tmp/backup_converted.sql';

console.log('📂 Reading backup file...');
const buffer = fs.readFileSync(backupPath);

console.log('📊 File size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');
console.log('📋 File signature:', buffer.slice(0, 20).toString('hex'));

// PostgreSQL custom format signature: PGDMP (hex: 50 47 44 4D 50)
const signature = buffer.slice(0, 5).toString('utf-8');
console.log('[v0] Signature:', signature);

if (signature === 'PGDMP') {
  console.log('✓ Valid PostgreSQL custom format detected');
  
  // PostgreSQL custom format has a header
  // Bytes 0-4: "PGDMP"
  // Bytes 5-8: Version
  // Bytes 9-12: Flags (compression info)
  // Bytes 13+: Compressed tar archive
  
  const flags = buffer.readUInt32BE(9);
  console.log('[v0] Flags:', flags.toString(16));
  console.log('[v0] Compression type:', (flags & 0x03));
  
  // Try different decompression strategies
  const strategies = [
    { offset: 13, name: 'offset 13' },
    { offset: 14, name: 'offset 14' },
    { offset: 15, name: 'offset 15' },
    { offset: 0, name: 'offset 0' },
  ];
  
  let success = false;
  for (const strategy of strategies) {
    try {
      const data = buffer.slice(strategy.offset);
      const decompressed = zlib.gunzipSync(data);
      
      console.log(`✓ Decompressed with ${strategy.name}`);
      console.log('📊 Size:', (decompressed.length / 1024).toFixed(2), 'KB');
      
      // Check if it's valid
      const preview = decompressed.slice(0, 200).toString('utf-8', 0, 100);
      console.log('[v0] Preview:', preview);
      
      fs.writeFileSync(outputPath, decompressed);
      console.log('\n✓ Saved to:', outputPath);
      success = true;
      break;
    } catch (e) {
      // continue
    }
  }
  
  if (!success) {
    console.error('❌ All decompression strategies failed');
    console.log('You must use pg_restore on a machine with PostgreSQL installed');
    console.log('\nOn your local machine with PostgreSQL, run:');
    console.log('pg_restore --verbose --no-owner --no-privileges --clean --if-exists \\');
    console.log('  -h db.pcjqdbmbdkmqjorrdfxj.supabase.co \\');
    console.log('  -U postgres -d postgres creator-ally-flow_260717.backup');
  }
} else {
  console.error('❌ Not a valid PostgreSQL custom format');
}
