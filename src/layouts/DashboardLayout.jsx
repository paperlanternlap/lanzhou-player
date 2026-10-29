import { useState } from 'react'

const mobileViews = [
  ['home', 'หน้าหลัก', 'home'],
  ['followers', 'ผู้ติดตาม', 'followers'],
  ['inventory', 'คลัง', 'inventory'],
  ['records', 'รายการ', 'records'],
]

function MobileNavIcon({ name }) {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" /></>,
    followers: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13h0a5.5 5.5 0 0 1 5.5 5.5V20" /><path d="M15 5.5a3 3 0 0 1 0 5.8M16.5 14a4.5 4.5 0 0 1 4 4.5V20" /></>,
    inventory: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    records: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  }

  return (
    <svg className="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export default function DashboardLayout({ left, followers, inventory, right }) {
  const [mobileView, setMobileView] = useState('home')

  return (
    <>
      <main className={`player-dashboard mobile-view-${mobileView}`}>
        <aside className="dashboard-sidebar dashboard-mobile-screen" data-mobile-screen="home">
          {left}
        </aside>
        <section className="dashboard-main">
          <div className="dashboard-followers dashboard-mobile-screen" data-mobile-screen="followers">
            {followers}
          </div>
          <div className="dashboard-inventory dashboard-mobile-screen" data-mobile-screen="inventory">
            {inventory}
          </div>
        </section>
        <aside className="dashboard-activity dashboard-mobile-screen" data-mobile-screen="records">
          {right}
        </aside>
      </main>

      <nav className="mobile-app-nav" aria-label="เมนูหลัก">
        {mobileViews.map(([id, label, icon]) => (
          <button
            type="button"
            key={id}
            className={mobileView === id ? 'active' : ''}
            aria-pressed={mobileView === id}
            aria-current={mobileView === id ? 'page' : undefined}
            onClick={() => {
              setMobileView(id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <MobileNavIcon name={icon} />
            <span className="mobile-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
