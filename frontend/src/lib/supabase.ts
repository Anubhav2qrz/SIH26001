import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://zjrmogckkigdonifsfqg.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_Zl5aorSOQsYDGzZH4Q_1yg_4o8vqz6F";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder")
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

