import { useMemo, useState } from 'react'

const PAGE_SIZE = 4

const followerTypeLabels = {
  close_maid: 'นางกำนัลใกล้ชิด',
  maid: 'นางกำนัล',
  eunuch: 'ขันที',
  kitchen: 'แม่ครัว',
  gardener: 'คนสวน',
  physician: 'ผู้ช่วยแพทย์',
  guard: 'องครักษ์',
  merchant: 'พ่อค้า',
  tailor: 'ช่างเย็บปัก',
  scribe: 'เสมียน',
  courier: 'คนส่งของ',
  ritual_attendant: 'ผู้ดูแลงานพิธี',
  other: 'ผู้ติดตาม',
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

export default function ShopPanel({
  shopFollowers = [],
  shopItems = [],
  onBuyItem,
  onBuyFollower,
}) {
  const [activeTab, setActiveTab] = useState('items')
  const [followerType, setFollowerType] = useState('all')
  const [page, setPage] = useState(1)

  const followerTypes = useMemo(() => {
    const counts = shopFollowers.reduce((result, follower) => {
      const type = follower.follower_type || 'other'
      result[type] = (result[type] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).sort(([first], [second]) =>
      (followerTypeLabels[first] || first).localeCompare(
        followerTypeLabels[second] || second,
        'th',
      ),
    )
  }, [shopFollowers])

  const entries = useMemo(() => {
    if (activeTab === 'items') return shopItems
    if (followerType === 'all') return shopFollowers
    return shopFollowers.filter(
      (follower) => (follower.follower_type || 'other') === followerType,
    )
  }, [activeTab, followerType, shopFollowers, shopItems])

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageEntries = entries.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
  const rangeStart = entries.length ? (safePage - 1) * PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(safePage * PAGE_SIZE, entries.length)

  function chooseTab(tab) {
    setActiveTab(tab)
    setPage(1)
  }

  function chooseFollowerType(type) {
    setFollowerType(type)
    setPage(1)
  }

  return (
    <div className="shop-panel">
      <div className="shop-intro">
        <span className="eyebrow">ร้านหลวง</span>
        <h2>แลกคะแนน</h2>
        <p>เลือกไอเท็ม สิทธิ์พิเศษ หรือผู้ติดตามด้วยคะแนนของตัวละคร</p>
      </div>

      <div className="shop-toolbar">
        <div className="segmented-control shop-tabs" aria-label="หมวดร้านค้า">
          <button
            type="button"
            className={activeTab === 'items' ? 'active' : ''}
            onClick={() => chooseTab('items')}
          >
            ไอเท็มและสิทธิ์ <span>{shopItems.length}</span>
          </button>
          <button
            type="button"
            className={activeTab === 'followers' ? 'active' : ''}
            onClick={() => chooseTab('followers')}
          >
            ผู้ติดตาม <span>{shopFollowers.length}</span>
          </button>
        </div>

        {activeTab === 'followers' && (
          <label className="shop-follower-filter">
            <span>สายผู้ติดตาม</span>
            <select
              value={followerType}
              onChange={(event) => chooseFollowerType(event.target.value)}
            >
              <option value="all">ทุกสาย ({shopFollowers.length})</option>
              {followerTypes.map(([type, count]) => (
                <option key={type} value={type}>
                  {followerTypeLabels[type] || type} ({count})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="shop-grid">
        {pageEntries.length ? pageEntries.map((entry) => {
          const isItem = activeTab === 'items'
          const isOut = isItem && entry.is_limited && entry.stock_quantity <= 0
          const currency = isItem && entry.price_currency === 'favor'
            ? 'โปรดปราน'
            : 'RP'
          const cost = entry.cost ?? entry.price ?? 0
          const isEvent = isItem && entry.fulfillment_type === 'staff_request'

          return (
            <article className={`shop-card ${isOut ? 'out' : ''}`} key={entry.id}>
              <div className="shop-card__top">
                <span className={`shop-kind ${isEvent ? 'event' : ''}`}>
                  {isItem
                    ? isEvent ? 'สิทธิ์พิเศษ' : 'ไอเท็ม'
                    : followerTypeLabels[entry.follower_type] || 'ผู้ติดตาม'}
                </span>
                {isItem && entry.is_limited && (
                  <small>{isOut ? 'หมดแล้ว' : `เหลือ ${entry.stock_quantity}`}</small>
                )}
              </div>
              <h3>{entry.name}</h3>
              <p>{entry.description || 'ยังไม่มีรายละเอียด'}</p>

              {!isItem && (
                <div className="shop-talents">
                  {entry.talents?.length ? (
                    entry.talents.slice(0, 3).map((talent) => (
                      <span
                        key={talent.id || talent.talent_key}
                        className={talent.modifier_percent < 0 ? 'negative' : 'positive'}
                      >
                        {talent.label || talent.talent_key}
                        <b>
                          {talent.modifier_percent > 0 ? '+' : ''}
                          {talent.modifier_percent}%
                        </b>
                      </span>
                    ))
                  ) : (
                    <small>ยังไม่ได้กำหนด Talent</small>
                  )}
                </div>
              )}

              {isItem && (
                <small className="fulfillment-note">
                  {isEvent ? 'แลกแล้วส่งคำร้องให้สต๊าฟ' : 'แลกแล้วเพิ่มเข้าคลัง'}
                </small>
              )}
              <div className="shop-card__footer">
                <strong>{formatNumber(cost)} <em>{currency}</em></strong>
                <button
                  className="primary-button compact-button"
                  type="button"
                  disabled={isOut}
                  onClick={() => {
                    if (isItem) onBuyItem?.(entry)
                    else onBuyFollower?.(entry)
                  }}
                >
                  {isOut ? 'สินค้าหมด' : 'แลกรางวัล'}
                </button>
              </div>
            </article>
          )
        }) : (
          <div className="empty-state shop-empty">
            <strong>ไม่มีรายการในสายนี้</strong>
            <span>ลองเลือกสายผู้ติดตามอื่น</span>
          </div>
        )}
      </div>

      <footer className="shop-pagination">
        <span>
          แสดง {rangeStart}–{rangeEnd} จาก {entries.length} รายการ
        </span>
        {totalPages > 1 && (
          <div>
            <button
              type="button"
              disabled={safePage === 1}
              aria-label="หน้าก่อนหน้า"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              ‹
            </button>
            <strong>{safePage} / {totalPages}</strong>
            <button
              type="button"
              disabled={safePage === totalPages}
              aria-label="หน้าถัดไป"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              ›
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
