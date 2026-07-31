import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'C:/Users/SAMUEL_MENSAH/Downloads/HR RECRUITMENT/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error } = await supabase.from('users').select('*').eq('email', 'mensahsamuel3803@gmail.com');
  console.log('Users:', users);
  
  if (users && users.length > 0) {
    const { data: profile } = await supabase.from('admin_profiles').select('*').eq('user_id', users[0].id);
    console.log('Admin Profile:', profile);
  }
}

run();
