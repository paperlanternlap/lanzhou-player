import { useMemo, useState } from 'react'

function getSuitability(follower, location) {
  const matchedTalents = (follower.talents || []).filter((talent) =>
    location.tags?.includes(talent.talent_key),
  )
  return {
    matchedTalents,
    score: matchedTalents.reduce(
      (total, talent) => total + Number(talent.modifier_percent || 0),
      0,
    ),
  }
}

export default function FollowerMissionModal({
  follower,
  locations = [],
  onClose,
  onSubmit,
}) {
  const preparedLocations = useMemo(
    () =>
      locations.map((location) => ({
        ...location,
        suitability: getSuitability(follower, location),
      })),
    [follower, locations],
  )
  const bestLocation = useMemo(
    () =>
      preparedLocations.reduce(
        (best, location) =>
          !best || location.suitability.score > best.suitability.score
            ? location
            : best,
        null,
      ),
    [preparedLocations],
  )
  const categories = useMemo(
    () =>
      preparedLocations.reduce((result, location) => {
        const category = location.category || 'พื้นที่อื่น'
        if (!result[category]) result[category] = []
        result[category].push(location)
        return result
      }, {}),
    [preparedLocations],
  )
  const [locationId, setLocationId] = useState(bestLocation?.id || '')
  const [objective, setObjective] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedLocation =
    preparedLocations.find(
      (location) => String(location.id) === String(locationId),
    ) || bestLocation

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedLocation) return
    setSubmitting(true)
    setError('')
    const result = await onSubmit({
      followerId: follower.id,
      locationId: selectedLocation.id,
      objective: objective.trim(),
    })
    setSubmitting(false)

    if (result?.error) {
      setError(
        result.error.message?.includes('weekly mission limit')
          ? 'ผู้ติดตามคนนี้ใช้สิทธิ์สำรวจประจำสัปดาห์ครบแล้ว'
          : result.error.message?.includes('already on a mission')
            ? 'ผู้ติดตามคนนี้กำลังทำภารกิจอยู่'
            : result.error.message?.includes('location')
              ? 'พื้นที่นี้ยังไม่พร้อมใช้งาน กรุณาเลือกพื้นที่ใหม่'
              : 'ส่งสำรวจไม่สำเร็จ กรุณาลองอีกครั้ง',
      )
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="dialog mission-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="ปิด" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow">ภารกิจผู้ติดตาม</span>
        <h2 id="mission-dialog-title">ส่ง {follower.name} สำรวจ</h2>
        <p className="dialog-intro">
          เลือกพื้นที่ในวังและระบุสิ่งที่ต้องการให้ตามหา ผลภารกิจจะขึ้นในกิจกรรมล่าสุด
        </p>

        <div className="mission-follower">
          <div className="follower-avatar">
            {follower.image_url ? (
              <img src={follower.image_url} alt="" />
            ) : (
              <span>{follower.name?.slice(0, 1)}</span>
            )}
          </div>
          <div>
            <strong>{follower.name}</strong>
            <span>
              {(follower.talents || []).length
                ? `${follower.talents.length} Talent สำหรับการสำรวจ`
                : 'ยังไม่ได้กำหนด Talent'}
            </span>
          </div>
        </div>

        <form className="mission-form" onSubmit={handleSubmit}>
          <label>
            พื้นที่สำรวจ
            <select
              value={selectedLocation?.id || ''}
              disabled={!preparedLocations.length}
              onChange={(event) => setLocationId(event.target.value)}
            >
              {!preparedLocations.length && (
                <option value="">ยังไม่มีพื้นที่สำรวจ</option>
              )}
              {Object.entries(categories).map(([category, categoryLocations]) => (
                <optgroup key={category} label={category}>
                  {categoryLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      เขต {location.zone_number} · {location.short_name}
                      {location.suitability.score
                        ? ` (${location.suitability.score > 0 ? '+' : ''}${location.suitability.score}%)`
                        : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {selectedLocation && (
            <div className="mission-location-preview">
              <div>
                <span>{selectedLocation.category}</span>
                <strong>{selectedLocation.name}</strong>
                <p>{selectedLocation.summary}</p>
              </div>
              <div
                className={`suitability-score ${
                  selectedLocation.suitability.score > 0
                    ? 'positive'
                    : selectedLocation.suitability.score < 0
                      ? 'negative'
                      : ''
                }`}
              >
                <span>ความเหมาะสม</span>
                <strong>
                  {selectedLocation.suitability.score > 0 ? '+' : ''}
                  {selectedLocation.suitability.score}%
                </strong>
              </div>
              <div className="mission-talent-matches">
                {selectedLocation.suitability.matchedTalents.length ? (
                  selectedLocation.suitability.matchedTalents.map((talent) => (
                    <span
                      key={talent.id || talent.talent_key}
                      className={talent.modifier_percent < 0 ? 'negative' : 'positive'}
                    >
                      {talent.label || talent.talent_key}{' '}
                      <b>
                        {talent.modifier_percent > 0 ? '+' : ''}
                        {talent.modifier_percent}%
                      </b>
                    </span>
                  ))
                ) : (
                  <small>ไม่มี Talent ที่ได้เปรียบหรือเสียเปรียบในพื้นที่นี้</small>
                )}
              </div>
            </div>
          )}

          <label>
            เป้าหมายภารกิจ
            <textarea
              rows="3"
              value={objective}
              placeholder="เช่น สืบข่าวงานเลี้ยง หาสมุนไพร หรือสำรวจความเคลื่อนไหว"
              onChange={(event) => setObjective(event.target.value)}
            />
          </label>
          <p className="form-hint">
            เปอร์เซ็นต์เป็นข้อมูลช่วยสต๊าฟสรุปผล ไม่ได้รับประกันว่าจะสำเร็จหรือได้รางวัล
          </p>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onClose}>ยกเลิก</button>
            <button
              className="primary-button"
              type="submit"
              disabled={submitting || !selectedLocation}
            >
              {submitting ? 'กำลังส่ง...' : 'ยืนยันส่งสำรวจ'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
