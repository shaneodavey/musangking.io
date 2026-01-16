import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
} catch (e) {
  document.body.innerHTML = '<pre>' + e.toString() + '</pre>';
  console.error(e);
}
