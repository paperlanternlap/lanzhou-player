export default function ShopPanel() {
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
        <button style={{ padding: '8px', fontWeight: 'bold' }}>ผู้ติดตาม</button>
        <button style={{ padding: '8px' }}>ไอเท็ม</button>
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
        {[
          ['หลินเซียง', '350 RP'],
          ['อาเป่า', '250 RP'],
          ['ซูหยวน', '200 RP'],
          ['เดิ้นอ๋อ', '300 RP'],
          ['ม่อหลาน', '320 RP'],
        ].map(([name, price]) => (
          <div
            key={name}
            style={{
              border: '1px solid #111',
              padding: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{name}</strong>
              <div>★★★★★ · {price}</div>
            </div>
            <button>แลก</button>
          </div>
        ))}
      </div>
    </div>
  )
}