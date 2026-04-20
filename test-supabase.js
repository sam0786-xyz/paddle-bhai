require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('app_state').select('state_data, updated_at').eq('id', '00000000-0000-0000-0000-000000000000').single().then(console.log).catch(console.error);
