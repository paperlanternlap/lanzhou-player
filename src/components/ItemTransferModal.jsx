import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function ItemTransferModal({
  item,
  currentCharacterId,
  onClose,
  onTransferred,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cleanQuery = query.trim()
    if (cleanQuery.length < 2) {
      return undefined
    }

    const timer = window.setTimeout(async () => {
      setSearching(true)
      const { data, error: searchError } = await supabase.rpc(
        'search_item_transfer_recipients',
        {
          p_sender_character_id: currentCharacterId,
          p_query: cleanQuery,
          p_limit: 8,
          p_offset: 0,
        },
      )
      setSearching(false)
      if (searchError) {
        setError('ค้นหาผู้รับไม่สำเร็จ กรุณาลองอีกครั้ง')
        setResults([])
        return
      }
      setResults(data || [])
    }, 300)

    return () => window.clearTimeout(timer)
  }, [currentCharacterId, query])

  async function submit(event) {
    event.preventDefault()
    if (!selected || quantity < 1 || quantity > item.quantity) return

    setSubmitting(true)
    setError('')
    const { error: transferError } = await supabase.rpc(
      'transfer_character_item',
      {
        p_sender_character_id: currentCharacterId,
        p_recipient_character_id: selected.id,
        p_item_id: item.item_id,
        p_quantity: quantity,
      },
    )
    setSubmitting(false)

    if (transferError) {
      setError(
        transferError.message?.includes('Insufficient')
          ? 'จำนวนไอเท็มในคลังไม่เพียงพอ กรุณารีเฟรชหน้า'
          : transferError.message?.includes('not transferable')
            ? 'ไอเท็มชิ้นนี้ไม่สามารถโอนได้'
            : 'โอนไอเท็มไม่สำเร็จ กรุณาลองอีกครั้ง',
      )
      return
    }

    await onTransferred?.()
  }

  return (
    <div className="modal-backdrop transfer-backdrop" onMouseDown={onClose}>
      <section
        className="dialog transfer-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="ปิด" onClick={onClose}>
          ×
        </button>

        <span className="eyebrow">ส่งไอเท็มให้ผู้เล่น</span>
        <h2 id="transfer-title">{item.item_name ?? item.name}</h2>
        <p className="dialog-intro">มีในคลัง {item.quantity} ชิ้น</p>

        <form onSubmit={submit}>
          <label>
            ค้นหาตัวละครหรือ Username
            <input
              autoFocus
              value={query}
              placeholder="พิมพ์อย่างน้อย 2 ตัวอักษร"
              onChange={(event) => {
                setQuery(event.target.value)
                setSelected(null)
                setResults([])
                setError('')
              }}
            />
          </label>

          <div className="recipient-results">
            {searching && <p className="recipient-message">กำลังค้นหา...</p>}
            {!searching && query.trim().length >= 2 && !results.length && (
              <p className="recipient-message">ไม่พบตัวละครที่ค้นหา</p>
            )}
            {results.map((character) => (
              <button
                key={character.id}
                type="button"
                className={`recipient-option ${selected?.id === character.id ? 'selected' : ''}`}
                onClick={() => setSelected(character)}
              >
                <span className="recipient-avatar">
                  {character.avatar_url ? (
                    <img src={character.avatar_url} alt="" />
                  ) : (
                    character.character_name?.slice(0, 1)
                  )}
                </span>
                <span>
                  <strong>{character.character_name}</strong>
                  <small>
                    {[character.player_name, character.username && `@${character.username}`, character.position]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                </span>
                <i>{selected?.id === character.id ? 'เลือกแล้ว' : 'เลือก'}</i>
              </button>
            ))}
          </div>

          {selected && (
            <div className="transfer-confirmation">
              <div>
                <span>ผู้รับ</span>
                <strong>{selected.character_name}</strong>
                <small>{selected.username ? `@${selected.username}` : selected.player_name}</small>
              </div>
              <label>
                จำนวน
                <input
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </label>
            </div>
          )}

          <p className="form-hint">ตรวจสอบชื่อผู้รับให้ถูกต้อง เมื่อยืนยันแล้วไม่สามารถยกเลิกเองได้</p>
          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              ยกเลิก
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={!selected || submitting || quantity < 1 || quantity > item.quantity}
            >
              {submitting ? 'กำลังส่ง...' : 'ยืนยันการส่ง'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
