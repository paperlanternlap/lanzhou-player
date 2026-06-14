

export default function ExchangeModal({ open, onClose }) {
  if (!open) return null

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

        <div style={{ display: 'grid', gap: '12px' }}>
          <button style={{ padding: '12px', borderRadius: '12px' }}>
            แลกผู้ติดตามพิเศษ
          </button>

          <button style={{ padding: '12px', borderRadius: '12px' }}>
            แลกไอเท็ม
          </button>

          <button style={{ padding: '12px', borderRadius: '12px' }}>
            แลกโปรดปราน
          </button>
        </div>
      </div>
    </div>
  )
}