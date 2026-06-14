export default function DashboardLayout({ left, right }) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8f4ee',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}
        >
          <div>
            {left}
          </div>
  
          <div>
            {right}
          </div>
        </div>
      </div>
    )
  }