

export default function ActivityCard() {
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
      <h3 style={{ marginTop: 0 }}>กิจกรรมล่าสุด</h3>

      <div style={{ marginTop: '12px' }}>
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: 'bold' }}>
            หลินเซียงกลับจากสำรวจ
          </div>
          <div style={{ color: '#777', marginTop: '4px' }}>
            ได้รับ ผ้าไหม x2
          </div>
        </div>

        <div
          style={{
            paddingTop: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid #eee',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            ใช้เครื่องหอม
          </div>
          <div style={{ color: '#777', marginTop: '4px' }}>
            โปรดปราน +5
          </div>
        </div>

        <div style={{ paddingTop: '12px' }}>
          <div style={{ fontWeight: 'bold' }}>
            แลกผู้ติดตามพิเศษ
          </div>
          <div style={{ color: '#777', marginTop: '4px' }}>
            ได้รับผู้ติดตาม "ชิงเอ๋อร์"
          </div>
        </div>
      </div>
    </div>
  )
}