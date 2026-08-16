import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ActivityCard from './components/ActivityCard'
import AcquisitionStatusCard from './components/AcquisitionStatusCard'
import FollowerCard from './components/FollowerCard'
import InventoryCard from './components/InventoryCard'
import PointCard from './components/PointCard'
import ProfileCard from './components/ProfileCard'
import PromotionCard from './components/PromotionCard'
import RoleSubmissionCard from './components/RoleSubmissionCard'
import { useAuth } from './hooks/useAuth'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import {
  acknowledgeAcquisition,
  attemptNpcPurchase,
  createItemUseRequest,
  exchangeFavor,
  getAcquisitionRequests,
  getCharacterChoices,
  getExplorationLocations,
  getItemCatalog,
  getPlayerActivities,
  getPlayerCharacter,
  getPlayerFollowers,
  getPlayerInventory,
  getPlayerRoleSubmissions,
  getRankRequirement,
  getShopFollowers,
  promotePlayerCharacter,
  purchaseCatalogItem,
  purchaseFollower,
  startExploration,
  submitAcquisitionRequest,
  submitRole,
} from './services/playerService'
import { canFollowerAccessLocation } from './utils/followerExploration'

const FavorExchangeModal = lazy(() => import('./components/FavorExchangeModal'))
const FollowerMissionModal = lazy(() => import('./components/FollowerMissionModal'))
const ItemDetailModal = lazy(() => import('./components/ItemDetailModal'))
const ItemTransferModal = lazy(() => import('./components/ItemTransferModal'))
const NpcPurchaseRollModal = lazy(() => import('./components/NpcPurchaseRollModal'))
const ShopDialog = lazy(() => import('./components/ShopDialog'))

