import { useState } from 'react'

export default function ExchangeModal({ open, onClose, followers = [], onExchange }) {
  if (!open) return null
  const [tab, setTab] = useState('followers')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '420px',
          background: '#fcfaf6',
          border: '1px solid #e3d6bf',
          borderRadius: '20px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ margin: 0 }}>แลกคะแนน</h3>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setTab('followers')}>
            ผู้ติดตาม
          </button>

          <button onClick={() => setTab('items')}>
            ไอเท็ม
          </button>

          <button onClick={() => setTab('favor')}>
            โปรดปราน
          </button>
        </div>

        {tab === 'followers' && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {followers.map((follower) => (
              <div key={follower.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '12px' }}>
                <strong>{follower.name}</strong>
                <div>
                  {follower.skill_type} ★{'★'.repeat(follower.skill_value || 1)}
                </div>
                <div>ราคา {follower.cost} RP</div>
                <button
                  style={{ marginTop: '8px' }}
                  onClick={() => {
                    onExchange?.(follower)
                  }}
                >
                  แลก
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'items' && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {playerData.shop.items.map((item) => (
              <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '12px' }}>
                <strong>{item.name}</strong>
                <div>ราคา {item.cost} RP</div>
                <button style={{ marginTop: '8px' }}>แลก</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'favor' && (
          <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '12px' }}>
            <strong>โปรดปราน +5</strong>
            <div>ราคา 50 RP</div>
            <button style={{ marginTop: '8px' }}>แลก</button>
          </div>
        )}
      </div>
    </div>
  )
}