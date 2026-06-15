import { useState } from 'react'

export default function FollowerCard({ followers = [], onStartExploration, onStartAllExplorations }) {
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState('all')

  const ITEMS_PER_PAGE = 4

  const filteredFollowers =
    activeFilter === 'exploring'
      ? followers.filter((follower) => follower.status === 'exploring')
      : followers

  const totalPages = Math.max(1, Math.ceil(filteredFollowers.length / ITEMS_PER_PAGE))

  const paginatedFollowers = filteredFollowers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )
  return (
    <div
      style={{
        background: '#ffffff',
        border: '2px solid #111',
        borderRadius: '0',
        padding: '12px',
        marginTop: '12px',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #111',
          paddingBottom: '6px',
          marginBottom: '8px',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
          ผู้ติดตาม • {filteredFollowers.length} คน
        </div>

        <button
          onClick={() => onStartAllExplorations?.()}
          style={{
            border: '1px solid #111',
            background: '#111',
            color: '#fff',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          ส่งทั้งหมด
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <button
          onClick={() => {
            setActiveFilter('all')
            setPage(1)
          }}
          style={{
            border: '1px solid #111',
            background: activeFilter === 'all' ? '#111' : '#fff',
            color: activeFilter === 'all' ? '#fff' : '#111',
            padding: '4px 10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ทั้งหมด
        </button>

        <button
          onClick={() => {
            setActiveFilter('exploring')
            setPage(1)
          }}
          style={{
            border: '1px solid #111',
            background: activeFilter === 'exploring' ? '#111' : '#fff',
            color: activeFilter === 'exploring' ? '#fff' : '#111',
            padding: '4px 10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          กำลังสำรวจ
        </button>
      </div>
      {paginatedFollowers.map((follower) => (
        <div
          key={follower.id}
          style={{
            border: '1px solid #111',
            borderRadius: '0',
            padding: '10px',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {follower.name}
              </div>

              <div style={{ color: '#555', marginTop: '4px', fontSize: '12px' }}>
                {follower.description}
              </div>

              <div style={{ color: '#777', marginTop: '4px', fontSize: '12px' }}>
                ★{'★'.repeat(follower.skill_value || 1)}
              </div>
            </div>

            <button
              style={{
                border: '1px solid #111',
                background: follower.status === 'exploring' ? '#f5f5f5' : '#fff',
                borderRadius: '0',
                padding: '6px 12px',
                cursor: follower.status === 'exploring' ? 'default' : 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                opacity: follower.status === 'exploring' ? 0.7 : 1,
              }}
              onClick={() => {
                if (follower.status !== 'exploring') {
                  onStartExploration?.(follower.id)
                }
              }}
              disabled={follower.status === 'exploring'}
            >
              {follower.status === 'exploring' ? 'สำรวจ...' : 'ส่งสำรวจ'}
            </button>
          </>
        </div>
      ))}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '16px',
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              border: '1px solid #111',
              background: '#fff',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
            }}
          >
            {'<'}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              style={{
                border: '1px solid #111',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                background: page === pageNum ? '#111' : '#fff',
                color: page === pageNum ? '#fff' : '#111',
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              border: '1px solid #111',
              background: '#fff',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
            }}
          >
            {'>'}
          </button>
        </div>
      )}
    </div>
  )
}