function App() {
  const { characterId, logout } = useAuth()
  const [showShop, setShowShop] = useState(false)
  const [showFavorExchange, setShowFavorExchange] = useState(false)
  const [favorAmount, setFavorAmount] = useState(100)
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [activities, setActivities] = useState([])
  const [roleSubmissions, setRoleSubmissions] = useState([])
  const [submittingRole, setSubmittingRole] = useState(false)
  const [followers, setFollowers] = useState([])
  const [explorationLocations, setExplorationLocations] = useState([])
  const [shopFollowers, setShopFollowers] = useState([])
  const [shopItems, setShopItems] = useState([])
  const [acquisitionRequests, setAcquisitionRequests] = useState([])
  const [characterChoices, setCharacterChoices] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [transferItem, setTransferItem] = useState(null)
  const [missionFollower, setMissionFollower] = useState(null)
  const [npcPurchaseItem, setNpcPurchaseItem] = useState(null)
  const [shopLoading, setShopLoading] = useState(false)
  const shopDataLoaded = useRef(false)
  const shopRequestInFlight = useRef(false)
  const explorationLocationsLoaded = useRef(false)
  const explorationLocationsRequest = useRef(null)
  const characterChoicesLoaded = useRef(false)
  const characterChoicesRequest = useRef(null)

  const loadCharacter = useCallback(async () => {
    if (!characterId) return
    const { data, error } = await getPlayerCharacter(characterId)
    if (error) {
      console.error(error)
      return
    }
    setCharacter(data)
    const promotionResult = await getRankRequirement(data.position)
    if (promotionResult.error) return
    setCharacter((current) => current?.id === data.id ? {
      ...current,
      next_position: promotionResult.data?.next_position ?? null,
      favor_required: promotionResult.data?.favor_required ?? null,
      max_slots: promotionResult.data?.max_slots ?? null,
    } : current)
  }, [characterId])

  const loadInventory = useCallback(async () => {
    if (!characterId) return
    const result = await getPlayerInventory(characterId)
    if (result.error) console.error(result.error)
    else setInventory(result.data || [])
  }, [characterId])

  const loadActivities = useCallback(async () => {
    if (!characterId) return
    const { data, error } = await getPlayerActivities(characterId)
    if (error) console.error(error)
    else setActivities(data || [])
  }, [characterId])

  const loadRoleSubmissions = useCallback(async () => {
    if (!characterId) return
    const { data, error } = await getPlayerRoleSubmissions(characterId)
    if (error) console.error(error)
    else setRoleSubmissions(data || [])
  }, [characterId])

  const loadFollowers = useCallback(async () => {
    if (!characterId) return
    const result = await getPlayerFollowers(characterId)
    if (result.error) {
      console.error(result.error)
      return
    }
    setFollowers(result.data || [])
  }, [characterId])

  const loadExplorationLocations = useCallback(async () => {
    if (explorationLocationsRequest.current) {
      return explorationLocationsRequest.current
    }
    explorationLocationsRequest.current = getExplorationLocations().then(({ data, error }) => {
      explorationLocationsRequest.current = null
      if (error) {
        console.error(error)
        return null
      }
      const locations = data || []
      setExplorationLocations(locations)
      explorationLocationsLoaded.current = true
      return locations
    })
    return explorationLocationsRequest.current
  }, [])

  const loadShopFollowers = useCallback(async () => {
    const result = await getShopFollowers()
    if (result.error) {
      console.error(result.error)
      return false
    }
    setShopFollowers(result.data || [])
    return true
  }, [])

  const loadShopItems = useCallback(async () => {
    if (!characterId) return false
    const { data, error } = await getItemCatalog(characterId)
    if (error) {
      console.error(error)
      return false
    }
    setShopItems(data || [])
    return true
  }, [characterId])

  const loadAcquisitionRequests = useCallback(async () => {
    if (!characterId) return
    const { deliveryResult, requestsResult } = await getAcquisitionRequests(characterId)
    const { data, error } = requestsResult
    if (error) console.error(error)
    else setAcquisitionRequests(data || [])
    if (!deliveryResult.error && Number(deliveryResult.data || 0) > 0) {
      await Promise.all([loadCharacter(), loadInventory(), loadActivities()])
    }
  }, [characterId, loadActivities, loadCharacter, loadInventory])

  const loadCharacterChoices = useCallback(async () => {
    if (characterChoicesRequest.current) return characterChoicesRequest.current
    characterChoicesRequest.current = getCharacterChoices().then(({ data, error }) => {
      characterChoicesRequest.current = null
      if (error) {
        console.error(error)
        return false
      }
      setCharacterChoices(data || [])
      characterChoicesLoaded.current = true
      return true
    })
    return characterChoicesRequest.current
  }, [])

  useEffect(() => {
    if (!characterId) return
    const timer = window.setTimeout(() => {
      void Promise.all([
        loadCharacter(),
        loadInventory(),
        loadActivities(),
        loadRoleSubmissions(),
        loadFollowers(),
        loadAcquisitionRequests(),
      ])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [
    characterId,
    loadActivities,
    loadRoleSubmissions,
    loadCharacter,
    loadFollowers,
    loadInventory,
    loadAcquisitionRequests,
  ])

  async function handleOpenShop() {
    setShowShop(true)
    if (shopDataLoaded.current || shopRequestInFlight.current) return
    shopRequestInFlight.current = true
    setShopLoading(true)
    const results = await Promise.all([loadShopFollowers(), loadShopItems()])
    shopDataLoaded.current = results.every(Boolean)
    shopRequestInFlight.current = false
    setShopLoading(false)
  }

  async function handleSelectItem(item) {
    setSelectedItem(item)
    if (!characterChoicesLoaded.current) await loadCharacterChoices()
  }

  async function handleExchange(follower) {
    const { error } = await purchaseFollower(characterId, follower.id)
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

  async function handleFavorExchange() {
    if (favorAmount <= 0) return
    if (favorAmount > character.rp) {
      alert('RP ไม่เพียงพอ')
      return
    }

    const { error } = await exchangeFavor({
      characterId,
      currentRp: character.rp,
      currentFavor: character.favor,
      rpAmount: favorAmount,
    })
    if (error) {
      alert('แลกโปรดปรานไม่สำเร็จ')
      return
    }

    setShowFavorExchange(false)
    setFavorAmount(100)
    await Promise.all([loadCharacter(), loadActivities()])
  }

  async function handleStartExploration(follower) {
    if (!explorationLocationsLoaded.current) await loadExplorationLocations()
    setMissionFollower(follower)
  }

  async function handleConfirmExploration({ followerId, locationId, objective }) {
    const result = await startExploration({
      characterId,
      followerId,
      locationId,
      objective,
    })
    if (!result.error) {
      setMissionFollower(null)
      await Promise.all([loadFollowers(), loadActivities()])
    }
    return result
  }

  async function handleStartAllExplorations() {
    const locations = explorationLocationsLoaded.current
      ? explorationLocations
      : await loadExplorationLocations()
    if (!locations?.length) {
      alert('ยังไม่มีพื้นที่สำรวจ กรุณาให้สต๊าฟตั้งค่าพื้นที่ก่อน')
      return
    }
    const readyFollowers = followers.filter((follower) => follower.status === 'idle')
    const dispatchPlans = readyFollowers.map((follower) => ({
      follower,
      locations: locations.filter((location) =>
        canFollowerAccessLocation(follower, location),
      ),
    }))
    const eligiblePlans = dispatchPlans.filter((plan) => plan.locations.length)
    const noAccessCount = dispatchPlans.length - eligiblePlans.length
    if (!eligiblePlans.length) {
      alert('ยังไม่มีผู้ติดตามคนใดที่ได้รับสิทธิ์เข้าถึงพื้นที่สำรวจ')
      return
    }
    const results = await Promise.all(
      eligiblePlans.map(({ follower, locations }) => {
        const bestLocation = locations.reduce((best, location) => {
          const talentScore = (follower.talents || [])
            .filter((talent) => location.tags?.includes(talent.talent_key))
            .reduce((total, talent) => total + talent.modifier_percent, 0)
          const successChance = Math.max(
            5,
            Math.min(
              95,
              Number(location.base_success_percent ?? 60) + talentScore,
            ),
          )
          return !best || successChance > best.successChance
            ? { location, successChance }
            : best
        }, null)?.location
        return startExploration({
          characterId,
          followerId: follower.id,
          locationId: bestLocation.id,
          objective: 'สำรวจและรวบรวมข้อมูลทั่วไป',
        })
      }),
    )
    const failedCount = results.filter((result) => result.error).length
    if (failedCount || noAccessCount) {
      alert(
        `ส่งสำรวจไม่สำเร็จ ${failedCount + noAccessCount} คน` +
          (noAccessCount ? ` · ไม่มีพื้นที่เข้าถึง ${noAccessCount} คน` : ''),
      )
    }
    if (failedCount === eligiblePlans.length) {
      return
    }
    await Promise.all([loadFollowers(), loadActivities()])
  }

  async function handleBuyItem(item) {
    if (item.fulfillment_type === 'staff_request') {
      const currencyLabel = item.price_currency === 'favor' ? 'โปรดปราน' : 'RP'
      const confirmed = window.confirm(
        `ยืนยันแลก “${item.name}” ด้วย ${Number(item.cost || 0).toLocaleString('th-TH')} ${currencyLabel}\nเมื่อยืนยันแล้ว ระบบจะหักแต้มและส่งรายการให้ทีมงานทันที`,
      )
      if (!confirmed) return

      const { error } = await purchaseCatalogItem(characterId, item.id)
      if (error) {
        alert(
          error.message?.includes('Insufficient Favor')
            ? 'โปรดปรานไม่เพียงพอ'
            : error.message?.includes('Insufficient RP')
              ? 'RP ไม่เพียงพอ'
              : error.message?.includes('out of stock')
                ? 'รายการนี้หมดแล้ว'
                : 'แลกสิทธิ์เหตุการณ์ไม่สำเร็จ',
        )
        return
      }

      alert(`แลก ${item.name} สำเร็จ ทีมงานได้รับรายการเพื่อดำเนินเหตุการณ์แล้ว`)
      await Promise.all([
        loadCharacter(),
        loadActivities(),
        loadShopItems(),
      ])
      return
    }

    if (item.acquisition_type === 'restricted') {
      setNpcPurchaseItem(item)
      return
    }
    const { data, error } = await submitAcquisitionRequest(characterId, item.id)
    if (error) {
      alert(
        error.message?.includes('Insufficient RP')
          ? 'RP ไม่เพียงพอ'
          : error.message?.includes('Favor threshold')
            ? 'โปรดปรานยังไม่ถึงเกณฑ์'
            : error.message?.includes('locked')
              ? 'ตัวละครยังไม่รู้จัก NPC คนนี้'
            : error.message?.includes('out of stock')
              ? 'รายการนี้หมดแล้ว'
              : 'แลกรางวัลไม่สำเร็จ',
      )
      return
    }

    alert(data?.status === 'completed'
      ? `เบิก ${item.name} สำเร็จ ไอเท็มถูกเพิ่มเข้าคลังแล้ว`
      : data?.auto_delivery && data?.available_at
        ? `รับเรื่องจัดหา ${item.name} แล้ว คาดว่าจะเข้าคลังวันที่ ${new Date(data.available_at).toLocaleString('th-TH')}`
        : item.acquisition_type === 'restricted'
          ? `ส่งคำขอเจรจาซื้อ ${item.name} แล้ว รอทีมงานดำเนินการและทอยผลตามความเสี่ยง`
          : `ส่งคำร้องสำหรับ ${item.name} แล้ว สามารถรอผลจากทีมงานได้`)
    await Promise.all([
      loadCharacter(),
      loadInventory(),
      loadActivities(),
      loadShopItems(),
      loadAcquisitionRequests(),
    ])
  }

  async function handleNpcPurchaseAttempt(item) {
    const { data, error } = await attemptNpcPurchase(characterId, item.id)
    if (error) {
      console.error('NPC purchase attempt failed', error)
      return {
        data: null,
        error: error.message?.includes('roll_phase')
          || error.message?.includes('item_acquisition_requests_roll_phase_check')
          ? 'ระบบทอยยังติดตั้งไม่ครบ กรุณาแจ้งทีมงานให้รัน migration ล่าสุด'
          : error.message?.includes('Catalog item is not available')
            ? 'ไอเท็มนี้ยังไม่ได้เปิดให้ซื้อจากหน้าทีมงาน'
          : error.message?.includes('Insufficient RP')
          ? 'RP ไม่เพียงพอ'
          : error.message?.includes('already active')
            ? 'มีคำขอซื้อรายการนี้กำลังดำเนินการอยู่'
            : error.message?.includes('locked')
              ? 'ตัวละครยังไม่รู้จัก NPC คนนี้'
              : error.message?.includes('out of stock')
                ? 'รายการนี้หมดแล้ว'
                : 'เจรจาซื้อไม่สำเร็จ กรุณาลองใหม่',
      }
    }
    await Promise.all([
      loadCharacter(),
      loadInventory(),
      loadActivities(),
      loadShopItems(),
      loadAcquisitionRequests(),
    ])
    return { data, error: null }
  }

  async function handleAcknowledgeAcquisition(requestId) {
    const { error } = await acknowledgeAcquisition(characterId, requestId)
    if (error) {
      console.error('Acknowledge acquisition result failed', error)
      alert('ปิดผลคำร้องไม่สำเร็จ กรุณาลองใหม่')
      return
    }
    setAcquisitionRequests((current) => current.filter((request) => request.id !== requestId))
  }

  async function handleRequestItem(values) {
    const result = await createItemUseRequest(characterId, values)

    if (!result.error) {
      setSelectedItem(null)
      alert('ส่งคำร้องใช้ไอเท็มแล้ว สต๊าฟจะตรวจสอบและแจ้งผลภายหลัง')
      await Promise.all([loadInventory(), loadActivities()])
    }
    return result
  }

  async function handleSubmitRole(values) {
    if (submittingRole) {
      return { ok: false, message: 'กำลังส่งรายการ กรุณารอสักครู่' }
    }

    setSubmittingRole(true)
    const { error } = await submitRole(characterId, values)
    setSubmittingRole(false)

    if (error) {
      return {
        ok: false,
        message: error.code === '23505' || error.message?.includes('duplicate')
          ? 'ลิงก์นี้ถูกส่งเข้าคิวตรวจแล้ว'
          : error.message?.includes('submit_player_rp')
            ? 'ยังไม่ได้รัน migration สำหรับระบบส่งผลงาน'
            : 'ส่งผลงานไม่สำเร็จ กรุณาลองอีกครั้ง',
      }
    }

    await loadRoleSubmissions()
    return { ok: true }
  }

  async function handlePromote() {
    if (character?.promotion_locked) {
      alert('ตัวละครนี้ถูกระงับสิทธิ์เลื่อนขั้นด้วยโปรดปราน กรุณาติดต่อแม่งาน')
      return
    }
    if (!character?.next_position) {
      alert('ตำแหน่งนี้ไม่สามารถเลื่อนขั้นได้แล้ว')
      return
    }
    if (character.favor < character.favor_required) {
      alert('โปรดปรานไม่เพียงพอ')
      return
    }

    const { error } = await promotePlayerCharacter(characterId)
    if (error) {
      alert(
        error.message?.includes('slots are full')
          ? 'ตำแหน่งนี้เต็มแล้ว'
          : 'เลื่อนขั้นไม่สำเร็จ',
      )
      return
    }
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
        <button type="button" className="topbar-logout" onClick={logout}>
          ออกจากระบบ
        </button>
      </header>

      <DashboardLayout
        left={
          <>
            <ProfileCard character={character} />
            <PromotionCard character={character} onPromote={handlePromote} />
            <PointCard
              character={character}
              onOpenExchange={handleOpenShop}
              onOpenFavorExchange={() => setShowFavorExchange(true)}
            />
          </>
        }
        center={
          <>
            <FollowerCard
              followers={followers}
              onStartExploration={handleStartExploration}
              onStartAllExplorations={handleStartAllExplorations}
            />
            <InventoryCard inventory={inventory} onSelectItem={handleSelectItem} />
          </>
        }
        right={
          <>
            <RoleSubmissionCard
              submissions={roleSubmissions}
              loading={submittingRole}
              onSubmit={handleSubmitRole}
            />
            <AcquisitionStatusCard
              requests={acquisitionRequests}
              onAcknowledge={handleAcknowledgeAcquisition}
            />
            <ActivityCard activities={activities} />
          </>
        }
      />

      <Suspense fallback={null}>
      {showFavorExchange && (
        <FavorExchangeModal
          character={character}
          amount={favorAmount}
          onAmountChange={setFavorAmount}
          onClose={() => setShowFavorExchange(false)}
          onConfirm={handleFavorExchange}
        />
      )}

      {showShop && (
        <ShopDialog
          shopFollowers={shopFollowers}
          shopItems={shopItems}
          onBuyItem={handleBuyItem}
          onBuyFollower={handleExchange}
          onClose={() => setShowShop(false)}
          loading={shopLoading}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          characters={characterChoices}
          currentCharacterId={characterId}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleRequestItem}
          onTransfer={() => {
            setTransferItem(selectedItem)
            setSelectedItem(null)
          }}
        />
      )}

      {npcPurchaseItem && (
        <NpcPurchaseRollModal
          item={npcPurchaseItem}
          rp={character?.rp}
          onClose={() => setNpcPurchaseItem(null)}
          onAttempt={handleNpcPurchaseAttempt}
        />
      )}

      {transferItem && (
        <ItemTransferModal
          item={transferItem}
          currentCharacterId={characterId}
          onClose={() => setTransferItem(null)}
          onTransferred={async () => {
            setTransferItem(null)
            await Promise.all([loadInventory(), loadActivities()])
            alert('ส่งไอเท็มเรียบร้อยแล้ว')
          }}
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
      </Suspense>
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
