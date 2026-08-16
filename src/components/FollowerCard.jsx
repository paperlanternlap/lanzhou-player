import { useMemo, useState } from 'react'

const PAGE_SIZE = 5

const statusLabels = {
  idle: 'พร้อมรับภารกิจ',
  exploring: 'กำลังสำรวจ',
  unavailable: 'ยังไม่พร้อม',
}

export default function FollowerCard({
  followers = [],
  onStartExploration,
  onStartAllExplorations,
}) {
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredFollowers = useMemo(() => {
    if (activeFilter === 'idle') {
      return followers.filter((follower) => follower.status === 'idle')
    }
    if (activeFilter === 'exploring') {
      return followers.filter((follower) => follower.status === 'exploring')
    }
    return followers
  }, [activeFilter, followers])

  const totalPages = Math.max(1, Math.ceil(filteredFollowers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedFollowers = filteredFollowers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
  const readyCount = followers.filter((follower) => follower.status === 'idle').length

  function chooseFilter(filter) {
    setActiveFilter(filter)
    setPage(1)
  }

  return (
    <section className="panel follower-panel">
      <div className="panel-heading follower-heading">
        <div>
          <span className="eyebrow">จัดการภารกิจ</span>
          <h2>ผู้ติดตาม <small>{followers.length} คน</small></h2>
        </div>
        <button
          className="secondary-button compact-button"
          type="button"
          disabled={!readyCount}
          onClick={() => onStartAllExplorations?.()}
        >
          ส่งพร้อมกัน {readyCount ? `(${readyCount})` : ''}
        </button>
      </div>

      <div className="segmented-control" aria-label="กรองผู้ติดตาม">
        {[
          ['all', 'ทั้งหมด', followers.length],
          ['idle', 'พร้อมส่ง', readyCount],
          ['exploring', 'กำลังสำรวจ', followers.length - readyCount],
        ].map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            className={activeFilter === id ? 'active' : ''}
            onClick={() => chooseFilter(id)}
          >
            {label} <span>{count}</span>
          </button>
        ))}
      </div>

      <div className="follower-list">
        {paginatedFollowers.length ? paginatedFollowers.map((follower) => {
          const isExploring = follower.status === 'exploring'
          const mission = follower.activeMission
          return (
            <article className="follower-row" key={follower.id}>
              <div className="follower-avatar">
                {follower.image_url ? (
                  <img src={follower.image_url} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span>{follower.name?.slice(0, 1) || 'ผ'}</span>
                )}
              </div>
              <div className="follower-copy">
                <div className="follower-title">
                  <h3>{follower.name}</h3>
                  <span className={`status-pill ${isExploring ? 'busy' : 'ready'}`}>
                    {statusLabels[follower.status] || follower.status}
                  </span>
                </div>
                <p>
                  {mission
                    ? `สำรวจ ${mission.destination}${mission.objective ? ` · ${mission.objective}` : ''}`
                    : follower.description || 'ยังไม่มีรายละเอียด'}
                </p>
                <div className="follower-skill">
                  {follower.talents?.length ? (
                    <>
                      <span>{follower.talents[0].label || follower.talents[0].talent_key}</span>
                      <b>
                        {follower.talents[0].modifier_percent > 0 ? '+' : ''}
                        {follower.talents[0].modifier_percent}%
                      </b>
                    </>
                  ) : (
                    <>
                      <span>ยังไม่ได้กำหนด Talent</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="row-action"
                type="button"
                disabled={isExploring}
                onClick={() => onStartExploration?.(follower)}
              >
                {isExploring ? 'ส่งแล้ว' : 'ส่งสำรวจ'}
              </button>
            </article>
          )
        }) : (
          <div className="empty-state">
            <strong>ไม่มีผู้ติดตามในรายการนี้</strong>
            <span>ลองเลือกตัวกรองอื่น</span>
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
