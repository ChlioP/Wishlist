import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

function mountApp(){
	const el = document.getElementById('root')
	if(!el) return
	const root = createRoot(el)
	root.render(<App />)
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mountApp, { once: true })
} else {
	mountApp()
}
