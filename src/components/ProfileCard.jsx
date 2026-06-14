export default function ProfileCard({ character, onOpenExchange }) {
  function handleLogout() {
    localStorage.removeItem('characterId')
    window.location.href = '/login'
  }
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
          onClick={handleLogout}
          style={{
            border: '1px solid #e3d6bf',
            background: '#fff',
            borderRadius: '12px',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          ออกจากตำหนัก
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '8px',
        }}
      >
        <img
          src={character.avatar_url}
          alt={character.character_name}
          style={{
            width: '320px',
            height: '420px',
            border: '2px solid #d8c7a3',
            borderRadius: '16px',
            objectFit: 'cover',
            background: '#ece4d8',
          }}
        />
      </div>

      <h2
        style={{
          marginTop: '12px',
          marginBottom: '4px',
          textAlign: 'center',
        }}
      >
        {character.character_name}
      </h2>

      <div style={{ textAlign: 'center' }}>
        {character.role}
      </div>

      <div
        style={{
          color: '#777',
          marginTop: '4px',
          textAlign: 'center',
        }}
      >
        {character.position}
      </div>
    </div>
  )
}