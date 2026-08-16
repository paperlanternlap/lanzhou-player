import { useMemo, useState } from 'react'
import { formatNumber } from '../utils/formatters'
import {
  followerTypeLabels,
  formatShopDeliveryWindow,
  SHOP_PAGE_SIZE,
  shopSections,
} from './shop/shopConfig'

export default function ShopPanel({
  shopFollowers = [],
  shopItems = [],
  onBuyItem,
  onBuyFollower,
}) {
  const [activeSection, setActiveSection] = useState('palace_stock')
  const [followerType, setFollowerType] = useState('all')
  const [selectedNpcId, setSelectedNpcId] = useState('')
  const [page, setPage] = useState(1)

  // ของจากการสำรวจ อีเวนต์ และภารกิจไม่ใช่สินค้าของโรงเบิก
  const availableItems = useMemo(
    () => shopItems.filter((item) => item.acquisition_type !== 'story_only'),
    [shopItems],
  )

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

  const npcGroups = useMemo(() => {
    const groups = new Map()
    availableItems
      .filter((item) => item.acquisition_type === 'restricted' && item.unlocked)
      .forEach((item) => {
        const key = String(item.acquisition_channel_id || item.acquisition_channel_name)
        if (!key || key === 'null' || key === 'undefined') return
        if (!groups.has(key)) {
          groups.set(key, {
            id: key,
            name: item.acquisition_channel_name,
            role: item.acquisition_channel_role,
            accessReason: item.acquisition_channel_access_reason,
          })
        }
      })
    return Array.from(groups.values())
  }, [availableItems])

  const hasUnknownNpc = availableItems.some(
    (item) => item.acquisition_type === 'restricted' && !item.unlocked,
  )
  const activeNpcId = npcGroups.some((npc) => npc.id === selectedNpcId)
    ? selectedNpcId
    : npcGroups[0]?.id || ''

  const entries = useMemo(() => {
    if (activeSection !== 'followers') {
      if (activeSection === 'restricted') {
        return availableItems.filter((item) => {
          const npcId = String(item.acquisition_channel_id || item.acquisition_channel_name)
          return item.acquisition_type === 'restricted'
            && item.unlocked
            && npcId === activeNpcId
        })
      }
      return availableItems.filter(
        (item) => item.acquisition_type === activeSection,
      )
    }
    if (followerType === 'all') return shopFollowers
    return shopFollowers.filter(
      (follower) => (follower.follower_type || 'other') === followerType,
    )
  }, [activeNpcId, activeSection, availableItems, followerType, shopFollowers])

  const currentSection = shopSections.find((section) => section.id === activeSection)
  const totalPages = Math.max(1, Math.ceil(entries.length / SHOP_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageEntries = entries.slice(
    (safePage - 1) * SHOP_PAGE_SIZE,
    safePage * SHOP_PAGE_SIZE,
  )
  const rangeStart = entries.length ? (safePage - 1) * SHOP_PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(safePage * SHOP_PAGE_SIZE, entries.length)

  function chooseSection(section) {
    setActiveSection(section)
    setPage(1)
  }

  function chooseFollowerType(type) {
    setFollowerType(type)
    setPage(1)
  }

  function chooseNpc(npcId) {
    setSelectedNpcId(npcId)
    setPage(1)
  }

  return (
    <div className="shop-panel">
      <div className="shop-intro">
        <span className="eyebrow">บัญชีสิ่งของประจำวัง</span>
        <h2>เบิกของและจัดหา</h2>
        <p>เลือกช่องทางที่ตัวละครเข้าถึงได้ ส่วนของจากการสำรวจ ภารกิจ และเหตุการณ์จะได้รับผ่านเนื้อเรื่อง</p>
      </div>

      <div className="shop-toolbar">
        <div className="segmented-control shop-tabs" role="tablist" aria-label="เลือกช่องทางรับของหรือผู้ติดตาม">
          {shopSections.map((section) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              key={section.id}
              className={activeSection === section.id ? 'active' : ''}
              onClick={() => chooseSection(section.id)}
            >
              <span className="shop-tab-label">{section.label}</span>
            </button>
          ))}
        </div>

        {activeSection === 'followers' && (
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

      <section className={`shop-section-summary ${activeSection}`}>
        <span className="shop-section-kicker">{currentSection.eyebrow}</span>
        <div>
          <h3>{currentSection.title}</h3>
          <p>{currentSection.description}</p>
        </div>
      </section>

      {activeSection === 'restricted' && (
        <section className="shop-npc-directory" aria-label="NPC ที่ตัวละครรู้จัก">
          <div className="shop-npc-directory__heading">
            <span>ผู้ที่ติดต่อได้</span>
            <p>เลือกผู้ติดต่อเพื่อดูสิ่งของและเงื่อนไขการเจรจา</p>
          </div>
          {npcGroups.length ? (
            <div className="shop-npc-list" role="tablist" aria-label="รายชื่อ NPC">
              {npcGroups.map((npc) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeNpcId === npc.id}
                  className={activeNpcId === npc.id ? 'active' : ''}
                  key={npc.id}
                  onClick={() => chooseNpc(npc.id)}
                >
                  <strong>{npc.name}</strong>
                  <span>{npc.role}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="shop-npc-locked">
              <strong>ยังไม่มี NPC ที่รู้จัก</strong>
              <span>ตามหาเบาะแสหรือสร้างความสัมพันธ์ผ่านการโรลและอีเวนต์ เมื่อพบกันแล้วทีมงานจะบันทึกสิทธิ์ให้</span>
            </div>
          )}
          {hasUnknownNpc && npcGroups.length > 0 && (
            <p className="shop-npc-hint">ยังมีผู้ติดต่อที่ตัวละครสามารถค้นพบได้จากเนื้อเรื่อง</p>
          )}
        </section>
      )}

      <div className="shop-grid">
        {pageEntries.length ? pageEntries.map((entry) => {
          const isItem = activeSection !== 'followers'
          const isOut = isItem && entry.is_limited && entry.stock_quantity <= 0
          const isUnavailable = isItem && !entry.can_request
          const isSecretLocked = isItem
            && entry.acquisition_type === 'restricted'
            && !entry.unlocked
          const cost = entry.cost ?? entry.price ?? 0
          const isSpecialEvent = isItem && entry.fulfillment_type === 'staff_request'
          const currencyLabel = entry.price_currency === 'favor' ? 'แต้มโปรดปราน' : 'แต้ม RP'
          const actionText = isOut
            ? 'ของหมด'
            : isUnavailable
              ? entry.action_label || 'ยังไม่ผ่านเงื่อนไข'
              : isItem
                ? isSpecialEvent
                  ? 'แลกสิทธิ์เหตุการณ์'
                  : activeSection === 'restricted' ? 'เจรจาซื้อ' : entry.action_label
                : 'รับเข้าสังกัด'

          return (
            <article
              className={`shop-card shop-card--${activeSection} ${isOut ? 'out' : ''} ${isSecretLocked ? 'locked' : ''}`}
              key={entry.id}
            >
              <div className="shop-card__top">
                <span className={`shop-kind ${activeSection === 'restricted' ? 'event' : ''}`}>
                  {isItem
                    ? isSpecialEvent
                      ? 'เหตุการณ์พิเศษ'
                      : activeSection === 'palace_stock'
                      ? 'คลังหลวง'
                      : activeSection === 'external_legal'
                        ? 'จัดหานอกวัง'
                        : entry.unlocked
                          ? entry.acquisition_channel_name || 'รู้จัก NPC แล้ว'
                          : 'ยังไม่รู้จัก NPC'
                    : followerTypeLabels[entry.follower_type] || 'ผู้ติดตาม'}
                </span>
                {isItem && entry.is_limited && (
                  <small>{isOut ? 'หมดแล้ว' : `คงเหลือ ${entry.stock_quantity}`}</small>
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
                    <small>ยังไม่ได้กำหนดความถนัด</small>
                  )}
                </div>
              )}

              {isItem && isSpecialEvent && (
                <small className="fulfillment-note">เมื่อแลกสำเร็จ ทีมงานจะได้รับรายการเพื่อดำเนินเหตุการณ์ต่อ</small>
              )}

              {isItem && !isSpecialEvent && activeSection === 'palace_stock' && (
                <small className="fulfillment-note">เบิกจากคลังส่วนกลางและบันทึกเข้าบัญชีตำหนัก</small>
              )}

              {isItem && !isSpecialEvent && activeSection === 'external_legal' && (
                <small className="fulfillment-note">
                  {formatShopDeliveryWindow(entry.fulfillment_days_min, entry.fulfillment_days_max)}
                </small>
              )}

              {isItem && activeSection === 'restricted' && !entry.unlocked && (
                <div className="secret-lock-note">
                  <strong>ยังไม่รู้จัก NPC</strong>
                  <span>ตามหาเบาะแสหรือสร้างความไว้วางใจกับ NPC ผ่านการโรลและอีเวนต์</span>
                </div>
              )}

              {isItem && activeSection === 'restricted' && entry.unlocked && (
                <div className="secret-channel-detail">
                  <div>
                    <span>NPC ผู้จัดหา</span>
                    <strong>{entry.acquisition_channel_name}</strong>
                  </div>
                  <p>{entry.acquisition_channel_role}</p>
                  {entry.acquisition_channel_access_reason && (
                    <p>{entry.acquisition_channel_access_reason}</p>
                  )}
                  <span className="secret-risk">
                    ความเสี่ยง {entry.acquisition_risk_level || 1}/5
                  </span>
                </div>
              )}

              <div className="shop-card__footer">
                <strong>
                  {isSecretLocked
                    ? 'ยังไม่เปิดเผย'
                    : <>{formatNumber(cost)} <em>{currencyLabel}</em></>}
                </strong>
                <button
                  className="primary-button compact-button"
                  type="button"
                  disabled={isOut || isUnavailable}
                  onClick={() => {
                    if (isItem) onBuyItem?.(entry)
                    else onBuyFollower?.(entry)
                  }}
                >
                  {actionText}
                </button>
              </div>
            </article>
          )
        }) : (
          <div className="empty-state shop-empty">
            <span className="shop-empty-kicker">{currentSection.eyebrow}</span>
            <strong>{currentSection.emptyTitle}</strong>
            <p>{currentSection.emptyDescription}</p>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <footer className="shop-pagination">
          <span>รายการที่ {formatNumber(rangeStart)}–{formatNumber(rangeEnd)} จาก {formatNumber(entries.length)}</span>
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
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              ›
            </button>
          </div>
          )}
        </footer>
      )}
    </div>
  )
}
