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
    label: 'คลังหลวง',
    eyebrow: 'ของที่มีอยู่ในวัง',
    title: 'เบิกจากคลังหลวง',
    description: 'ของใช้ ยาสามัญ ผ้า และของประจำตำหนัก เมื่อเบิกสำเร็จจะบันทึกเข้าคลังตัวละคร',
    emptyTitle: 'ยังไม่มีของที่เปิดให้เบิก',
    emptyDescription: 'เมื่อทีมงานเปิดรายการจากคลังหลวง ของที่ตัวละครเบิกได้จะปรากฏที่นี่',
  },
  {
    id: 'external_legal',
    label: 'จัดหานอกวัง',
    eyebrow: 'ของถูกกฎจากภายนอก',
    title: 'จัดหาของจากนอกวัง',
    description: 'ชำระด้วยแต้มตามที่ระบุ แล้วรอส่งเข้าวัง ผู้มีสิทธิ์จะออกคำสั่งจากตำหนัก ส่วนตำแหน่งอื่นใช้หน่วยจัดซื้อ',
    emptyTitle: 'ยังไม่มีของจากนอกวัง',
    emptyDescription: 'รายการที่สั่งจัดหาได้พร้อมระยะเวลารอรับจะปรากฏในส่วนนี้',
  },
  {
    id: 'restricted',
    label: 'ซื้อจาก NPC',
    eyebrow: 'ผู้ติดต่อที่รู้จัก',
    title: 'ซื้อของจาก NPC',
    description: 'เลือกผู้ติดต่อที่ตัวละครรู้จักเพื่อดูสิ่งที่เขาจัดหาได้ บางรายการต้องเสี่ยงทอยก่อนตกลงซื้อ',
    emptyTitle: 'ยังไม่มีของจากผู้ติดต่อคนนี้',
    emptyDescription: 'เมื่อปลดล็อกความสัมพันธ์หรือ NPC เปิดของชิ้นใหม่ รายการจะปรากฏที่นี่',
  },
  {
    id: 'followers',
    label: 'ผู้ติดตาม',
    eyebrow: 'คนรับใช้และผู้ช่วย',
    title: 'รับผู้ติดตามเข้าสังกัด',
    description: 'ใช้แต้ม RP รับคนเข้าประจำตำหนัก แต่ละคนมีหน้าที่ ความถนัด และข้อจำกัดต่างกัน',
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
