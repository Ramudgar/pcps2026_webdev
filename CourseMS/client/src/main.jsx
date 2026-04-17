import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Application Entry Point
 * 
 * This file bootstraps the React application by:
 * 1. Creating a root React DOM node
 * 2. Rendering the App component in StrictMode
 * 
 * StrictMode helps detect potential problems during development
 * by double-invoking certain functions and warning about
 * deprecated practices.
 */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
