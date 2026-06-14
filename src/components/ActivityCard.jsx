export default function ActivityCard({ activities = [] }) {
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
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              paddingTop: index === 0 ? '0' : '12px',
              paddingBottom: '12px',
              borderBottom:
                index === activities.length - 1
                  ? 'none'
                  : '1px solid #eee',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>
              {activity.action ?? activity.title}
            </div>
            {(activity.value ?? activity.result) ? (
              <div style={{ color: '#777', marginTop: '4px' }}>
                {activity.value ?? activity.result}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}