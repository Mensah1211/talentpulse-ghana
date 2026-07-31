import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testUpload() {
  console.log('Testing upload to Supabase storage...');
  
  // Create dummy file
  fs.writeFileSync('test-cv.txt', 'This is a test CV.');
  const fileBuffer = fs.readFileSync('test-cv.txt');

  const { data, error } = await supabase.storage.from('uploads').upload('test-cv.txt', fileBuffer, { upsert: true });
  
  if (error) {
    console.error('Upload Error:', error.message);
    return;
  }
  
  console.log('Upload Success:', data);
  
  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl('test-cv.txt');
  console.log('Public URL:', publicUrlData.publicUrl);
  
  // Try to fetch it
  const res = await fetch(publicUrlData.publicUrl);
  console.log('Fetch Status:', res.status);
  const text = await res.text();
  console.log('Fetch Body:', text);
}

testUpload();
