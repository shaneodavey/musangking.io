// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

;(async () => {
  try {
    // Dynamically import App so any error in App or its imports is caught here
    const { default: App } = await import('@/App.jsx')

    const root = document.getElementById('root')
    if (!root) {
      throw new Error('No element with id="root" found in index.html')
    }

    ReactDOM.createRoot(root).render(<App />)
  } catch (e) {
    document.body.innerHTML =
      '<pre style="white-space:pre-wrap;padding:1rem;color:red;font-size:14px;">'
      + (e && e.stack ? e.stack : String(e))
      + '</pre>'
    console.error(e)
  }
})()
