export default function DashboardLayout({ left, center, right }) {
  return (
    <main className="player-dashboard">
      <aside className="dashboard-sidebar">{left}</aside>
      <section className="dashboard-main">{center}</section>
      <aside className="dashboard-activity">{right}</aside>
    </main>
  )
}
