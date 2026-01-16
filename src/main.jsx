import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

try {
  const root = document.getElementById('root')
  ReactDOM.createRoot(root).render(<App />)
} catch (e) {
  document.body.innerHTML = '<pre style="white-space:pre-wrap;padding:1rem;color:red;font-size:14px;">'
    + e.toString()
    + '</pre>';
  console.error(e);
}
