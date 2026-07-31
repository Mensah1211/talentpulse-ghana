import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'C:/Users/SAMUEL_MENSAH/Downloads/HR RECRUITMENT/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error } = await supabase.from('users').select('*');
  console.log('All Users:', users);
  
  const { data: adminProfiles } = await supabase.from('admin_profiles').select('*');
  console.log('Admin Profiles:', adminProfiles);
}

run();
