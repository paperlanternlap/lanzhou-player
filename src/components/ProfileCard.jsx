export default function ProfileCard({ character }) {
  return (
    <section className="panel profile-card">
      <div className="profile-card__main">
        <div className="profile-avatar">
          {character.avatar_url ? (
            <img src={character.avatar_url} alt={character.character_name} />
          ) : (
            <span>{character.character_name?.slice(0, 1) || 'ห'}</span>
          )}
        </div>
        <div className="profile-copy">
          <span className="eyebrow">บัญชีตัวละคร</span>
          <h1>{character.character_name}</h1>
          <div className="profile-details">
            <span>{character.position || 'ยังไม่มีตำแหน่ง'}</span>
            <span>ตำหนัก {character.palace || 'ยังไม่ระบุ'}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
