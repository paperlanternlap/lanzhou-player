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
    emptyTitle: 'ยังไม่มีของที่เปิดให้เบิก',
    emptyDescription: 'เมื่อทีมงานเปิดรายการจากคลังหลวง ของที่ตัวละครเบิกได้จะปรากฏที่นี่',
  },
  {
    id: 'external_legal',
    label: 'สั่งนอกวัง',
    eyebrow: 'ของสั่ง',
    title: 'สั่งของจากนอกวัง',
    description: 'ชำระแต้มแล้วรอรับตามเวลาที่ระบุในแต่ละรายการ',
    emptyTitle: 'ยังไม่มีของจากนอกวัง',
    emptyDescription: 'รายการที่สั่งจัดหาได้พร้อมระยะเวลารอรับจะปรากฏในส่วนนี้',
  },
  {
    id: 'restricted',
    label: 'ของจาก NPC',
    eyebrow: 'ผู้ติดต่อ',
    title: 'ซื้อจากคนรู้จัก',
    description: 'เลือก NPC เพื่อดูของที่ซื้อได้ บางรายการต้องทอยเจรจา',
    emptyTitle: 'ยังไม่มีของจากผู้ติดต่อคนนี้',
    emptyDescription: 'เมื่อปลดล็อกความสัมพันธ์หรือ NPC เปิดของชิ้นใหม่ รายการจะปรากฏที่นี่',
  },
  {
    id: 'followers',
    label: 'ผู้ติดตาม',
    eyebrow: 'คนว่าง',
    title: 'รับเข้าตำหนัก',
    description: 'ดูหน้าที่และความถนัดก่อนใช้ RP รับเข้าตำหนัก',
    emptyTitle: 'ยังไม่มีผู้ติดตามที่รับเข้าสังกัดได้',
    emptyDescription: 'เมื่อมีผู้ติดตามเปิดรับ ชื่อและความถนัดของพวกเขาจะปรากฏในส่วนนี้',
  },
]

export function formatShopDeliveryWindow(minimum, maximum) {
  const min = Number(minimum || 0)
  const max = Math.max(min, Number(maximum || 0))
  if (max === 0) return 'ส่งเข้าคลังภายในวันนี้'
  if (min === max) return `คาดว่าจะส่งเข้าคลังในอีก ${max.toLocaleString('th-TH')} วันจริง`
  return `คาดว่าจะส่งเข้าคลังในอีก ${min.toLocaleString('th-TH')}–${max.toLocaleString('th-TH')} วันจริง`
}
