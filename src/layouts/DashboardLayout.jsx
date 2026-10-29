import { useState } from 'react'

const mobileViews = [
  ['home', 'หน้าหลัก'],
  ['followers', 'ผู้ติดตาม'],
  ['inventory', 'คลัง'],
  ['records', 'รายการ'],
]

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
        {mobileViews.map(([id, label]) => (
          <button
            type="button"
            key={id}
            className={mobileView === id ? 'active' : ''}
            aria-pressed={mobileView === id}
            onClick={() => {
              setMobileView(id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <span aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </>
  )
}
