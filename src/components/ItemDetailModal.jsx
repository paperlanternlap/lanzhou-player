import { useState } from 'react'

const categoryLabels = {
  general: 'ของใช้ทั่วไป',
  favor: 'เพิ่มโปรดปราน',
  medicine: 'ยาและการรักษา',
  secret: 'แผนลับ',
  access: 'เปิดพื้นที่หรืออีเวนต์',
  defense: 'ป้องกัน',
  story: 'ไอเท็มเนื้อเรื่อง',
}

const requestTypes = [
  { value: 'self', label: 'ใช้กับตัวเอง' },
  { value: 'target', label: 'ใช้กับตัวละครอื่น' },
  { value: 'secret_plan', label: 'แผนลับ / ปล่อยข่าว' },
  { value: 'shared_plot', label: 'โรลหรือพล็อตร่วมกัน' },
  { value: 'unlock', label: 'ปลดล็อกพื้นที่ / เหตุการณ์' },
  { value: 'defense', label: 'ป้องกันผลกระทบ' },
]

export default function ItemDetailModal({
  item,
  characters = [],
  currentCharacterId,
  onClose,
  onSubmit,
  onTransfer,
}) {
  const [showForm, setShowForm] = useState(false)
  const [requestType, setRequestType] = useState(
    item.requires_target ? 'target' : 'self',
  )
  const [targetCharacterId, setTargetCharacterId] = useState('')
  const [actorName, setActorName] = useState('')
  const [useChannel, setUseChannel] = useState(item.default_channel || '')
  const [desiredEffect, setDesiredEffect] = useState('')
  const [details, setDetails] = useState('')
  const [roleUrl, setRoleUrl] = useState('')
  const [secrecyLevel, setSecrecyLevel] = useState('normal')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const usesCurrentCharacter = requestType === 'self'
  const needsTargetSelection =
    !usesCurrentCharacter &&
    (item.requires_target || requestType === 'target')
  const currentCharacter = characters.find(
    (character) => String(character.id) === String(currentCharacterId),
  )
  const canRequest = Boolean(item.item_id)

  async function handleSubmit(event) {
    event.preventDefault()
    if (
      !desiredEffect.trim() ||
      (needsTargetSelection && !targetCharacterId)
    ) return

    setSubmitting(true)
    setError('')
    const effectiveTargetCharacterId = usesCurrentCharacter
      ? Number(currentCharacterId)
      : targetCharacterId
        ? Number(targetCharacterId)
        : null
    const result = await onSubmit({
      itemId: item.item_id,
      requestType,
      targetCharacterId: effectiveTargetCharacterId,
      actorName: actorName.trim(),
      useChannel: useChannel.trim(),
      desiredEffect: desiredEffect.trim(),
      details: details.trim(),
      roleUrl: roleUrl.trim(),
      secrecyLevel,
    })
    setSubmitting(false)

    if (result?.error) {
      setError(
        result.error.message?.includes('does not have this item')
          ? 'ไม่พบไอเท็มชิ้นนี้ในคลัง กรุณารีเฟรชหน้า'
          : result.error.message?.includes('Target character is required')
            ? 'กรุณาเลือกตัวละครเป้าหมาย'
            : 'ส่งคำร้องไม่สำเร็จ กรุณาลองอีกครั้ง',
      )
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="dialog item-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="ปิด" onClick={onClose}>
          ×
        </button>

        <div className="item-detail-heading">
          <span className="eyebrow">
            {categoryLabels[item.use_category] || 'ของใช้ทั่วไป'}
          </span>
          <h2 id="item-detail-title">{item.item_name ?? item.name}</h2>
          <span className="quantity-badge">มี {item.quantity} ชิ้น</span>
        </div>

        <p className="item-description">
          {item.description || 'ไอเท็มนี้ยังไม่มีรายละเอียด กรุณาสอบถามสต๊าฟก่อนใช้งาน'}
        </p>

        <div className="item-rules">
          <div>
            <span>เป้าหมาย</span>
            <strong>{item.requires_target ? 'ต้องระบุ' : 'ไม่บังคับ'}</strong>
          </div>
          <div>
            <span>การทอย</span>
            <strong>{item.requires_roll ? 'มีขั้นตอนทอย' : 'ไม่ต้องทอย'}</strong>
          </div>
          <div>
            <span>ช่องทางแนะนำ</span>
            <strong>{item.default_channel || 'ไม่กำหนด'}</strong>
          </div>
        </div>

        {!showForm ? (
          <div className="item-detail-actions">
            {!canRequest && (
              <p className="form-hint">
                ไอเท็มเก่านี้ยังไม่มีข้อมูลในทะเบียน กรุณาติดต่อสต๊าฟ
              </p>
            )}
            <button
              className="primary-button"
              type="button"
              disabled={!canRequest}
              onClick={() => setShowForm(true)}
            >
              ขอใช้ไอเท็ม
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={!canRequest || item.transferable === false}
              onClick={onTransfer}
            >
              {item.transferable === false ? 'ไอเท็มนี้ห้ามโอน' : 'ส่งให้ผู้เล่น'}
            </button>
          </div>
        ) : (
          <form className="item-request-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                รูปแบบการใช้
                <select
                  value={requestType}
                  onChange={(event) => {
                    setRequestType(event.target.value)
                    setTargetCharacterId('')
                  }}
                >
                  {requestTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>

              {usesCurrentCharacter ? (
                <label>
                  ตัวละครเป้าหมาย
                  <select value={String(currentCharacterId)} disabled>
                    <option value={String(currentCharacterId)}>
                      {currentCharacter?.character_name || 'ตัวละครปัจจุบัน'}
                    </option>
                  </select>
                </label>
              ) : needsTargetSelection ? (
                <label>
                  ตัวละครเป้าหมาย
                  <select
                    required
                    value={targetCharacterId}
                    onChange={(event) => setTargetCharacterId(event.target.value)}
                  >
                    <option value="">เลือกตัวละคร</option>
                    {characters
                      .filter(
                        (character) =>
                          String(character.id) !== String(currentCharacterId),
                      )
                      .map((character) => (
                        <option key={character.id} value={character.id}>
                          {character.character_name}
                        </option>
                      ))}
                  </select>
                </label>
              ) : null}
            </div>

            <label>
              ต้องการให้เกิดผลอะไร
              <textarea
                required
                rows="3"
                value={desiredEffect}
                placeholder="เช่น เพิ่มโอกาสถูกพลิกป้ายในรอบถัดไป"
                onChange={(event) => setDesiredEffect(event.target.value)}
              />
            </label>

            <div className="form-grid">
              <label>
                ช่องทางหรือสถานที่
                <input
                  value={useChannel}
                  placeholder="เช่น ห้องบรรทม หรือกลุ่มโรล"
                  onChange={(event) => setUseChannel(event.target.value)}
                />
              </label>
              <label>
                NPC ผู้ลงมือ (ถ้ามี)
                <input
                  value={actorName}
                  placeholder="ไม่ต้องกรอกหากผู้เล่นใช้เอง"
                  onChange={(event) => setActorName(event.target.value)}
                />
              </label>
            </div>

            <label>
              รายละเอียดเพิ่มเติม
              <textarea
                rows="2"
                value={details}
                placeholder="บริบท เงื่อนไข หรือข้อมูลที่สต๊าฟควรรู้"
                onChange={(event) => setDetails(event.target.value)}
              />
            </label>

            <div className="form-grid">
              <label>
                ลิงก์โรล (ถ้ามี)
                <input
                  type="url"
                  value={roleUrl}
                  placeholder="https://..."
                  onChange={(event) => setRoleUrl(event.target.value)}
                />
              </label>
              <label>
                การมองเห็นคำร้อง
                <select value={secrecyLevel} onChange={(event) => setSecrecyLevel(event.target.value)}>
                  <option value="normal">ปกติ</option>
                  <option value="staff_only">ลับเฉพาะสต๊าฟ</option>
                </select>
              </label>
            </div>

            <p className="form-hint">
              เมื่อส่งคำร้อง ไอเท็ม 1 ชิ้นจะถูกพักไว้ หากคำร้องถูกปฏิเสธสต๊าฟจะคืนให้
            </p>
            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>
                ย้อนกลับ
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={
                  submitting ||
                  !desiredEffect.trim() ||
                  (needsTargetSelection && !targetCharacterId)
                }
              >
                {submitting ? 'กำลังส่งคำร้อง...' : 'ยืนยันขอใช้ไอเท็ม'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
