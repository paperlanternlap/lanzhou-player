import { useState } from 'react'

const statusLabels = {
  submitted: 'รอตรวจ',
  approved: 'อนุมัติแล้ว',
  awaiting_roll: 'รอทอยจัดหา',
  risk_review: 'รอสรุปผลความเสี่ยง',
  procuring: 'กำลังจัดหา',
  ready: 'พร้อมส่งมอบ',
  completed: 'เข้าคลังแล้ว',
  rejected: 'ไม่อนุมัติ',
  cancelled: 'ยกเลิก',
}

const routeLabels = {
  requisition: 'เบิกจากคลัง',
  procurement: 'จัดซื้อภายนอก',
  command: 'คำสั่งจัดซื้อ',
  restricted_contact: 'ซื้อจาก NPC',
}

const outcomeLabels = {
  critical_success: 'สำเร็จอย่างงดงาม',
  success: 'เจรจาสำเร็จ',
  failure: 'เจรจาไม่สำเร็จ',
  critical_failure: 'ผิดพลาดร้ายแรง',
}

function getRiskTarget(riskLevel) {
  if (riskLevel === 3) return 50
  if (riskLevel === 4) return 65
  if (riskLevel >= 5) return 80
  return null
}

export default function AcquisitionStatusCard({ requests = [], onAcknowledge }) {
  const [page, setPage] = useState(0)
  const visible = requests.filter((request) => request.status !== 'completed')

  if (!visible.length) return null
  const safePage = Math.min(page, visible.length - 1)
  const currentRequest = visible[safePage]

  return (
    <section className="panel role-submission-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ติดตามการจัดหา</span>
          <h2>คำขอไอเท็ม</h2>
        </div>
      </div>
      <div className="role-submission-list">
        {[currentRequest].map((request) => (
          <article className="role-submission-row" key={request.id}>
            <div>
              <strong>{request.item_name} ×{request.quantity}</strong>
              <time>{routeLabels[request.request_route] || request.request_route}</time>
            </div>
            <span className={`role-status ${request.status}`}>
              {statusLabels[request.status] || request.status}
            </span>
            {request.auto_delivery && request.available_at && (
              <p>
                กำหนดเข้าคลัง {new Date(request.available_at).toLocaleString('th-TH')}
              </p>
            )}
            {request.staff_note && <p>{request.staff_note}</p>}
            {request.acquisition_channel_name && (
              <p>NPC: {request.acquisition_channel_name}</p>
            )}
            {request.request_route === 'restricted_contact' && request.resolution_roll && (
              <p>
                {request.npc_opposed_roll
                  ? `NPC ${request.npc_opposed_roll} ปะทะ ผู้เล่น ${request.resolution_roll}`
                  : getRiskTarget(request.acquisition_risk_level)
                    ? `เกณฑ์มากกว่า ${getRiskTarget(request.acquisition_risk_level)} · ผู้เล่น ${request.resolution_roll}`
                    : `ผู้เล่นทอยได้ ${request.resolution_roll}`}
                {' · '}{outcomeLabels[request.resolution_outcome] || request.resolution_outcome}
              </p>
            )}
            {['rejected', 'cancelled'].includes(request.status) && (
              <button
                className="acquisition-acknowledge"
                type="button"
                onClick={() => onAcknowledge?.(request.id)}
              >
                รับทราบ
              </button>
            )}
          </article>
        ))}
      </div>
      {visible.length > 1 && (
        <nav className="acquisition-pagination" aria-label="เปลี่ยนหน้าคำขอไอเท็ม">
          <button
            type="button"
            aria-label="คำขอก่อนหน้า"
            disabled={safePage === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            ‹
          </button>
          <span>{safePage + 1} / {visible.length}</span>
          <button
            type="button"
            aria-label="คำขอถัดไป"
            disabled={safePage === visible.length - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            ›
          </button>
        </nav>
      )}
    </section>
  )
}
