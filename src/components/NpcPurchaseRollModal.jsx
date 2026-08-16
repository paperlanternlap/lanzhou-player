import { useState } from 'react'

const outcomeLabels = {
  critical_success: 'สำเร็จอย่างงดงาม',
  success: 'เจรจาสำเร็จ',
  failure: 'เจรจาไม่สำเร็จ',
  critical_failure: 'ผิดพลาดร้ายแรง',
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

function getRiskRule(riskLevel) {
  const risk = Number(riskLevel || 1)
  if (risk <= 2) return { mode: 'opposed', label: 'NPC อัตโนมัติ · ผู้เล่นทอยเอง' }
  if (risk === 3) return { mode: 'target', target: 50, label: 'ต้องมากกว่า 50' }
  if (risk === 4) return { mode: 'target', target: 65, label: 'ต้องมากกว่า 65' }
  return { mode: 'target', target: 80, label: 'ต้องมากกว่า 80' }
}

export default function NpcPurchaseRollModal({ item, rp, onClose, onAttempt }) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const canAfford = Number(rp || 0) >= Number(item.cost || 0)
  const riskRule = getRiskRule(item.acquisition_risk_level)

  async function attempt() {
    setSubmitting(true)
    setError('')
    const response = await onAttempt(item)
    setSubmitting(false)
    if (response.error) {
      setError(response.error)
      return
    }
    setResult(response.data)
  }

  const succeeded = ['success', 'critical_success'].includes(result?.resolution_outcome)

  return (
    <div className="modal-backdrop npc-roll-backdrop" onMouseDown={() => !submitting && onClose()}>
      <section
        className="dialog npc-roll-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="npc-roll-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="ปิด" disabled={submitting} onClick={onClose}>×</button>
        <span className="eyebrow">เจรจากับ {item.acquisition_channel_name}</span>
        <h2 id="npc-roll-title">{item.name}</h2>

        {!result ? (
          <>
            <p className="npc-roll-description">{item.description}</p>
            <div className="npc-roll-terms">
              <div><span>สิ่งแลกเปลี่ยน</span><strong>{formatNumber(item.cost)} RP</strong></div>
              <div><span>ความเสี่ยง</span><strong>{item.acquisition_risk_level || 1}/5</strong></div>
              <div><span>การตัดสินผล</span><strong>{item.acquisition_requires_roll ? riskRule.label : 'ไม่ต้องทอย'}</strong></div>
            </div>
            {item.acquisition_risk_summary && (
              <p className="npc-roll-warning">{item.acquisition_risk_summary}</p>
            )}
            <p className="npc-roll-rule">
              {item.acquisition_requires_roll
                ? <>
                    {riskRule.mode === 'opposed'
                      ? 'ระบบทอย d100 ให้ NPC อัตโนมัติ ส่วนผู้เล่นต้องกด “ทอยของฉัน” เอง ผู้เล่นต้องได้มากกว่า NPC และแต้มเท่ากันถือว่าไม่ผ่าน'
                      : `ผู้เล่นต้องกด “ทอยของฉัน” และต้องได้มากกว่า ${riskRule.target}`}
                    <br />ผล 1–5 คือผิดพลาดร้ายแรง ส่วน 96–100 คือสำเร็จอย่างงดงามเมื่อผ่านเงื่อนไขข้างต้น
                  </>
                : 'รายการนี้ไม่ต้องทอย เมื่อยืนยันแล้ว NPC จะเริ่มดำเนินการจัดหา'}
            </p>
            <label className="npc-roll-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span>
                ยืนยันใช้ {formatNumber(item.cost)} RP เพื่อเจรจา
                {item.acquisition_requires_roll && ' โดย RP จะถูกหักแม้ผลทอยไม่ผ่าน'}
              </span>
            </label>
            {error && <p className="npc-roll-error">{error}</p>}
            <button
              className="primary-button npc-roll-action"
              type="button"
              disabled={submitting || !canAfford || !confirmed}
              onClick={attempt}
            >
              {submitting
                ? 'กำลังตัดสินผล...'
                : !canAfford
                  ? 'RP ไม่เพียงพอ'
                  : item.acquisition_requires_roll ? 'ทอยของฉัน d100' : 'ยืนยันการเจรจา'}
            </button>
          </>
        ) : (
          <div className={`npc-roll-result ${succeeded ? 'success' : 'failure'}`}>
            {result.resolution_roll && (
              <div className="npc-roll-versus">
                {result.npc_opposed_roll ? (
                  <>
                    <div className="npc-roll-die npc">
                      <span>NPC</span>
                      <strong>{result.npc_opposed_roll}</strong>
                    </div>
                    <b>ปะทะ</b>
                  </>
                ) : (
                  <>
                    <div className="npc-roll-die target">
                      <span>ต้องมากกว่า</span>
                      <strong>{riskRule.target}</strong>
                    </div>
                    <b>เกณฑ์</b>
                  </>
                )}
                <div className="npc-roll-die player">
                  <span>ผู้เล่น</span>
                  <strong>{result.resolution_roll}</strong>
                </div>
              </div>
            )}
            <h3>{result.resolution_outcome ? outcomeLabels[result.resolution_outcome] : 'รับคำขอแล้ว'}</h3>
            <p>
              {succeeded
                ? `หัก ${formatNumber(result.charged_amount)} RP แล้ว NPC กำลังจัดหา ${item.name}`
                : result.resolution_outcome
                  ? `หัก ${formatNumber(result.charged_amount)} RP แล้ว และส่งผลให้ทีมงานพิจารณาผลกระทบต่อไป`
                  : `ส่งคำขอเจรจาซื้อ ${item.name} แล้ว`}
            </p>
            <button className="primary-button npc-roll-action" type="button" onClick={onClose}>รับทราบ</button>
          </div>
        )}
      </section>
    </div>
  )
}
