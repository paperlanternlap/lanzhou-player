

export default function InventoryCard() {
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0 }}>คลังของ</h3>

        <button
          style={{
            border: 'none',
            background: 'transparent',
            color: '#8b6b3f',
            cursor: 'pointer',
          }}
        >
          ใช้ไอเท็ม
        </button>
      </div>

      <div style={{ marginTop: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #eee',
          }}
        >
          <span>ผ้าไหม</span>
          <span>x2</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #eee',
          }}
        >
          <span>เครื่องหอม</span>
          <span>x1</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
          }}
        >
          <span>ป้ายหยก</span>
          <span>x3</span>
        </div>
      </div>
    </div>
  )
}