import React, { useMemo, useState } from 'react'
import { getData } from '../mockstore'

const sampleRoomCodes = {
  'birthday-party': 'BIRTHDAY123',
  'secret-santa': 'SANTACODE',
  'family-gifts': 'FAMILY999'
}

export default function RoomLobby({ joinedRooms, onCreateRoom, onJoinRoom, selectedRoom }) {
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')

  const allRooms = useMemo(() => getData().rooms || [], [])

  function handleCreate(e) {
    e.preventDefault()
    if (!roomName.trim()) {
      setMessage('Enter a room name to create.')
      return
    }
    setMessage('')
    onCreateRoom({ name: roomName.trim(), members: 1, admin: true, mode: 'Private', code: roomName.trim().toUpperCase().replace(/\s+/g, '-') })
    setRoomName('')
  }

  function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) {
      setMessage('Enter a room code to join.')
      return
    }
    setMessage('')
    const matched = Object.entries(sampleRoomCodes).find(([, code]) => code.toLowerCase() === joinCode.trim().toLowerCase())
    if (matched) {
      const roomName = matched[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      onJoinRoom(roomName)
      setJoinCode('')
      return
    }
    setMessage('Room code not found. Try one of the sample codes.')
  }

  return (
    <section>
      <h2>Rooms</h2>
      <div className="room-lobby-grid">
        <div className="room-panel">
          <div className="section-title">Joined Rooms</div>
          {joinedRooms.length === 0 ? (
            <div className="room-empty">No rooms joined yet. Create or join one to get started.</div>
          ) : (
            <div className="rooms-list">
              {joinedRooms.map(room => (
                <div key={room.name} className={`room-row ${selectedRoom?.name === room.name ? 'active' : ''}`}>
                  <div>
                    <div className="room-title">{room.name}</div>
                    <div className="room-meta">{room.members} members · {room.mode}</div>
                  </div>
                  {room.admin ? <div className="room-badge mode-shared">Admin</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="room-panel room-actions">
          <div className="section-title">Create a Room</div>
          <form className="room-form" onSubmit={handleCreate}>
            <label>
              Room name
              <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Birthday Party" />
            </label>
            <button type="submit" className="btn-primary">Create room</button>
          </form>

          <div className="section-title" style={{ marginTop: '28px' }}>Join by code</div>
          <form className="room-form" onSubmit={handleJoin}>
            <label>
              Room code
              <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="BIRTHDAY123" />
            </label>
            <button type="submit" className="btn-primary">Join room</button>
          </form>

          <div className="room-code-help">
            <div>Sample codes:</div>
            <ul>
              {Object.values(sampleRoomCodes).map(code => <li key={code}>{code}</li>)}
            </ul>
          </div>

          {message ? <div className="form-error">{message}</div> : null}
        </div>
      </div>
    </section>
  )
}
