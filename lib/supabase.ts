
import { createClient } from '@supabase/supabase-js';

// البيانات الحقيقية لمشروعك
const SUPABASE_URL = 'https://agdsknipgojzhzzazyfk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UfBwjswgQEi1C5AT8u50Qw_7m3S9s9L';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
