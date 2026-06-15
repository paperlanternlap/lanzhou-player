export default function PromotionCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '2px solid #111',
        borderRadius: '0',
        padding: '12px',
        marginTop: '12px',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: '10px',
          borderBottom: '2px solid #111',
          paddingBottom: '6px',
          fontSize: '15px',
        }}
      >
        เลื่อนขั้น
      </h3>

      <div style={{ fontSize: '12px' }}>โปรดปราน 85 / 100</div>

      <div
        style={{
          height: '6px',
          background: '#e5e5e5',
          borderRadius: '0',
          border: '1px solid #111',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            width: '85%',
            height: '100%',
            background: '#111',
            borderRadius: '0',
          }}
        />
      </div>

      <div style={{ marginTop: '8px', color: '#555', fontSize: '12px' }}>
        อีก 15 แต้มจะเลื่อนขั้นได้
      </div>
    </div>
  )
}