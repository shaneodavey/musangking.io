try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
} catch (e) {
  document.body.innerHTML = '<pre>' + e.toString() + '</pre>';
  console.error(e);
}
