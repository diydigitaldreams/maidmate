import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zfxmztccpyrepbmchvig.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_FOpwk8eKErGMVcDxR3nJlg__-iXm0fm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
