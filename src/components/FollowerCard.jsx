export default function FollowerCard({ followers = [] }) {
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
      <h3 style={{ marginTop: 0 }}>ผู้ติดตาม</h3>
      {followers.map((follower) => (
        <div
          key={follower.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '12px',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            {follower.name}
          </div>

          <div style={{ color: '#777', marginTop: '4px' }}>
            {follower.skill_type} ★{'★'.repeat(follower.skill_value || 1)}
          </div>

          <button
            style={{
              marginTop: '12px',
              border: '1px solid #e3d6bf',
              background: '#fff',
              borderRadius: '12px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            ส่งสำรวจ
          </button>
        </div>
      ))}
    </div>
  )
}
