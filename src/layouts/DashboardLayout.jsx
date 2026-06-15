export default function DashboardLayout({ left, center, right }) {
  return (
    <div
      style={{
        height: '100vh',
        background: '#ffffff',
        padding: '8px',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '300px minmax(0, 1fr) 320px',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        <div>
          {left}
        </div>

        <div>
          {center}
        </div>

        <div style={{ height: '100%' }}>
          {right}
        </div>
      </div>
    </div>
  )
}