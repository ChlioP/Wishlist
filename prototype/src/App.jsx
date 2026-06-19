import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import MyWishlist from './components/MyWishlist'
import AdminSettings from './components/AdminSettings'
import { getMode, setMode } from './mockstore'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [demoMode, setDemoMode] = useState(getMode())
  function setDemo(m){ setMode(m); setDemoMode(m) }
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>WishList Hub — Prototype</h1>
        <nav>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
          <button onClick={() => setView('wishlist')}>My Wishlist</button>
          <button onClick={() => setView('admin')}>Admin Settings</button>
          <span style={{marginLeft:12}}>
            <label style={{fontSize:12,marginRight:6}}>Demo:</label>
            <button onClick={() => setDemo('empty')} style={{marginRight:6}}>Empty</button>
            <button onClick={() => setDemo('sample')}>Sample</button>
          </span>
        </nav>
      </header>
      <main>
        {view === 'dashboard' && <Dashboard demoMode={demoMode} />}
        {view === 'wishlist' && <MyWishlist demoMode={demoMode} />}
        {view === 'admin' && <AdminSettings demoMode={demoMode} />}
      </main>
    </div>
  )
}
