

import { useEffect, useState } from 'react'

export function useAuth() {
  const [characterId, setCharacterId] = useState(() => {
    const stored = localStorage.getItem('characterId')

    if (!stored || stored === 'null' || stored === 'undefined') {
      return null
    }

    const id = Number(stored)
    return Number.isFinite(id) && id > 0 ? id : null
  })

  useEffect(() => {
    const syncAuth = () => {
      const stored = localStorage.getItem('characterId')

      if (!stored || stored === 'null' || stored === 'undefined') {
        setCharacterId(null)
        return
      }

      const id = Number(stored)
      setCharacterId(Number.isFinite(id) && id > 0 ? id : null)
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