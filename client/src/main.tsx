import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  // Note: StrictMode disabled to prevent duplicate API calls in development
  // Re-enable for debugging: <StrictMode><App /></StrictMode>
  <App />
)
