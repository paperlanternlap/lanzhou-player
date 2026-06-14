export default function InventoryCard({ inventory = [] }) {
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
        {inventory.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <span>{item.item_name ?? item.name}</span>
            <span>x{item.quantity ?? item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}