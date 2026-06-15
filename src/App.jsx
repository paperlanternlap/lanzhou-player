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

  useEffect(() => {
    if (!characterId) {
      setCharacter(null)
      setInventory([])
      setActivities([])
      setFollowers([])
      setShopFollowers([])
      return
    }

    loadCharacter()
    loadInventory()
    loadActivities()
    loadFollowers()
    loadShopFollowers()
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

    console.log('CHARACTER', data)
    setCharacter(data)
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

                    <PromotionCard />
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
                      <ShopPanel />
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
