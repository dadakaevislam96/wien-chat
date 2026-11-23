import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ibksrqtymjcfblqmdlch.supabase.co";
const supabaseAnonKey = "sb_publishable_1jFSwGkdIJ-u_IUfwi5msw_ukMd4VlW";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);