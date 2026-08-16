import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const recoveryKey = 'lanzhou-player-chunk-recovery'
  if (sessionStorage.getItem(recoveryKey)) return
  sessionStorage.setItem(recoveryKey, '1')
  window.location.reload()
})
window.setTimeout(() => sessionStorage.removeItem('lanzhou-player-chunk-recovery'), 10_000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
