// main.jsx - Punto de entrada de React
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
// Fuentes personalizadas SAT-Digital
import './assets/fonts/fonts.css'
// Variables CSS globales (sistema de diseño centralizado)
import './shared/styles/variables.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)