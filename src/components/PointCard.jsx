function formatNumber(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

export default function PointCard({ character, onOpenExchange, onOpenFavorExchange }) {
  return (
    <section className="panel score-panel" aria-label="คะแนนตัวละคร">
      <div className="score-grid">
        <div className="score-tile score-tile--rp">
          <span>RP</span>
          <strong>{formatNumber(character?.rp)}</strong>
        </div>
        <div className="score-tile score-tile--favor">
          <div className="score-tile__heading">
            <span>โปรดปราน</span>
            <button
              type="button"
              aria-label="แลก RP เป็นโปรดปราน"
              title="แลก RP เป็นโปรดปราน"
              onClick={() => onOpenFavorExchange?.()}
            />
          </div>
          <strong>{formatNumber(character?.favor)}</strong>
        </div>
      </div>
      <button className="primary-button shop-button" type="button" onClick={() => onOpenExchange?.()}>
        เบิกของและว่าจ้าง
      </button>
    </section>
  )
}
