import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { PALACE_LOCATIONS, findMapLocation } from '../src/data/palaceMap.js'

test('49 map points keep 27 and 29 while splitting the old 25 into 25 and 29.1', () => {
  assert.equal(PALACE_LOCATIONS.length, 49)
  assert.equal(new Set(PALACE_LOCATIONS.map((point) => point.label)).size, 49)
  assert.equal(PALACE_LOCATIONS.filter((point) => point.layer === 'buildings').length, 36)
  assert.equal(PALACE_LOCATIONS.find((point) => point.label === '25').code, 'outer_kitchen_supplies')
  assert.equal(PALACE_LOCATIONS.find((point) => point.label === '18').name, 'ตำหนักจิ่งเฉิน')
  assert.equal(PALACE_LOCATIONS.find((point) => point.label === '27').code, 'registry_bureau')
  assert.equal(PALACE_LOCATIONS.find((point) => point.label === '29').code, 'rites_bureau')
  assert.equal(PALACE_LOCATIONS.find((point) => point.label === '29.1').code, 'jingtian_palace')
  assert.equal(PALACE_LOCATIONS.some((point) => point.label === '27.1'), false)
  assert.equal(PALACE_LOCATIONS.findIndex((point) => point.label === '29.1'), PALACE_LOCATIONS.findIndex((point) => point.label === '29') + 1)
  for (const point of PALACE_LOCATIONS) {
    assert.ok(point.x > 0 && point.x < 100 && point.y > 0 && point.y < 100)
    assert.ok(point.name && point.code && point.summary)
  }
  const point = PALACE_LOCATIONS.find((entry) => entry.label === '15')
  // Old zone 15 must not accidentally mean map point 15.
  assert.equal(findMapLocation([{ zone_number: 15, code: 'unrelated' }], point), undefined)
  assert.equal(findMapLocation([{ id: 1, map_label: '15' }], point).id, 1)
  assert.equal(findMapLocation([{ id: 2, code: 'medical_bureau' }], point).id, 2)
})

test('both image layers render selectable pins and the public page never offers an enabled dispatch', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { default: Map } = await server.ssrLoadModule('/src/components/PalaceMap.jsx')
    const buildings = renderToStaticMarkup(createElement(Map, { selectedLabel: '15', onSelect() {} }))
    assert.equal((buildings.match(/class="palace-map-pin/g) || []).length, 36)
    assert.match(buildings, /palace-buildings\.png/)
    assert.match(buildings, /aria-label="15 /)
    const gates = renderToStaticMarkup(createElement(Map, { selectedLabel: 'G', onSelect() {} }))
    assert.equal((gates.match(/class="palace-map-pin/g) || []).length, 13)
    assert.match(gates, /palace-gates\.png/)
    const { default: Exploration } = await server.ssrLoadModule('/src/pages/Exploration.jsx')
    const page = renderToStaticMarkup(createElement(MemoryRouter, {}, createElement(Exploration, { characterId: null })))
    assert.match(page, /สำรวจพระราชวังหลัวอัน/)
    assert.match(page, /disabled="" type="submit"/)
    assert.doesNotMatch(page, /สุ่มเลขไอเท็ม/)
    for (const name of ['palace-buildings.png', 'palace-gates.png']) {
      const bytes = await readFile(new URL(`../public/maps/${name}`, import.meta.url))
      assert.equal(bytes.readUInt32BE(16), 3372)
      assert.equal(bytes.readUInt32BE(20), 2173)
    }
  } finally { await server.close() }
})
