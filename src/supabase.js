// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// 1. Project URL
const supabaseUrl = 'https://xppnvkuahlrdyfvabzur.supabase.co'; 

// 2. Publishable Key 
const supabaseKey = 'sb_publishable_ui0m9IIp-8VQUfHLCb4d1w_LcwHa0Zd';

export const supabase = createClient(supabaseUrl, supabaseKey);