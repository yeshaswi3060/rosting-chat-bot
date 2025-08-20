import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import StreetRoastBot from './StreetRoastBot.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StreetRoastBot />
    <Analytics />
  </React.StrictMode>,
)
