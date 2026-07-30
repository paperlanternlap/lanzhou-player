import { useState } from 'react'

const PAGE_SIZE = 8

export default function InventoryCard({ inventory = [], onSelectItem }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(inventory.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedInventory = inventory.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  return (
    <section className="panel inventory-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ทรัพย์สิน</span>
          <h2>คลังไอเท็ม <small>{inventory.length} รายการ</small></h2>
        </div>
      </div>

      <div className="inventory-list">
        {paginatedInventory.length ? paginatedInventory.map((item) => (
          <button
            className="inventory-row"
            type="button"
            key={item.inventory_id ?? item.id}
            onClick={() => onSelectItem?.(item)}
          >
            <span>{item.item_name ?? item.name}</span>
            <span className="inventory-quantity">
              <strong>×{item.quantity ?? item.amount}</strong>
              <i>ดูรายละเอียด ›</i>
            </span>
          </button>
        )) : (
          <div className="empty-state compact">
            <strong>คลังยังว่างอยู่</strong>
            <span>ไอเท็มที่ซื้อหรือได้รับจะแสดงที่นี่</span>
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
