import { useEffect, useState } from 'react'
import ProfileCard from './components/ProfileCard'
import PointCard from './components/PointCard'
import PromotionCard from './components/PromotionCard'
import FollowerCard from './components/FollowerCard'
import InventoryCard from './components/InventoryCard'
import ActivityCard from './components/ActivityCard'
import ShopPanel from './components/ShopPlanel'
import DashboardLayout from './layouts/DashboardLayout'
import { supabase } from './supabase'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import { useAuth } from './hooks/useAuth'

function App() {
  const { characterId, logout } = useAuth()
  const [showShop, setShowShop] = useState(false)
  const [showFavorExchange, setShowFavorExchange] = useState(false)
  const [favorAmount, setFavorAmount] = useState(100)
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [activities, setActivities] = useState([])
  const [followers, setFollowers] = useState([])
  const [shopFollowers, setShopFollowers] = useState([])
  const [shopItems, setShopItems] = useState([])

  useEffect(() => {
    if (!characterId) {
      setCharacter(null)
      setInventory([])
      setActivities([])
      setFollowers([])
      setShopFollowers([])
      setShopItems([])
      return
    }

    loadCharacter()
    loadInventory()
    loadActivities()
    loadFollowers()
    loadShopFollowers()
    loadShopItems()
  }, [characterId])

  async function loadCharacter() {
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

    const enrichedCharacter = {
      ...data,
      next_position: promotionData?.next_position ?? null,
      favor_required: promotionData?.favor_required ?? null,
      max_slots: promotionData?.max_slots ?? null,
    }

    console.log('CHARACTER', enrichedCharacter)
    setCharacter(enrichedCharacter)
  }

  async function loadInventory() {
    const { data, error } = await supabase
      .from('character_inventory')
      .select('*')
      .eq('character_id', characterId)

    if (error) {
      console.error(error)
      return
    }

    console.log('INVENTORY', data)
    setInventory(data)
  }

  async function loadActivities() {
    const { data, error } = await supabase
      .from('character_history')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    console.log('ACTIVITIES', data)
    setActivities(data)
  }

  async function loadFollowers() {
    const { data, error } = await supabase
      .from('follower_master')
      .select('*')
      .eq('owner_character_id', characterId)

    if (error) {
      console.error(error)
      return
    }

    console.log('FOLLOWERS', data)
    setFollowers(data)
  }

  async function loadShopFollowers() {
    const { data, error } = await supabase
      .from('follower_master')
      .select('*')
      .is('owner_character_id', null)

    if (error) {
      console.error(error)
      return
    }

    console.log('SHOP_FOLLOWERS', data)
    setShopFollowers(data)
  }

  async function loadShopItems() {
    const { data, error } = await supabase
      .from('item_master')
      .select('*')

    if (error) {
      console.error(error)
      return
    }

    console.log('SHOP_ITEMS', data)
    setShopItems(data)
  }

  async function handleExchange(follower) {
    const { error } = await supabase
      .from('follower_master')
      .update({ owner_character_id: characterId })
      .eq('id', follower.id)

    if (error) {
      console.error(error)
      alert('แลกผู้ติดตามไม่สำเร็จ')
      return
    }

    await supabase
      .from('character_history')
      .insert({
        character_id: characterId,
        action: 'รับผู้ติดตามใหม่',
        value: '',
        type: 'follower',
      })

    alert(`ได้รับ ${follower.name} แล้ว`)

    loadFollowers()
    loadShopFollowers()
    loadActivities()
  }

  async function handleStartExploration(followerId) {
    const { error } = await supabase
      .from('follower_master')
      .update({ status: 'exploring' })
      .eq('id', followerId)

    if (error) {
      console.error(error)
      alert('ส่งสำรวจไม่สำเร็จ')
      return
    }

    await loadFollowers()
  }

  async function handleStartAllExplorations() {
    const { error } = await supabase
      .from('follower_master')
      .update({ status: 'exploring' })
      .eq('owner_character_id', characterId)
      .eq('status', 'idle')

    if (error) {
      console.error(error)
      alert('ส่งสำรวจทั้งหมดไม่สำเร็จ')
      return
    }

    await loadFollowers()
  }

  async function handleFavorExchange() {
    if (favorAmount <= 0) return

    if (favorAmount > character.rp) {
      alert('RP ไม่เพียงพอ')
      return
    }

    const { error } = await supabase
      .from('characters')
      .update({
        rp: character.rp - favorAmount,
        favor: character.favor + Math.floor(favorAmount / 10),
      })
      .eq('id', characterId)

    if (error) {
      console.error(error)
      alert('แลกโปรดปรานไม่สำเร็จ')
      return
    }

    await supabase
      .from('character_history')
      .insert({
        character_id: characterId,
        action: 'เพิ่มโปรดปราน',
        value: `+${favorAmount}`,
        type: 'favor',
      })

    setShowFavorExchange(false)
    setFavorAmount(100)

    await loadCharacter()
    await loadActivities()
  }

  async function handleBuyItem(item) {
    const itemCost = item.cost ?? item.price ?? 0

    if (character.rp < itemCost) {
      alert('RP ไม่เพียงพอ')
      return
    }

    const { error: rpError } = await supabase
      .from('characters')
      .update({
        rp: character.rp - itemCost,
      })
      .eq('id', characterId)

    if (rpError) {
      console.error(rpError)
      alert('หัก RP ไม่สำเร็จ')
      return
    }

    const { data: existingItem } = await supabase
      .from('character_inventory')
      .select('*')
      .eq('character_id', characterId)
      .eq('item_name', item.name)
      .maybeSingle()

    if (existingItem) {
      const { error } = await supabase
        .from('character_inventory')
        .update({
          quantity: existingItem.quantity + 1,
        })
        .eq('id', existingItem.id)

      if (error) {
        console.error(error)
        alert('เพิ่มไอเท็มไม่สำเร็จ')
        return
      }
    } else {
      const { error } = await supabase
        .from('character_inventory')
        .insert({
          character_id: characterId,
          item_name: item.name,
          quantity: 1,
        })

      if (error) {
        console.error(error)
        alert('เพิ่มไอเท็มไม่สำเร็จ')
        return
      }
    }

    await supabase
      .from('character_history')
      .insert({
        character_id: characterId,
        action: 'ซื้อไอเท็ม',
        value: item.name,
        type: 'shop',
      })

    alert(`ซื้อ ${item.name} สำเร็จ`)

    await loadCharacter()
    await loadInventory()
    await loadActivities()
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
    
        .select('*', {
    
          count: 'exact',
    
          head: true,
    
        })
    
        .eq('position', character.next_position)
    
      if (error) {
    
        console.error(error)
    
        alert('ตรวจสอบตำแหน่งไม่สำเร็จ')
    
        return
    
      }
    
      if (count >= character.max_slots) {
    
        alert('ตำแหน่งนี้เต็มแล้ว')
    
        return
    
      }
    
    }
  
    const { error: updateError } = await supabase
  .from('characters')
  .update({
    position: character.next_position,
    favor: character.favor - character.favor_required,
  })
  .eq('id', characterId)

if (updateError) {
  console.error(updateError)
  alert('เลื่อนขั้นไม่สำเร็จ')
  return
}

await supabase
  .from('character_history')
  .insert({
    character_id: characterId,
    action: 'เลื่อนขั้น',
    value: `${character.position} → ${character.next_position}`,
    type: 'promotion',
  })

alert(`เลื่อนขั้นเป็น ${character.next_position} สำเร็จ`)

await loadCharacter()
await loadActivities()
  }


  return (
    <Routes>
      <Route
        path="/login"
        element={
          characterId ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          !characterId ? (
            <Navigate to="/login" replace />
          ) : !character ? (
            <div style={{ padding: '40px' }}>Loading...</div>
          ) : (
            <>
              {showFavorExchange && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                  }}
                >
                  <div
                    style={{
                      width: '420px',
                      background: '#fff',
                      border: '2px solid #111',
                      borderRadius: '12px',
                      padding: '24px',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => setShowFavorExchange(false)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '20px',
                      }}
                    >
                      ×
                    </button>

                    <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
                      ❖ แลกโปรดปราน ❖
                    </h2>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      ใช้ RP แลกเป็นคะแนนโปรดปราน (อัตรา 10 RP : 1 โปรดปราน)
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ border: '1px solid #111', padding: '12px', textAlign: 'center' }}>
                        <div>RP คงเหลือ</div>
                        <strong>{character?.rp ?? 0}</strong>
                      </div>
                      <div style={{ border: '1px solid #111', padding: '12px', textAlign: 'center' }}>
                        <div>โปรดปราน</div>
                        <strong>{character?.favor ?? 0}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      จำนวน RP ที่ต้องการแลก
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        onClick={() => setFavorAmount((v) => Math.max(0, v - 10))}
                        style={{
                          width: '44px',
                          height: '44px',
                          border: '1px solid #111',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>

                      <input
                        type='number'
                        value={favorAmount}
                        onChange={(e) => setFavorAmount(Math.max(0, Number(e.target.value) || 0))}
                        style={{
                          flex: 1,
                          border: '1px solid #111',
                          padding: '10px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}
                      />

                      <button
                        onClick={() => setFavorAmount((v) => v + 10)}
                        style={{
                          width: '44px',
                          height: '44px',
                          border: '1px solid #111',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      จะได้รับโปรดปราน +{Math.floor(favorAmount / 10)}
                    </div>

                    <button
                      style={{
                        width: '100%',
                        background: '#111',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        cursor: 'pointer',
                      }}
                      onClick={handleFavorExchange}
                    >
                      ยืนยันการแลก
                    </button>
                  </div>
                </div>
              )}
              <DashboardLayout
                left={
                  <>
                    <ProfileCard
                      character={character}
                      onLogout={() => {
                        logout()
                      }}
                    />

                    <PromotionCard
                      character={character}
                      onPromote={handlePromote}
                    />
                    <PointCard
                      character={character}
                      onOpenExchange={() => {
                        setShowShop((prev) => !prev)
                      }}
                      onOpenFavorExchange={() => {
                        setShowFavorExchange(true)
                      }}
                    />
                  </>
                }
                center={
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: '1fr auto',
                      gap: '12px',
                      height: '100%',
                    }}
                  >
                    <FollowerCard
                      followers={followers}
                      onStartExploration={handleStartExploration}
                      onStartAllExplorations={handleStartAllExplorations}
                    />
                    <InventoryCard inventory={inventory} />
                  </div>
                }
                right={
                  showShop ? (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <button
                          onClick={() => setShowShop(false)}
                          style={{
                            border: '2px solid #111',
                            background: '#fff',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ← ปิดร้านค้า
                        </button>
                      </div>
                      <ShopPanel
                        shopFollowers={shopFollowers}
                        shopItems={shopItems}
                        onBuyItem={handleBuyItem}
                        onBuyFollower={handleExchange}
                      />
                    </>
                  ) : (
                    <ActivityCard activities={activities} />
                  )
                }
              />
            </>
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={characterId ? '/dashboard' : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default App
