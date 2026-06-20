import React, { useEffect, useState } from 'react'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import MyWishlist from './components/MyWishlist'
import AdminSettings from './components/AdminSettings'
import RoomLobby from './components/RoomLobby'
import ActivityFeed from './components/ActivityFeed'
import { getUser, setUser, clearUser } from './utils/auth'
import { getData, saveUserData } from './mockstore'
import { appendActivity } from './utils/activity'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'wishlist', label: 'My Wishlist' },
  { id: 'activity', label: 'Activity' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'settings', label: 'Settings' }
]

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'wishlist', label: 'My Wishlist' },
  { id: 'activity', label: 'Activity' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'notifications', label: 'Notifications', badge: 3 }
]

const pageMeta = {
  dashboard: {
    title: 'Hello,',
    subtitle: "Here's what's happening in your rooms today",
    showAddItem: true
  },
  wishlist: {
    title: 'Your wishlist',
    subtitle: 'Manage your saved gifts and ideas',
    showAddItem: true
  },
  activity: {
    title: 'Activity',
    subtitle: 'Recent actions and changes by you',
    showAddItem: false
  },
  rooms: {
    title: 'Your rooms',
    subtitle: 'View and manage your shared spaces',
    showAddItem: false
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Latest activity across your rooms',
    showAddItem: false
  },
  settings: {
    title: 'Settings',
    subtitle: 'Update your account and preferences',
    showAddItem: false
  }
}

export default function App() {
  const [user, setUserState] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    const stored = getUser()
    if (stored) {
      setUserState(stored)
    }
    const data = getData()
    const initialRooms = Array.isArray(data.rooms) ? data.rooms : []
    setRooms(initialRooms)
    setSelectedRoom(initialRooms[0] || null)
  }, [])

  function handleLogin(profile) {
    setUser(profile)
    setUserState(profile)
  }

  function handleLogout() {
    clearUser()
    setUserState(null)
    setPage('dashboard')
  }

  function handleNav(target) {
    setPage(target)
  }

  function handleCreateRoom(room) {
    setRooms(current => {
      const next = [...current, room]
      if (!selectedRoom) setSelectedRoom(room)
      try{ saveUserData({ rooms: next, items: [], members: [] }) }catch(e){}
      appendActivity({ action: 'create_room', room: room.name })
      return next
    })
    setPage('rooms')
  }

  function handleJoinRoom(roomName) {
    setRooms(current => {
      if (current.some(r => r.name === roomName)) return current
      const next = [...current, { name: roomName, members: 1, admin: false, mode: 'Private', code: roomName.toUpperCase().replace(/\s+/g, '-') }]
      try{ saveUserData({ rooms: next, items: [], members: [] }) }catch(e){}
      appendActivity({ action: 'join_room', room: roomName })
      return next
    })
    setSelectedRoom(prev => prev || rooms[0])
    setPage('rooms')
  }

  function handleRoomSelect(roomName) {
    const room = rooms.find(r => r.name === roomName)
    if (room) {
      setSelectedRoom(room)
      setPage('dashboard')
    }
  }

  function handleAction(action) {
    if (action === 'add-item') {
      alert('Add Item clicked')
      return
    }
    setPage(action)
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  const meta = pageMeta[page]
  const activeRoom = selectedRoom || rooms[0] || { name: 'No room selected' }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="logo">
          <span className="logo-dot" />
          WishList Hub
        </div>

        <div className="nav-pills">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-pill ${page === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
          <button type="button" className="signout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="body-layout">
        <aside className="sidebar">
          <div className="sidebar-label">Menu</div>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-item ${page === item.id ? 'active' : ''}`}
              onClick={() => handleAction(item.id)}
            >
              {item.label}
              {item.badge ? <span className="badge">{item.badge}</span> : null}
            </button>
          ))}

          <div className="sidebar-label" style={{ marginTop: 16 }}>My Rooms</div>
          {rooms.map(room => (
            <button
              key={room.name}
              type="button"
              className={`room-badge ${activeRoom.name === room.name ? 'active' : ''}`}
              onClick={() => handleRoomSelect(room.name)}
            >
              <span className="room-dot" style={{ background: room.color || '#E1D3F9' }} />
              {room.name}
            </button>
          ))}
          <div className="sidebar-spacer" />
          <button type="button" className="sidebar-item join-room" onClick={() => setPage('rooms')}>
            + Join a Room
          </button>
        </aside>

        <main className="main">
          <div className="page-header">
            <div>
              <div className="page-title">{meta.title} {user.name.split(' ')[0]}</div>
              <div className="page-sub">{meta.subtitle}</div>
            </div>
            {meta.showAddItem ? (
              <button type="button" className="btn-primary" onClick={() => handleAction('add-item')}>
                + Add Item
              </button>
            ) : null}
          </div>

          {page === 'dashboard' && (
            <Dashboard activeRoom={activeRoom} notifications={[]} />
          )}

          {page === 'wishlist' && (
            <MyWishlist demoMode="sample" selectedRoom={activeRoom} />
          )}

          {page === 'rooms' && (
            <RoomLobby
              joinedRooms={rooms}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              selectedRoom={activeRoom}
            />
          )}

          {page === 'settings' && (
            <AdminSettings demoMode="sample" />
          )}

          {page === 'activity' && (
            <div className="page-panel active">
              <ActivityFeed />
            </div>
          )}

          {page === 'notifications' && (
            <div className="page-panel active">
              <div className="section-title">Notifications</div>
              <div className="notif-panel">
                <div className="notif-row">No new notifications yet.</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
