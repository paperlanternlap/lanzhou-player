

export default function PromotionCard() {
  return (
    <div
      style={{
        background: '#fcfaf6',
        border: '1px solid #e3d6bf',
        borderRadius: '20px',
        padding: '16px',
        marginTop: '16px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>เลื่อนขั้น</h3>

      <div>โปรดปราน 85 / 100</div>

      <div
        style={{
          height: '8px',
          background: '#e5e5e5',
          borderRadius: '999px',
          marginTop: '12px',
        }}
      >
        <div
          style={{
            width: '85%',
            height: '100%',
            background: '#b68a44',
            borderRadius: '999px',
          }}
        />
      </div>

      <div style={{ marginTop: '12px', color: '#666' }}>
        อีก 15 แต้มจะเลื่อนขั้นได้
      </div>
    </div>
  )
}