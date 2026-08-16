import { supabase } from '../supabase'

export function findCharacterAccount(username) {
  return supabase
    .from('characters')
    .select('id')
    .eq('username', username.trim())
    .maybeSingle()
}
