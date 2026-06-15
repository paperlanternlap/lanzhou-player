

import { useEffect, useState } from 'react'

export function useAuth() {
  const [characterId, setCharacterId] = useState(() => {
    return Number(localStorage.getItem('characterId')) || null
  })

  useEffect(() => {
    const syncAuth = () => {
      const id = Number(localStorage.getItem('characterId')) || null
      setCharacterId(id)
    }

    // sync from other tabs
    window.addEventListener('storage', syncAuth)

    // sync from same tab custom events
    window.addEventListener('auth-change', syncAuth)

    // sync on focus (important for GitHub pages / tab switch issues)
    window.addEventListener('focus', syncAuth)

    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('auth-change', syncAuth)
      window.removeEventListener('focus', syncAuth)
    }
  }, [])

  const login = (id) => {
    localStorage.setItem('characterId', String(id))
    setCharacterId(Number(id))
    window.dispatchEvent(new Event('auth-change'))
  }

  const logout = () => {
    localStorage.removeItem('characterId')
    setCharacterId(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  return {
    characterId,
    login,
    logout,
  }
}