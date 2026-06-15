import { useNavigate } from 'react-router-dom'

export default function ProfileCard({ character, onOpenExchange, onLogout }) {
  const navigate = useNavigate()
  function handleLogout() {
    if (onLogout) {
      onLogout()
    }
    navigate('/login', { replace: true })
  }
  return (
    <div
      style={{
        background: '#ffffff',
        border: '2px solid #111',
        borderRadius: '0',
        padding: '6px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '4px',
          marginBottom: '2px',
        }}
      >

        <button
          onClick={handleLogout}
          style={{
            border: '1px solid #111',
            background: '#fff',
            borderRadius: '0',
            padding: '3px 6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '10px',
          }}
        >
          ออกจากตำหนัก
        </button>
      </div>

      <div
        style={{
          width: '100%',
          marginTop: '4px',
        }}
      >
        <img
          src={character.avatar_url}
          alt={character.character_name}
          style={{
            width: '100%',
            height: '180px',
            border: '2px solid #111',
            borderRadius: '0',
            objectFit: 'cover',
            background: '#f5f5f5',
          }}
        />
      </div>

      <h2
        style={{
          marginTop: '6px',
          marginBottom: '0px',
          textAlign: 'center',
          borderTop: '2px solid #111',
          paddingTop: '6px',
          fontSize: '14px',
        }}
      >
        {character.character_name}
      </h2>

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>
        {character.role}
      </div>

      <div
        style={{
          color: '#555',
          marginTop: '4px',
          textAlign: 'center',
          fontSize: '11px',
        }}
      >
        {character.position}
      </div>
    </div>
  )
}