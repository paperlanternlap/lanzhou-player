import { supabase } from '../supabase'

export function searchTransferRecipients(characterId, query) {
  return supabase.rpc('search_item_transfer_recipients', {
    p_sender_character_id: characterId,
    p_query: query,
    p_limit: 8,
    p_offset: 0,
  })
}

export function transferCharacterItem({ senderId, recipientId, itemId, quantity }) {
  return supabase.rpc('transfer_character_item', {
    p_sender_character_id: senderId,
    p_recipient_character_id: recipientId,
    p_item_id: itemId,
    p_quantity: quantity,
  })
}
