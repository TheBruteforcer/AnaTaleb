
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://agdsknipgojzhzzazyfk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UfBwjswgQEi1C5AT8u50Qw_7m3S9s9L';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase credentials missing! Check lib/supabase.ts");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
