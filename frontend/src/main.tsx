import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ExchangeRateProvider } from './context/ExchangeRateContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ExchangeRateProvider>
        <App />
      </ExchangeRateProvider>
    </BrowserRouter>
  </StrictMode>,
)
