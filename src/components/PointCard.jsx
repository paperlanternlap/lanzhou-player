export default function PointCard({ character, onOpenExchange, onOpenFavorExchange }) {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginTop: '12px',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '8px',
            borderRadius: '0',
            border: '2px solid #111',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>
            RP
          </div>
          <strong style={{ fontSize: '22px' }}>
            {character?.rp ?? 0}
          </strong>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '8px',
            borderRadius: '0',
            border: '2px solid #111',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              marginBottom: '2px',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>โปรดปราน</span>
            <button
              onClick={() => onOpenFavorExchange?.()}
              style={{
                width: '18px',
                height: '18px',
                border: '1px solid #111',
                background: '#fff',
                cursor: 'pointer',
                padding: 0,
                lineHeight: '16px',
                fontWeight: 'bold',
              }}
            >
              +
            </button>
          </div>
          <strong style={{ fontSize: '22px' }}>
            {character?.favor ?? 0}
          </strong>
        </div>
      </div>

      <button
        onClick={() => onOpenExchange?.()}
        style={{
          marginTop: '6px',
          width: '100%',
          padding: '6px',
          borderRadius: '0',
          border: '2px solid #111',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '11px',
        }}
      >
        เปิดร้านค้า
      </button>
    </div>
  )
}