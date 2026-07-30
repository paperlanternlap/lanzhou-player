import { useState } from 'react'

const submissionTypes = [
  'โรลเพลย์',
  'เข้าร่วมกิจกรรม',
  'งานวาด / งานสร้างสรรค์',
  'ภารกิจ',
  'สำรวจ',
  'อื่น ๆ',
]

const statusLabels = {
  pending: 'รอตรวจ',
  revision: 'ส่งกลับแก้ไข',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function RoleSubmissionCard({
  submissions = [],
  onSubmit,
  loading = false,
}) {
  const visibleSubmissions = submissions.filter(
    (submission) => submission.status !== 'approved',
  )
  const [open, setOpen] = useState(false)
  const [roleUrl, setRoleUrl] = useState('')
  const [submissionType, setSubmissionType] = useState('โรลเพลย์')
  const [participantNames, setParticipantNames] = useState('')
  const [playerNote, setPlayerNote] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      const parsedUrl = new URL(roleUrl.trim())
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error()
    } catch {
      setError('กรุณาใส่ลิงก์ผลงานหรือหลักฐานที่ขึ้นต้นด้วย http:// หรือ https://')
      return
    }

    const result = await onSubmit({
      roleUrl: roleUrl.trim(),
      submissionType,
      participantNames: participantNames.trim(),
      playerNote: playerNote.trim(),
    })

    if (!result.ok) {
      setError(result.message)
      return
    }

    setRoleUrl('')
    setParticipantNames('')
    setPlayerNote('')
    setSubmissionType('โรลเพลย์')
    setOpen(false)
  }

  return (
    <>
      <section
        className={`panel role-submission-panel${visibleSubmissions.length ? '' : ' is-empty'}`}
      >
        <div className="panel-heading">
          <div>
            <span className="eyebrow">ส่งให้สต๊าฟตรวจ</span>
            <h2>ผลงานของฉัน</h2>
          </div>
          <button
            type="button"
            className="primary-button compact-button"
            onClick={() => setOpen(true)}
          >
            + ส่งผลงาน
          </button>
        </div>

        <div className="role-submission-list">
          {visibleSubmissions.length ? visibleSubmissions.slice(0, 3).map((submission) => (
            <article className="role-submission-row" key={submission.id}>
              <div>
                <a href={submission.role_url} target="_blank" rel="noreferrer">
                  {submission.submission_type}
                </a>
                <time>{formatDate(submission.submitted_at)}</time>
              </div>
              <span className={`role-status ${submission.status}`}>
                {statusLabels[submission.status] || submission.status}
              </span>
              {submission.staff_note && <p>{submission.staff_note}</p>}
            </article>
          )) : null}
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" onMouseDown={() => !loading && setOpen(false)}>
          <section
            className="dialog role-submission-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-submission-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close"
              type="button"
              aria-label="ปิด"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <span className="eyebrow">ส่งงานให้สต๊าฟตรวจ</span>
            <h2 id="role-submission-title">ส่งผลงานให้ตรวจ</h2>
            <p className="dialog-intro">
              แนบลิงก์ผลงานหรือหลักฐานหนึ่งครั้งต่อหนึ่งรายการ เมื่อสต๊าฟตรวจแล้วผลและคะแนนจะขึ้นที่หน้านี้
            </p>

            <form onSubmit={handleSubmit} className="role-submission-form">
              <label>
                ประเภทผลงาน
                <span className="select-control">
                  <select
                    value={submissionType}
                    onChange={(event) => setSubmissionType(event.target.value)}
                  >
                    {submissionTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </span>
              </label>
              <label>
                ลิงก์ผลงานหรือหลักฐาน
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={roleUrl}
                  onChange={(event) => setRoleUrl(event.target.value)}
                />
              </label>
              <label>
                ผู้ร่วมงาน
                <input
                  placeholder="ชื่อผู้ร่วมงานหรือผู้ร่วมกิจกรรม (ถ้ามี)"
                  value={participantNames}
                  onChange={(event) => setParticipantNames(event.target.value)}
                />
              </label>
              <label>
                หมายเหตุ
                <textarea
                  rows="3"
                  placeholder="รายละเอียดที่อยากแจ้งสต๊าฟ (ถ้ามี)"
                  value={playerNote}
                  onChange={(event) => setPlayerNote(event.target.value)}
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="role-submission-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? 'กำลังส่ง...' : 'ส่งเข้าคิวตรวจ'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
