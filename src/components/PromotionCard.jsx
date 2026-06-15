export default function PromotionCard({ character, onPromote }) {
  const currentFavor = character?.favor ?? 0
  const requiredFavor = character?.favor_required ?? 0
  const nextPosition = character?.next_position

  console.log('PROMOTION CARD', character)

  const progress = requiredFavor
    ? Math.min((currentFavor / requiredFavor) * 100, 100)
    : 0

  const remaining = Math.max(requiredFavor - currentFavor, 0)

  return (
    <div
      style={{
        background: '#ffffff',
        border: '2px solid #111',
        borderRadius: '0',
        padding: '12px',
        marginTop: '12px',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: '10px',
          borderBottom: '2px solid #111',
          paddingBottom: '6px',
          fontSize: '15px',
        }}
      >
        เลื่อนขั้น
      </h3>

      {nextPosition ? (
        <>
          <div style={{ fontSize: '12px', textAlign: 'center' }}>
            ตำแหน่งปัจจุบัน: {character?.position}
          </div>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginTop: '4px',
              marginBottom: '8px',
            }}
          >
            ตำแหน่งถัดไป: {nextPosition}
          </div>

          <div style={{ fontSize: '12px', textAlign: 'center' }}>
            โปรดปราน {currentFavor} / {requiredFavor}
          </div>

          <div
            style={{
              height: '6px',
              background: '#e5e5e5',
              borderRadius: '0',
              border: '1px solid #111',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#111',
                borderRadius: '0',
              }}
            />
          </div>

          {remaining > 0 ? (
            <div style={{ marginTop: '8px', color: '#555', fontSize: '12px', textAlign: 'center' }}>
              อีก {remaining} แต้มจะเลื่อนขั้นได้
            </div>
          ) : (
            <button
              onClick={onPromote}
              style={{
                width: '100%',
                marginTop: '10px',
                border: '1px solid #111',
                background: '#111',
                color: '#fff',
                padding: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              เลื่อนขั้น
            </button>
          )}
        </>
      ) : (
        <div style={{ fontSize: '12px' }}>
          ตำแหน่งปัจจุบันเป็นตำแหน่งสูงสุดแล้ว
        </div>
      )}
    </div>
  )
}