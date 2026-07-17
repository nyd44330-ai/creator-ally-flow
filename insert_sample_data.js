import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '***' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data
const sampleInfluencers = [
  {
    id: 'inf_001',
    name: 'أحمد محمود',
    category: 'تقنية',
    image: 'https://api.placeholder.com/200?text=Ahmed',
    rating: 4.8,
    reviews: 125,
    verified: true,
    featured: true,
    instagram: '@ahmedtech',
    instagram_url: 'https://instagram.com/ahmedtech',
    tiktok: '@ahmedtech',
    tiktok_url: 'https://tiktok.com/@ahmedtech',
    price_min: 500,
    price_max: 2000,
    bio: 'مؤثر تقنة متخصص في البرامج والتطبيقات',
    location: 'الرياض',
    languages: JSON.stringify(['ar', 'en']),
    services: JSON.stringify(['sponsorship', 'product_review', 'content_creation']),
  },
  {
    id: 'inf_002',
    name: 'ليلى علي',
    category: 'الجمال',
    image: 'https://api.placeholder.com/200?text=Layla',
    rating: 4.9,
    reviews: 89,
    verified: true,
    featured: true,
    instagram: '@laylabeauty',
    instagram_url: 'https://instagram.com/laylabeauty',
    price_min: 800,
    price_max: 3000,
    bio: 'خبيرة الجمال والعناية بالبشرة',
    location: 'جدة',
    languages: JSON.stringify(['ar', 'en']),
    services: JSON.stringify(['sponsorship', 'makeup_tutorial', 'brand_ambassador']),
  },
  {
    id: 'inf_003',
    name: 'محمد سارة',
    category: 'الطعام',
    image: 'https://api.placeholder.com/200?text=Mohammed',
    rating: 4.7,
    reviews: 156,
    verified: true,
    featured: false,
    instagram: '@chef_mohamad',
    instagram_url: 'https://instagram.com/chef_mohamad',
    youtube: 'Chef Mohamad',
    youtube_url: 'https://youtube.com/@chefmohamad',
    price_min: 600,
    price_max: 2500,
    bio: 'طاهي ومؤثر في مجال الطعام والوصفات',
    location: 'الدمام',
    languages: JSON.stringify(['ar', 'en']),
    services: JSON.stringify(['sponsorship', 'recipe_content', 'restaurant_promotion']),
  },
];

async function insertSampleData() {
  try {
    console.log('📊 Inserting sample data to Supabase...\n');

    // Insert influencers
    console.log('📍 Inserting influencers...');
    const { data: influencersData, error: influencersError } = await supabase
      .from('influencers')
      .insert(sampleInfluencers);

    if (influencersError) {
      console.error('❌ Error inserting influencers:', influencersError.message);
    } else {
      console.log('✓ Inserted', sampleInfluencers.length, 'influencers');
    }

    // Verify counts
    console.log('\n📊 Final record counts:\n');
    
    const tables = ['campaigns', 'influencers', 'conversations', 'messages', 'payments', 'profiles', 'favorites', 'campaign_influencers'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`✓ ${table}: ${count || 0} records`);
      }
    }

    console.log('\n✅ Sample data insertion complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Upload actual backup using pg_restore on your machine');
    console.log('2. Run: pg_restore --no-owner --no-privileges --clean --if-exists -h db.pcjqdbmbdkmqjorrdfxj.supabase.co -U postgres -d postgres creator-ally-flow_260717.backup');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

insertSampleData();
