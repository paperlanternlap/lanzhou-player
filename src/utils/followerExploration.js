function normalizeAccessValue(value) {
  return String(value || '').trim().toLocaleLowerCase('th')
}

export function canFollowerAccessLocation(follower, location) {
  const accessAreas = (follower.access_areas || []).map(normalizeAccessValue)
  if (!accessAreas.length) return false

  return [
    location.short_name,
    location.name,
    location.category,
    location.code,
  ]
    .map(normalizeAccessValue)
    .some((value) => value && accessAreas.includes(value))
}
