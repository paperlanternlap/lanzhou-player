import { supabase } from '../supabase'

const TALENT_RELATION_ERRORS = ['follower_talents']
const FOLLOWER_FIELDS = `
  id, name, description, image_url, status, price, active, follower_type,
  owner_character_id,
  talents:follower_talents(id, talent_key, label, modifier_percent)
`
const FOLLOWER_FIELDS_WITHOUT_TALENTS =
  'id, name, description, image_url, status, price, active, follower_type, owner_character_id'
const rankRequirementCache = new Map()

function isMissingTalentRelation(error) {
  return error?.code === 'PGRST200' || TALENT_RELATION_ERRORS.some((text) => error?.message?.includes(text))
}

async function getFollowersByOwner(characterId) {
  let result = await supabase
    .from('follower_master')
    .select(FOLLOWER_FIELDS)
    .eq('owner_character_id', characterId)

  if (result.error && isMissingTalentRelation(result.error)) {
    result = await supabase
      .from('follower_master')
      .select(FOLLOWER_FIELDS_WITHOUT_TALENTS)
      .eq('owner_character_id', characterId)
  }
  return result
}

async function getAvailableFollowers() {
  let result = await supabase
    .from('follower_master')
    .select(FOLLOWER_FIELDS)
    .is('owner_character_id', null)
    .eq('active', true)

  if (result.error && isMissingTalentRelation(result.error)) {
    result = await supabase
      .from('follower_master')
      .select(FOLLOWER_FIELDS_WITHOUT_TALENTS)
      .is('owner_character_id', null)
      .eq('active', true)
  }
  return result
}

export function getPlayerCharacter(characterId) {
  return supabase
    .from('characters')
    .select(`
      id, character_name, avatar_url, palace, position, rp, favor,
      promotion_locked, promotion_lock_reason
    `)
    .eq('id', characterId)
    .single()
}

export async function getRankRequirement(position) {
  if (rankRequirementCache.has(position)) {
    return { data: rankRequirementCache.get(position), error: null }
  }
  const result = await supabase
    .from('rank_requirements')
    .select('next_position, favor_required, max_slots')
    .eq('current_position', position)
    .maybeSingle()
  if (!result.error) rankRequirementCache.set(position, result.data || null)
  return result
}

export async function getPlayerInventory(characterId) {
  const detailsResult = await supabase.rpc('get_character_inventory_details', {
    p_character_id: characterId,
  })
  if (!detailsResult.error) return detailsResult
  return supabase
    .from('character_inventory')
    .select('*')
    .eq('character_id', characterId)
}

export function getPlayerActivities(characterId) {
  return supabase
    .from('character_history')
    .select('id, action, value, type, created_at')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false })
    .limit(30)
}

export function getPlayerRoleSubmissions(characterId) {
  return supabase.rpc('get_player_rp_submissions', { p_character_id: characterId })
}

export async function getPlayerFollowers(characterId) {
  const [followersResult, missionsResult] = await Promise.all([
    getFollowersByOwner(characterId),
    supabase.rpc('get_player_follower_explorations', { p_character_id: characterId }),
  ])
  if (followersResult.error) return followersResult

  const activeMissions = new Map(
    (missionsResult.error ? [] : missionsResult.data || [])
      .filter((mission) => mission.status === 'exploring')
      .map((mission) => [String(mission.follower_id), mission]),
  )
  return {
    data: (followersResult.data || []).map((follower) => ({
      ...follower,
      activeMission: activeMissions.get(String(follower.id)) || null,
    })),
    error: null,
  }
}

export function getExplorationLocations() {
  return supabase
    .from('exploration_locations')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
}

export { getAvailableFollowers as getShopFollowers }

export function getItemCatalog(characterId) {
  return supabase.rpc('get_player_item_catalog', { p_character_id: characterId })
}

export async function getAcquisitionRequests(characterId) {
  const deliveryResult = await supabase.rpc('process_due_item_deliveries', {
    p_character_id: characterId,
  })
  const requestsResult = await supabase.rpc('get_player_item_acquisition_requests', {
    p_character_id: characterId,
  })
  return { deliveryResult, requestsResult }
}

export function getCharacterChoices() {
  return supabase
    .from('characters')
    .select('id, character_name')
    .order('character_name', { ascending: true })
}

export function purchaseFollower(characterId, followerId) {
  return supabase.rpc('purchase_follower', {
    p_character_id: characterId,
    p_follower_id: followerId,
  })
}

export async function exchangeFavor({ characterId, currentRp, currentFavor, rpAmount }) {
  const receivedFavor = Math.floor(rpAmount / 10)
  const result = await supabase
    .from('characters')
    .update({ rp: currentRp - rpAmount, favor: currentFavor + receivedFavor })
    .eq('id', characterId)
  if (result.error) return result

  await supabase.from('character_history').insert({
    character_id: characterId,
    action: 'แลกโปรดปราน',
    value: `-${rpAmount} RP · +${receivedFavor} โปรดปราน`,
    type: 'favor',
  })
  return { data: { receivedFavor }, error: null }
}

export function startExploration({ characterId, followerId, locationId, objective }) {
  return supabase.rpc('start_follower_exploration', {
    p_character_id: characterId,
    p_follower_id: followerId,
    p_location_id: locationId,
    p_objective: objective || null,
  })
}

export function purchaseCatalogItem(characterId, itemId) {
  return supabase.rpc('purchase_catalog_item', {
    p_character_id: characterId,
    p_item_id: itemId,
  })
}

export function submitAcquisitionRequest(characterId, itemId) {
  return supabase.rpc('submit_item_acquisition_request', {
    p_character_id: characterId,
    p_item_id: itemId,
    p_quantity: 1,
    p_player_note: null,
  })
}

export function attemptNpcPurchase(characterId, itemId) {
  return supabase.rpc('attempt_npc_item_purchase', {
    p_character_id: characterId,
    p_item_id: itemId,
    p_quantity: 1,
  })
}

export function acknowledgeAcquisition(characterId, requestId) {
  return supabase.rpc('acknowledge_player_item_acquisition_request', {
    p_character_id: characterId,
    p_request_id: requestId,
  })
}

export function createItemUseRequest(characterId, values) {
  return supabase.rpc('create_player_item_use_request', {
    p_requester_character_id: characterId,
    p_item_id: values.itemId,
    p_request_type: values.requestType,
    p_target_character_id: values.targetCharacterId,
    p_actor_name: values.actorName || null,
    p_use_channel: values.useChannel || null,
    p_desired_effect: values.desiredEffect,
    p_details: values.details || null,
    p_role_url: values.roleUrl || null,
    p_secrecy_level: values.secrecyLevel,
  })
}

export function submitRole(characterId, values) {
  return supabase.rpc('submit_player_rp', {
    p_character_id: characterId,
    p_role_url: values.roleUrl,
    p_submission_type: values.submissionType,
    p_participant_names: values.participantNames || null,
    p_player_note: values.playerNote || null,
  })
}

export function promotePlayerCharacter(characterId) {
  return supabase.rpc('promote_character_player', { p_character_id: characterId })
}
