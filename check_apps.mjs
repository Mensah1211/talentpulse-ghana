import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/SAMUEL_MENSAH/Downloads/HR RECRUITMENT/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkApps() {
  const { data: apps, error } = await supabase.from('applications').select('*');
  if (error) {
    console.error('Error fetching applications:', error);
  } else {
    console.log('Applications:', apps);
  }
}

checkApps();
