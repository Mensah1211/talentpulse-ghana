import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('applications').select('id, applicant_id, resume_url, resume_filename');
  if (error) {
    console.error(error);
  } else {
    console.log("APPLICATIONS:");
    console.log(JSON.stringify(data, null, 2));
  }
}
check();
