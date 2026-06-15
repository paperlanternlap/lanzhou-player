import { useState } from 'react'

export default function InventoryCard({ inventory = [] }) {
  const [page, setPage] = useState(1)

  const ITEMS_PER_PAGE = 4
  const totalPages = Math.max(1, Math.ceil(inventory.length / ITEMS_PER_PAGE))

  const paginatedInventory = inventory.slice(
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
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
          }}
        >
          คลังของ
        </h3>
      </div>

      <div
        style={{
          borderBottom: '2px solid #111',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      />

      <div style={{ marginTop: '8px' }}>
        {paginatedInventory.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              fontSize: '12px',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <span>{item.item_name ?? item.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>
                x{item.quantity ?? item.amount}
              </span>

              <button
                style={{
                  border: '1px solid #111',
                  background: '#fff',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ใช้
              </button>
            </div>
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
    </div>
  )
}