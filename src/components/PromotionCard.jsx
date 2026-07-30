function formatNumber(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

export default function PromotionCard({ character, onPromote }) {
  const currentFavor = Number(character?.favor || 0)
  const requiredFavor = Number(character?.favor_required || 0)
  const nextPosition = character?.next_position
  const progress = requiredFavor
    ? Math.min((currentFavor / requiredFavor) * 100, 100)
    : 0
  const remaining = Math.max(requiredFavor - currentFavor, 0)

  return (
    <section className="panel promotion-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">เส้นทางในวัง</span>
          <h2>การเลื่อนขั้น</h2>
        </div>
        {nextPosition && <span className="soft-badge">{Math.round(progress)}%</span>}
      </div>

      {nextPosition ? (
        <>
          <div className="promotion-route">
            <span>{character?.position}</span>
            <b>→</b>
            <strong>{nextPosition}</strong>
          </div>
          <div className="progress-track" aria-label={`ความคืบหน้า ${Math.round(progress)} เปอร์เซ็นต์`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="promotion-meta">
            <span>{formatNumber(currentFavor)} / {formatNumber(requiredFavor)} โปรดปราน</span>
            <small>{remaining > 0 ? `ขาดอีก ${formatNumber(remaining)}` : 'พร้อมเลื่อนขั้น'}</small>
          </div>
          {remaining === 0 && (
            <button className="secondary-button promotion-action" type="button" onClick={onPromote}>
              ยืนยันเลื่อนขั้น
            </button>
          )}
        </>
      ) : (
        <p className="empty-copy">ตำแหน่งนี้เป็นตำแหน่งสูงสุดแล้ว</p>
      )}
    </section>
  )
}
