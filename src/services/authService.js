import { supabase } from '../supabase'

export function findCharacterAccount(username) {
  return supabase
    .from('characters')
    .select('*')
    .eq('username', username.trim())
    .maybeSingle()
}
