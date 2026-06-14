import { useEffect, useState } from 'react'
import ProfileCard from './components/ProfileCard'
import PointCard from './components/PointCard'
import PromotionCard from './components/PromotionCard'
import FollowerCard from './components/FollowerCard'
import InventoryCard from './components/InventoryCard'
import ActivityCard from './components/ActivityCard'
import ExchangeModal from './components/ExchangeModal'
import DashboardLayout from './layouts/DashboardLayout'
import { supabase } from './supabase'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

function App() {
  const characterId = Number(localStorage.getItem('characterId'))
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [activities, setActivities] = useState([])
  const [followers, setFollowers] = useState([])
  const [shopFollowers, setShopFollowers] = useState([])

  useEffect(() => {
    if (!characterId) return

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
              <DashboardLayout
                left={
                  <>
                    <ProfileCard
                      character={character}
                      onOpenExchange={() => {
                        setIsExchangeOpen(true)
                      }}
                    />
                    <PointCard
                      character={character}
                      onOpenExchange={() => {
                        setIsExchangeOpen(true)
                      }}
                    />
                    <PromotionCard />
                  </>
                }
                right={
                  <>
                    <FollowerCard followers={followers} />
                    <InventoryCard inventory={inventory} />
                    <ActivityCard activities={activities} />
                  </>
                }
              />

              <ExchangeModal
                open={isExchangeOpen}
                onClose={() => setIsExchangeOpen(false)}
                followers={shopFollowers}
                onExchange={handleExchange}
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
