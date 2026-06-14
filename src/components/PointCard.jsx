export default function PointCard({ character, onOpenExchange }) {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid #ddd',
          }}
        >
          <div>RP Point</div>
          <strong style={{ fontSize: '32px' }}>
            {character?.rp ?? 0}
          </strong>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid #ddd',
          }}
        >
          <div>โปรดปราน</div>
          <strong style={{ fontSize: '32px' }}>
            {character?.favor ?? 0}
          </strong>
        </div>
      </div>

      <button
        onClick={() => onOpenExchange?.()}
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #d8c7a3',
          background: '#f4eee4',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        แลกคะแนน
      </button>
    </div>
  )
}