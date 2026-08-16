export function formatNumber(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

export function formatDeliveryWindow(minimum, maximum) {
  const min = Number(minimum || 0)
  const max = Math.max(min, Number(maximum || 0))
  if (max <= 0) return 'รับของได้ทันที'
  if (min === max) return `ใช้เวลา ${max} วันจริง`
  return `ใช้เวลา ${min}–${max} วันจริง`
}
