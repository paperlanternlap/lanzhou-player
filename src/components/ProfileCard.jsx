export default function ProfileCard({ onOpenExchange }) {
  return (
    <div
      style={{
        background: '#fcfaf6',
        border: '1px solid #e3d6bf',
        borderRadius: '20px',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <button
          onClick={onOpenExchange}
          style={{
            border: '1px solid #e3d6bf',
            background: '#fff',
            borderRadius: '12px',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          แลกคะแนน
        </button>

        <button
          style={{
            border: '1px solid #e3d6bf',
            background: '#fff',
            borderRadius: '12px',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          ⚙️
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            width: '320px',
            height: '420px',
            background: '#ece4d8',
            border: '2px solid #d8c7a3',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9b8a6a',
            fontSize: '14px',
          }}
        >
          รูปตัวละคร
        </div>
      </div>

      <h2
        style={{
          marginTop: '12px',
          marginBottom: '4px',
          textAlign: 'center',
        }}
      >
        หลินหว่านอิง
      </h2>

      <div style={{ textAlign: 'center' }}>
        นางกำนัลชั้นกลาง
      </div>

      <div
        style={{
          color: '#777',
          marginTop: '4px',
          textAlign: 'center',
        }}
      >
        ตำหนักฮวาชิง
      </div>
    </div>
  )
}