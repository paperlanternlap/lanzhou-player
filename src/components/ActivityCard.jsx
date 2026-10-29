import { useMemo, useState } from 'react'

const PAGE_SIZE = 7

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function ActivityCard({ activities = [] }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedActivities = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE
    return activities.slice(startIndex, startIndex + PAGE_SIZE)
  }, [activities, safePage])

  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ความเคลื่อนไหว</span>
          <h2>กิจกรรมล่าสุด</h2>
        </div>
        <span className="soft-badge">{activities.length}</span>
      </div>

      <div className="activity-list">
        {pagedActivities.length ? pagedActivities.map((activity) => (
          <article className="activity-row" key={activity.id}>
            <span className={`activity-dot ${activity.type || ''}`} />
            <div>
              <h3>{activity.action ?? activity.title}</h3>
              {(activity.value ?? activity.result) && (
                <p>{activity.value ?? activity.result}</p>
              )}
            </div>
            <time>{formatDate(activity.created_at)}</time>
          </article>
        )) : (
          <div className="empty-state">
            <strong>ยังไม่มีกิจกรรม</strong>
            <span>รายการล่าสุดจะปรากฏที่นี่</span>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            aria-label="หน้าก่อนหน้า"
          >
            ‹
          </button>
          <span>{safePage} / {totalPages}</span>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            aria-label="หน้าถัดไป"
          >
            ›
          </button>
        </div>
      )}
    </section>
  )
}
