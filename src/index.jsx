import './styles.css'

import { Leva } from 'leva'
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Leva collapsed />
  </>
)
