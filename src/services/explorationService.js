import { supabase } from '../supabase'

export async function getExplorationMap(characterId) {
  if (characterId) {
    const result = await supabase.rpc('get_player_exploration_map', { p_character_id: characterId })
    if (!result.error || result.error.code !== 'PGRST202') return result
  }
  return supabase.from('exploration_locations').select('*').eq('active', true).order('sort_order')
}

export function getExplorationHistory(characterId) {
  return supabase.rpc('get_player_follower_explorations', { p_character_id: characterId })
}

export function startMapExploration({ characterId, followerId, locationId, requestId }) {
  return supabase.rpc('start_map_exploration', {
    p_character_id: characterId,
    p_follower_id: followerId || null,
    p_location_id: locationId,
    p_request_id: requestId,
  })
}

export function explorationError(error) {
  if (error?.code === 'PGRST202') return 'ระบบรับงานสำรวจยังไม่เปิดใช้งาน กรุณาติดต่อทีมงาน'
  const message = error?.message || ''
  if (message.includes('already') || message.includes('active exploration')) return 'คนที่เลือกมีภารกิจค้างอยู่ กรุณารอผลก่อน'
  if (message.includes('access')) return 'ยังไม่ได้รับสิทธิ์เข้าสำรวจพื้นที่นี้'
  if (message.includes('available') || message.includes('idle')) return 'สถานที่หรือผู้ติดตามไม่พร้อม กรุณาโหลดข้อมูลใหม่'
  return 'ส่งสำรวจไม่สำเร็จ กรุณาลองใหม่'
}
