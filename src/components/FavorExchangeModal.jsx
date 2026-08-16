import { formatNumber } from '../utils/formatters'

export default function FavorExchangeModal({
  character,
  amount,
  onAmountChange,
  onClose,
  onConfirm,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="dialog favor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="favor-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="ปิด" onClick={onClose}>×</button>
        <span className="eyebrow">ถวายผลงาน</span>
        <h2 id="favor-dialog-title">แลก RP เป็นคะแนนโปรดปราน</h2>
        <p className="dialog-intro">ทุก 10 RP แลกได้ 1 คะแนนโปรดปราน</p>

        <div className="exchange-balance">
          <div><span>RP คงเหลือ</span><strong>{formatNumber(character.rp)}</strong></div>
          <div><span>โปรดปรานปัจจุบัน</span><strong>{formatNumber(character.favor)}</strong></div>
        </div>

        <label className="exchange-label" htmlFor="favor-amount">จำนวน RP ที่ต้องการถวาย</label>
        <div className="number-stepper">
          <button type="button" onClick={() => onAmountChange(Math.max(0, amount - 10))}>−</button>
          <input
            id="favor-amount"
            type="number"
            min="0"
            step="10"
            value={amount}
            onChange={(event) => onAmountChange(Math.max(0, Number(event.target.value) || 0))}
          />
          <button type="button" onClick={() => onAmountChange(amount + 10)}>+</button>
        </div>
        <div className="exchange-result">
          <span>จะได้รับ</span>
          <strong>+{formatNumber(Math.floor(amount / 10))} โปรดปราน</strong>
        </div>
        <button
          className="primary-button dialog-submit"
          type="button"
          disabled={!amount || amount > character.rp}
          onClick={onConfirm}
        >
          ยืนยันการถวายผลงาน
        </button>
      </section>
    </div>
  )
}
