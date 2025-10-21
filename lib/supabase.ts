import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface MemberActivity {
  user_id: string;
  company_id: string;
  last_active_at: string;
  status: 'active' | 'at_risk' | 're_engaged';
  created_at?: string;
  updated_at?: string;
}

