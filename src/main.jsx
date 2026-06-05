import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { FiltrosUIProvider } from './context/FiltrosContext.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CarritoProvider>
      <FiltrosUIProvider>
      <App />
      </FiltrosUIProvider>
    </CarritoProvider>
  </StrictMode>,
)
