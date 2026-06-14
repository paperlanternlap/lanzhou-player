import { useState } from 'react'
import ProfileCard from './components/ProfileCard'
import PointCard from './components/PointCard'
import PromotionCard from './components/PromotionCard'
import FollowerCard from './components/FollowerCard'
import InventoryCard from './components/InventoryCard'
import ActivityCard from './components/ActivityCard'
import ExchangeModal from './components/ExchangeModal'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)

  return (
    <>
      <DashboardLayout
        left={
          <>
            <ProfileCard
              onOpenExchange={() => {
                setIsExchangeOpen(true)
              }}
            />
            <PointCard
              onOpenExchange={() => {
                setIsExchangeOpen(true)
              }}
            />
            <PromotionCard />
          </>
        }
        right={
          <>
            <FollowerCard />
            <InventoryCard />
            <ActivityCard />
          </>
        }
      />

      <ExchangeModal
        open={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
      />
    </>
  )
}

export default App
