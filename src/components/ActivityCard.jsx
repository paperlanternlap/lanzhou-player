export default function ActivityCard({ activities = [] }) {
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
        กิจกรรมล่าสุด
      </h3>

      <div style={{ marginTop: '8px' }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              paddingTop: index === 0 ? '0' : '8px',
              paddingBottom: '8px',
              borderBottom:
                index === activities.length - 1
                  ? 'none'
                  : '1px solid #d9d9d9',
              fontSize: '12px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>
              {activity.action ?? activity.title}
            </div>
            {(activity.value ?? activity.result) ? (
              <div style={{ color: '#555', marginTop: '4px', fontSize: '12px' }}>
                {activity.value ?? activity.result}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}