export const SHOP_PAGE_SIZE = 4

export const followerTypeLabels = {
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

export const shopSections = [
  {
    id: 'palace_stock',
    label: 'ของในคลัง',
    eyebrow: 'คลังหลวง',
    title: 'เบิกของจากคลัง',
    description: 'ของใช้และยาสามัญ เบิกแล้วเข้าคลังตัวละครทันที',
    emptyTitle: 'ขณะนี้ยังไม่มีรายการให้เบิก',
    emptyDescription: 'ลองดูหมวดอื่น หรือกลับมาตรวจสอบอีกครั้งหลังทีมงานอัปเดตคลัง',
  },
  {
    id: 'external_legal',
    label: 'สั่งนอกวัง',
    eyebrow: 'ของสั่ง',
    title: 'สั่งของจากนอกวัง',
    description: 'ชำระแต้มแล้วรอรับตามเวลาที่ระบุในแต่ละรายการ',
    emptyTitle: 'ขณะนี้ยังไม่มีรายการสั่งจากนอกวัง',
    emptyDescription: 'ลองดูหมวดอื่น หรือกลับมาตรวจสอบอีกครั้งเมื่อมีรายการใหม่',
  },
  {
    id: 'restricted',
    label: 'ผู้ติดต่อ',
    eyebrow: 'ผู้ติดต่อ',
    title: 'ซื้อผ่านผู้ติดต่อ',
    description: 'เลือกผู้ติดต่อเพื่อดูสิ่งของที่จัดหาได้ บางรายการอาจต้องเจรจา',
    emptyTitle: 'ผู้ติดต่อนี้ยังไม่มีรายการให้ซื้อ',
    emptyDescription: 'ลองเลือกผู้ติดต่อคนอื่น หรือกลับมาตรวจสอบอีกครั้งเมื่อมีรายการใหม่',
  },
  {
    id: 'followers',
    label: 'ผู้ติดตาม',
    eyebrow: 'คนว่าง',
    title: 'รับเข้าตำหนัก',
    description: 'ดูหน้าที่และความถนัดก่อนใช้ RP รับเข้าตำหนัก',
    emptyTitle: 'ขณะนี้ยังไม่มีผู้ติดตามที่เปิดรับ',
    emptyDescription: 'กลับมาตรวจสอบอีกครั้งเมื่อมีผู้ติดตามรายใหม่เปิดรับเข้าตำหนัก',
  },
]

export function formatShopDeliveryWindow(minimum, maximum) {
  const min = Number(minimum || 0)
  const max = Math.max(min, Number(maximum || 0))
  if (max === 0) return 'ส่งเข้าคลังภายในวันนี้'
  if (min === max) return `คาดว่าจะส่งเข้าคลังในอีก ${max.toLocaleString('th-TH')} วันจริง`
  return `คาดว่าจะส่งเข้าคลังในอีก ${min.toLocaleString('th-TH')}–${max.toLocaleString('th-TH')} วันจริง`
}
