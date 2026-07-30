import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ActivityCard from './components/ActivityCard'
import FollowerCard from './components/FollowerCard'
import FollowerMissionModal from './components/FollowerMissionModal'
import InventoryCard from './components/InventoryCard'
import ItemDetailModal from './components/ItemDetailModal'
import PointCard from './components/PointCard'
import ProfileCard from './components/ProfileCard'
import PromotionCard from './components/PromotionCard'
import ShopPanel from './components/ShopPlanel'
import { useAuth } from './hooks/useAuth'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import { supabase } from './supabase'

function formatNumber(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

function App() {
  const { characterId, logout } = useAuth()
  const [showShop, setShowShop] = useState(false)
  const [showFavorExchange, setShowFavorExchange] = useState(false)
  const [favorAmount, setFavorAmount] = useState(100)
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [activities, setActivities] = useState([])
  const [followers, setFollowers] = useState([])
  const [explorationLocations, setExplorationLocations] = useState([])
  const [shopFollowers, setShopFollowers] = useState([])
  const [shopItems, setShopItems] = useState([])
  const [characterChoices, setCharacterChoices] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [missionFollower, setMissionFollower] = useState(null)

  const loadCharacter = useCallback(async () => {
    if (!characterId) return
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single()
    if (error) {
      console.error(error)
      return
    }

    const { data: promotionData } = await supabase
      .from('rank_requirements')
      .select('*')
      .eq('current_position', data.position)
      .maybeSingle()

    setCharacter({
      ...data,
      next_position: promotionData?.next_position ?? null,
      favor_required: promotionData?.favor_required ?? null,
      max_slots: promotionData?.max_slots ?? null,
    })
  }, [characterId])

  const loadInventory = useCallback(async () => {
    if (!characterId) return
    const detailsResult = await supabase.rpc('get_character_inventory_details', {
      p_character_id: characterId,
    })
    if (!detailsResult.error) {
      setInventory(detailsResult.data || [])
      return
    }

    const fallbackResult = await supabase
      .from('character_inventory')
      .select('*')
      .eq('character_id', characterId)
    if (fallbackResult.error) console.error(fallbackResult.error)
    else setInventory(fallbackResult.data || [])
  }, [characterId])

  const loadActivities = useCallback(async () => {
    if (!characterId) return
    const { data, error } = await supabase
      .from('character_history')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setActivities(data || [])
  }, [characterId])

  const loadFollowers = useCallback(async () => {
    if (!characterId) return
    let [followerResult, missionResult] = await Promise.all([
      supabase
        .from('follower_master')
        .select('*, talents:follower_talents(*)')
        .eq('owner_character_id', characterId),
      supabase.rpc('get_player_follower_explorations', {
        p_character_id: characterId,
      }),
    ])
    if (
      followerResult.error &&
      (followerResult.error.message?.includes('follower_talents') ||
        followerResult.error.code === 'PGRST200')
    ) {
      followerResult = await supabase
        .from('follower_master')
        .select('*')
        .eq('owner_character_id', characterId)
    }
    if (followerResult.error) {
      console.error(followerResult.error)
      return
    }

    const activeMissionMap = new Map(
      (missionResult.error ? [] : missionResult.data || [])
        .filter((mission) => mission.status === 'exploring')
        .map((mission) => [String(mission.follower_id), mission]),
    )
    setFollowers(
      (followerResult.data || []).map((follower) => ({
        ...follower,
        activeMission: activeMissionMap.get(String(follower.id)) || null,
      })),
    )
  }, [characterId])

  const loadExplorationLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from('exploration_locations')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) console.error(error)
    else setExplorationLocations(data || [])
  }, [])

  const loadShopFollowers = useCallback(async () => {
    let result = await supabase
      .from('follower_master')
      .select('*, talents:follower_talents(*)')
      .is('owner_character_id', null)
      .eq('active', true)
    if (
      result.error &&
      (result.error.message?.includes('follower_talents') ||
        result.error.code === 'PGRST200')
    ) {
      result = await supabase
        .from('follower_master')
        .select('*')
        .is('owner_character_id', null)
        .eq('active', true)
    }
    if (result.error) console.error(result.error)
    else setShopFollowers(result.data || [])
  }, [])

  const loadShopItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('active', true)
      .eq('shop_available', true)
    if (error) console.error(error)
    else setShopItems(data || [])
  }, [])

  const loadCharacterChoices = useCallback(async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('id, character_name')
      .order('character_name', { ascending: true })
    if (error) console.error(error)
    else setCharacterChoices(data || [])
  }, [])

  useEffect(() => {
    if (!characterId) return
    const timer = window.setTimeout(() => {
      void Promise.all([
        loadCharacter(),
        loadInventory(),
        loadActivities(),
        loadFollowers(),
        loadExplorationLocations(),
        loadShopFollowers(),
        loadShopItems(),
        loadCharacterChoices(),
      ])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [
    characterId,
    loadActivities,
    loadCharacter,
    loadFollowers,
    loadInventory,
    loadExplorationLocations,
    loadCharacterChoices,
    loadShopFollowers,
    loadShopItems,
  ])

  async function handleExchange(follower) {
    const { error } = await supabase.rpc('purchase_follower', {
      p_character_id: characterId,
      p_follower_id: follower.id,
    })
    if (error) {
      alert(
        error.message?.includes('already has an owner')
          ? 'ผู้ติดตามคนนี้มีคนรับไปแล้ว'
          : error.message?.includes('Insufficient RP')
            ? 'RP ไม่เพียงพอ'
            : 'แลกผู้ติดตามไม่สำเร็จ',
      )
      return
    }

    alert(`ได้รับ ${follower.name} แล้ว`)
    await Promise.all([
      loadCharacter(),
      loadFollowers(),
      loadShopFollowers(),
      loadActivities(),
    ])
  }

  function handleStartExploration(follower) {
    setMissionFollower(follower)
  }

  async function handleConfirmExploration({ followerId, locationId, objective }) {
    const result = await supabase.rpc('start_follower_exploration', {
      p_character_id: characterId,
      p_follower_id: followerId,
      p_location_id: locationId,
      p_objective: objective || null,
    })
    if (!result.error) {
      setMissionFollower(null)
      await Promise.all([loadFollowers(), loadActivities()])
    }
    return result
  }

  async function handleStartAllExplorations() {
    if (!explorationLocations.length) {
      alert('ยังไม่มีพื้นที่สำรวจ กรุณาให้สต๊าฟตั้งค่าพื้นที่ก่อน')
      return
    }
    const readyFollowers = followers.filter((follower) => follower.status === 'idle')
    const results = await Promise.all(
      readyFollowers.map((follower) => {
        const bestLocation = explorationLocations.reduce((best, location) => {
          const score = (follower.talents || [])
            .filter((talent) => location.tags?.includes(talent.talent_key))
            .reduce((total, talent) => total + talent.modifier_percent, 0)
          return !best || score > best.score ? { location, score } : best
        }, null)?.location
        return supabase.rpc('start_follower_exploration', {
          p_character_id: characterId,
          p_follower_id: follower.id,
          p_location_id: bestLocation?.id || explorationLocations[0]?.id,
          p_objective: 'สำรวจและรวบรวมข้อมูลทั่วไป',
        })
      }),
    )
    const failedCount = results.filter((result) => result.error).length
    if (failedCount) {
      alert(`ส่งสำรวจไม่สำเร็จ ${failedCount} คน อาจใช้สิทธิ์ประจำสัปดาห์ครบแล้ว`)
    }
    if (failedCount === readyFollowers.length) {
      return
    }
    await Promise.all([loadFollowers(), loadActivities()])
  }

  async function handleFavorExchange() {
    if (favorAmount <= 0) return
    if (favorAmount > character.rp) {
      alert('RP ไม่เพียงพอ')
      return
    }

    const receivedFavor = Math.floor(favorAmount / 10)
    const { error } = await supabase
      .from('characters')
      .update({
        rp: character.rp - favorAmount,
        favor: character.favor + receivedFavor,
      })
      .eq('id', characterId)
    if (error) {
      alert('แลกโปรดปรานไม่สำเร็จ')
      return
    }

    await supabase.from('character_history').insert({
      character_id: characterId,
      action: 'แลกโปรดปราน',
      value: `-${favorAmount} RP · +${receivedFavor} โปรดปราน`,
      type: 'favor',
    })
    setShowFavorExchange(false)
    setFavorAmount(100)
    await Promise.all([loadCharacter(), loadActivities()])
  }

  async function handleBuyItem(item) {
    const { error } = await supabase.rpc('purchase_catalog_item', {
      p_character_id: characterId,
      p_item_id: item.id,
    })
    if (error) {
      alert(
        error.message?.includes('Insufficient RP')
          ? 'RP ไม่เพียงพอ'
          : error.message?.includes('Insufficient Favor')
            ? 'โปรดปรานไม่เพียงพอ'
            : error.message?.includes('out of stock')
              ? 'รายการนี้หมดแล้ว'
              : 'แลกรางวัลไม่สำเร็จ',
      )
      return
    }

    alert(
      item.fulfillment_type === 'staff_request'
        ? `แลก ${item.name} สำเร็จ ระบบส่งคำร้องให้สต๊าฟแล้ว`
        : `แลก ${item.name} สำเร็จ ไอเท็มถูกเพิ่มเข้าคลังแล้ว`,
    )
    await Promise.all([
      loadCharacter(),
      loadInventory(),
      loadActivities(),
      loadShopItems(),
    ])
  }

  async function handleRequestItem(values) {
    const result = await supabase.rpc('create_player_item_use_request', {
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

    if (!result.error) {
      setSelectedItem(null)
      alert('ส่งคำร้องใช้ไอเท็มแล้ว สต๊าฟจะตรวจสอบและแจ้งผลภายหลัง')
      await Promise.all([loadInventory(), loadActivities()])
    }
    return result
  }

  async function handlePromote() {
    if (!character?.next_position) {
      alert('ตำแหน่งนี้ไม่สามารถเลื่อนขั้นได้แล้ว')
      return
    }
    if (character.favor < character.favor_required) {
      alert('โปรดปรานไม่เพียงพอ')
      return
    }

    if (character.max_slots) {
      const { count, error } = await supabase
        .from('characters')
        .select('*', { count: 'exact', head: true })
        .eq('position', character.next_position)
      if (error) {
        alert('ตรวจสอบตำแหน่งไม่สำเร็จ')
        return
      }
      if (count >= character.max_slots) {
        alert('ตำแหน่งนี้เต็มแล้ว')
        return
      }
    }

    const { error } = await supabase
      .from('characters')
      .update({
        position: character.next_position,
        favor: character.favor - character.favor_required,
      })
      .eq('id', characterId)
    if (error) {
      alert('เลื่อนขั้นไม่สำเร็จ')
      return
    }

    await supabase.from('character_history').insert({
      character_id: characterId,
      action: 'เลื่อนขั้น',
      value: `${character.position} → ${character.next_position}`,
      type: 'promotion',
    })
    alert(`เลื่อนขั้นเป็น ${character.next_position} สำเร็จ`)
    await Promise.all([loadCharacter(), loadActivities()])
  }

  const dashboard = !characterId ? (
    <Navigate to="/login" replace />
  ) : !character ? (
    <div className="loading-page">
      <span className="loading-seal">蘭</span>
      <p>กำลังเปิดบัญชีตำหนัก...</p>
    </div>
  ) : (
    <div className="player-app">
      <header className="app-topbar">
        <div className="app-brand">
          <span>蘭</span>
          <div>
            <strong>หลันโจว</strong>
            <small>PALACE LEDGER</small>
          </div>
        </div>
        <div className="topbar-copy">
          <span>พื้นที่ของผู้เล่น</span>
          <strong>ภาพรวมตำหนัก</strong>
        </div>
      </header>

      <DashboardLayout
        left={
          <>
            <ProfileCard character={character} onLogout={logout} />
            <PointCard
              character={character}
              onOpenExchange={() => setShowShop(true)}
              onOpenFavorExchange={() => setShowFavorExchange(true)}
            />
            <PromotionCard character={character} onPromote={handlePromote} />
          </>
        }
        center={
          <>
            <FollowerCard
              followers={followers}
              onStartExploration={handleStartExploration}
              onStartAllExplorations={handleStartAllExplorations}
            />
            <InventoryCard inventory={inventory} onSelectItem={setSelectedItem} />
          </>
        }
        right={<ActivityCard activities={activities} />}
      />

      {showFavorExchange && (
        <div className="modal-backdrop" onMouseDown={() => setShowFavorExchange(false)}>
          <section
            className="dialog favor-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="favor-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close"
              type="button"
              aria-label="ปิด"
              onClick={() => setShowFavorExchange(false)}
            >
              ×
            </button>
            <span className="eyebrow">แลกคะแนน</span>
            <h2 id="favor-dialog-title">เปลี่ยน RP เป็นโปรดปราน</h2>
            <p className="dialog-intro">ทุก 10 RP แลกได้ 1 คะแนนโปรดปราน</p>

            <div className="exchange-balance">
              <div><span>RP คงเหลือ</span><strong>{formatNumber(character.rp)}</strong></div>
              <div><span>โปรดปรานปัจจุบัน</span><strong>{formatNumber(character.favor)}</strong></div>
            </div>

            <label className="exchange-label" htmlFor="favor-amount">จำนวน RP ที่ต้องการใช้</label>
            <div className="number-stepper">
              <button type="button" onClick={() => setFavorAmount((value) => Math.max(0, value - 10))}>−</button>
              <input
                id="favor-amount"
                type="number"
                min="0"
                step="10"
                value={favorAmount}
                onChange={(event) => setFavorAmount(Math.max(0, Number(event.target.value) || 0))}
              />
              <button type="button" onClick={() => setFavorAmount((value) => value + 10)}>+</button>
            </div>
            <div className="exchange-result">
              <span>คุณจะได้รับ</span>
              <strong>+{formatNumber(Math.floor(favorAmount / 10))} โปรดปราน</strong>
            </div>
            <button
              className="primary-button dialog-submit"
              type="button"
              disabled={!favorAmount || favorAmount > character.rp}
              onClick={handleFavorExchange}
            >
              ยืนยันการแลก
            </button>
          </section>
        </div>
      )}

      {showShop && (
        <div className="modal-backdrop" onMouseDown={() => setShowShop(false)}>
          <section
            className="dialog shop-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="ร้านแลกคะแนน"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close"
              type="button"
              aria-label="ปิดร้านค้า"
              onClick={() => setShowShop(false)}
            >
              ×
            </button>
            <ShopPanel
              shopFollowers={shopFollowers}
              shopItems={shopItems}
              onBuyItem={handleBuyItem}
              onBuyFollower={handleExchange}
            />
          </section>
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          characters={characterChoices}
          currentCharacterId={characterId}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleRequestItem}
        />
      )}

      {missionFollower && (
        <FollowerMissionModal
          follower={missionFollower}
          locations={explorationLocations}
          onClose={() => setMissionFollower(null)}
          onSubmit={handleConfirmExploration}
        />
      )}
    </div>
  )

  return (
    <Routes>
      <Route
        path="/login"
        element={characterId ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/dashboard" element={dashboard} />
      <Route
        path="*"
        element={<Navigate to={characterId ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
