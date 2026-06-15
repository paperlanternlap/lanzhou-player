import { useState } from 'react'

export default function ShopPanel({
  shopFollowers = [],
  shopItems = [],
  onBuyItem,
  onBuyFollower,
}) {
  const [activeTab, setActiveTab] = useState('followers')

  const items = activeTab === 'followers'
    ? shopFollowers
    : shopItems

  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #111',
        padding: '12px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <strong>ร้านแลกคะแนน</strong>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          marginBottom: '12px',
          border: '1px solid #111',
        }}
      >
        <button
          onClick={() => setActiveTab('followers')}
          style={{
            padding: '8px',
            fontWeight: activeTab === 'followers' ? 'bold' : 'normal',
          }}
        >
          ผู้ติดตาม
        </button>

        <button
          onClick={() => setActiveTab('items')}
          style={{
            padding: '8px',
            fontWeight: activeTab === 'items' ? 'bold' : 'normal',
          }}
        >
          ไอเท็ม
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #111',
              padding: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{item.name}</strong>
              <div>
                {item.description ?? 'ไม่มีรายละเอียด'}
              </div>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'followers') {
                  onBuyFollower?.(item)
                } else {
                  onBuyItem?.(item)
                }
              }}
            >
              ซื้อ ({item.cost ?? item.price ?? 0} RP)
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}