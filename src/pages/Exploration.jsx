import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PalaceMap from '../components/PalaceMap'
import { PALACE_LOCATIONS, findMapLocation } from '../data/palaceMap'
import { canFollowerAccessLocation } from '../utils/followerExploration'
import { getPlayerFollowers } from '../services/playerService'
import { explorationError, getExplorationHistory, getExplorationMap, startMapExploration } from '../services/explorationService'
import './exploration.css'

export default function Exploration({ characterId, onChanged, initialFollowerId }) {
  const [locations, setLocations] = useState([])
  const [followers, setFollowers] = useState([])
  const [history, setHistory] = useState([])
  const [selectedLabel, setSelectedLabel] = useState('14')
  const [actor, setActor] = useState(initialFollowerId ? String(initialFollowerId) : 'self')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mapError, setMapError] = useState(false)
  const [peopleError, setPeopleError] = useState(false)
  const [notice, setNotice] = useState('')
  const [panelTab, setPanelTab] = useState('place')
  const request = useRef(null)
  const pending = useRef(false)

  function selectPoint(label) {
    setSelectedLabel(label)
    setPanelTab('place')
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [map, people, missions] = await Promise.all([
        getExplorationMap(characterId),
        characterId ? getPlayerFollowers(characterId) : Promise.resolve({ data: [] }),
        characterId ? getExplorationHistory(characterId) : Promise.resolve({ data: [] }),
      ])
      setLocations(map.data || [])
      setFollowers(people.data || [])
      setHistory(missions.data || [])
      setMapError(Boolean(map.error))
      setPeopleError(Boolean(people.error))
      setError(missions.error ? 'โหลดประวัติการสำรวจไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ' : '')
    } catch {
      setMapError(true)
      setPeopleError(true)
      setError('เชื่อมต่อไม่ได้ กรุณารีเฟรชหน้าเว็บ')
    } finally { setLoading(false) }
  }, [characterId])

  useEffect(() => {
    const timer = setTimeout(() => { void load() }, 0)
    return () => clearTimeout(timer)
  }, [load])

  const point = PALACE_LOCATIONS.find((entry) => entry.label === selectedLabel)
  const location = findMapLocation(locations, point)
  const readyFollowers = followers.filter((follower) => follower.active && follower.status?.trim() === 'idle')
  const eligibleFollowers = location ? readyFollowers.filter((follower) => canFollowerAccessLocation(follower, location)) : []
  const selectedFollower = actor === 'self' ? null : followers.find((follower) => String(follower.id) === actor)
  const talentModifier = selectedFollower?.talents?.filter((talent) => location?.tags?.includes(talent.talent_key))
    .reduce((total, talent) => total + Number(talent.modifier_percent || 0), 0) || 0
  const previewChance = location && (actor === 'self' || Array.isArray(selectedFollower?.talents))
    ? Math.max(5, Math.min(95, Math.round(Number(location.base_success_percent || 60) * (1 + talentModifier / 100))))
    : null
  const activeMission = history.find((mission) => mission.status === 'exploring' &&
    (actor === 'self' ? mission.follower_id == null : String(mission.follower_id) === actor))
  const selfBusy = history.some((mission) => mission.follower_id == null && mission.status === 'exploring')
  const selfAllowed = location?.can_explore_self === true && !selfBusy
  const actorAllowed = actor === 'self' ? selfAllowed : eligibleFollowers.some((person) => String(person.id) === actor)
  const canStart = Boolean(characterId && location?.active && actorAllowed && !loading && !mapError && (actor === 'self' || !peopleError))
  const blockedReason = !characterId ? 'กรุณาเข้าสู่ระบบก่อนส่งสำรวจ'
    : mapError ? 'โหลดข้อมูลพื้นที่ไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ'
    : !location?.active ? 'พื้นที่นี้ยังไม่เปิดให้สำรวจ'
    : actor === 'self' ? selfBusy ? 'ตัวละครนี้มีงานสำรวจที่รอผลอยู่' : !selfAllowed ? 'ตัวละครนี้ยังไม่ได้รับสิทธิ์เข้าพื้นที่นี้' : ''
    : peopleError ? 'โหลดข้อมูลผู้ติดตามไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ'
    : !actorAllowed ? 'ผู้ติดตามคนนี้ไม่ว่างหรือยังไม่ได้รับสิทธิ์เข้าพื้นที่นี้' : ''
  const availableLabels = PALACE_LOCATIONS.filter((entry) => {
    const place = findMapLocation(locations, entry)
    return place?.active && (place.can_explore_self || readyFollowers.some((follower) => canFollowerAccessLocation(follower, place)))
  }).map((entry) => entry.label)
  const filteredPoints = PALACE_LOCATIONS.filter((entry) => `${entry.label} ${entry.name} ${entry.category}`.toLocaleLowerCase('th').includes(search.trim().toLocaleLowerCase('th')))

  async function submit(event) {
    event.preventDefault()
    if (!canStart || pending.current) return
    pending.current = true
    setBusy(true)
    setNotice('')
    const key = `${characterId}:${actor}:${location.id}`
    if (request.current?.key !== key) request.current = { key, id: crypto.randomUUID() }
    try {
      const result = await startMapExploration({ characterId, followerId: actor === 'self' ? null : Number(actor), locationId: location.id, requestId: request.current.id })
      if (result.error) {
        setNotice(explorationError(result.error))
        return
      }
      request.current = null
      setNotice('ออกสำรวจแล้ว รอสต๊าฟตอบกลับ')
      await load()
      await onChanged?.()
    } catch { setNotice('ยังยืนยันผลไม่ได้ ลองอีกครั้งได้โดยไม่สร้างงานซ้ำ') }
    finally { pending.current = false; setBusy(false) }
  }

  return (
    <main className="exploration-page">
      <header className="exploration-header">
        <div><span className="eyebrow">LUO'AN PALACE</span><h1>สำรวจพระราชวังหลัวอัน</h1><p>ขั้นตอนและวิธีการสำรวจ ทำตามดังนี้</p></div>
        <Link className="secondary-button exploration-back-button" onClick={() => onChanged?.()} to={characterId ? '/dashboard' : '/login'}>{characterId ? 'กลับตำหนัก / กระเป๋า' : 'เข้าสู่ระบบเพื่อสำรวจ'}</Link>
      </header>
      <ol className="exploration-steps"><li><b>1</b> เลือกสถานที่</li><li><b>2</b> เลือกส่งผู้ติดตามหรือไปด้วยตัวเอง</li><li><b>3</b> รอผลจากสต๊าฟ</li></ol>
      <div className="exploration-workspace">
        <div className="exploration-map-pane"><PalaceMap selectedLabel={selectedLabel} onSelect={selectPoint} availableLabels={availableLabels} />

        </div>
        <aside className="exploration-sidebar">
          <nav className="exploration-panel-tabs" aria-label="ข้อมูลการสำรวจ">
            <button type="button" aria-pressed={panelTab === 'place'} onClick={() => setPanelTab('place')}>จุดที่เลือก</button>
            <button type="button" aria-pressed={panelTab === 'directory'} onClick={() => setPanelTab('directory')}>ค้นหาจุด</button>
            <button type="button" aria-pressed={panelTab === 'history'} onClick={() => setPanelTab('history')}>ประวัติ</button>
          </nav>
          <div className="exploration-panel-content">
          {panelTab === "place" && <section className="exploration-place">
            <span className="eyebrow">{point.layer === 'gates' ? 'ประตูและป้อม' : 'ตำหนักและอาคาร'} · {point.label}</span>
            <h2>{location?.name || point.name}</h2>
            <p className="exploration-place-description">{location ? (location.summary || 'ยังไม่มีคำอธิบายพื้นที่') : 'พื้นที่นี้ยังไม่เปิดให้สำรวจ'}</p>
            <span className={`exploration-status ${location?.active ? 'completed' : 'cancelled'}`}>{location?.active ? 'เปิดสำรวจ' : 'ยังไม่เปิดสำรวจ'}</span>
            <form onSubmit={submit}>
              <label>เลือกตัวละคร<select value={actor} onChange={(event) => setActor(event.target.value)} disabled={busy}>
                <option value="self">ไปด้วยตัวเอง{selfBusy ? ' · มีงานค้าง' : !selfAllowed ? ' · ยังไม่มีสิทธิ์เข้าพื้นที่' : ''}</option>
                {followers.map((person) => <option key={person.id} value={person.id} disabled={!eligibleFollowers.some((eligible) => eligible.id === person.id)}>{person.name}{person.status?.trim() !== 'idle' ? ' · ไม่ว่าง' : !eligibleFollowers.some((eligible) => eligible.id === person.id) ? ' · เข้าที่นี่ไม่ได้' : ''}</option>)}
              </select></label>
              {location?.active && actorAllowed && previewChance != null && <p className="exploration-chance">โอกาสสำรวจสำเร็จ {previewChance}%</p>}
              <button className="primary-button" disabled={!canStart || busy} type="submit">{busy ? 'กำลังส่งสำรวจ…' : actor === 'self' ? 'สำรวจ' : 'ส่งผู้ติดตามสำรวจ'}</button>
              {!loading && blockedReason && !activeMission && <p className="exploration-blocked-reason" role="status">{blockedReason}</p>}
              {activeMission ? <p role="status" className="exploration-progress"><span aria-hidden="true" />กำลังสำรวจ{activeMission.destination ? ` ${activeMission.destination}` : ''} · รอสต๊าฟตอบกลับ</p>
                : notice && <p role="status" className="exploration-notice">{notice}</p>}
            </form>
            <p className="exploration-access-note">*หากผู้เล่นมีสิทธิ์เข้าพื้นที่แต่ระบบขึ้นไม่มีสิทธิ์สามารถติดต่อสต๊าฟเพื่อแก้ไขหรือส่งคำร้องไว้ได้</p>
          </section>}
          {panelTab === "directory" && <section className="exploration-directory"><label>ค้นหาสถานที่<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ชื่อสถานที่ หรือหมายเลข เช่น 15" /></label>
            <div className="exploration-place-list">{filteredPoints.map((entry) => <button type="button" key={entry.label} aria-pressed={selectedLabel === entry.label} onClick={() => selectPoint(entry.label)}><b>{entry.label}</b><span>{entry.name}</span>{availableLabels.includes(entry.label) && <small>ไปได้</small>}</button>)}{!filteredPoints.length && <p>ไม่พบสถานที่</p>}</div>
          </section>}
          {panelTab === "history" && (
          <section className="exploration-history">
            <header><h2>บันทึกการสำรวจ</h2></header>
            <p className="exploration-history-refresh">รีเฟรชหน้าเว็บเพื่อดูผลการสำรวจล่าสุด</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            {!characterId ? <p>เข้าสู่ระบบเพื่อดูภารกิจของคุณ</p> : !history.length ? <p>ยังไม่มีภารกิจ เริ่มจากเลือกสถานที่บนแผนที่</p> : history.slice(0, 10).map((mission) => (
              <article key={mission.id}>
                <div><strong>{mission.destination}</strong><small>{mission.follower_id == null ? 'ไปด้วยตัวเอง' : followers.find((person) => person.id === mission.follower_id)?.name || 'ผู้ติดตาม'} · {new Date(mission.started_at).toLocaleDateString('th-TH')}</small></div>
                <span className={`exploration-status ${mission.status}`}>{mission.status === 'completed' ? 'สต๊าฟสรุปผลแล้ว' : mission.status === 'cancelled' ? 'ยกเลิก' : 'กำลังสำรวจ · รอสต๊าฟ'}</span>
                {mission.result_summary && <p>{mission.result_summary}</p>}
                {mission.reward_item_name && <p className="exploration-reward">เข้ากระเป๋าแล้ว: {mission.reward_item_name} ×{mission.reward_quantity} <Link to="/dashboard" onClick={() => onChanged?.()}>เปิดกระเป๋า</Link></p>}
              </article>
            ))}
          </section>
          )}
          </div>
        </aside>
      </div>
    </main>
  )
}
