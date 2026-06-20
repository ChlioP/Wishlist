import React, { useEffect, useState } from 'react'
import { getRoomMode, setRoomMode } from '../utils/storage'
import { appendActivity } from '../utils/activity'
import { getData } from '../mockstore'

function nextMode(current) {
  const states = ['Private','Shared','Public']
  const i = states.indexOf(current)
  return states[(i + 1) % states.length]
}

export default function Dashboard({ demoMode }){
  const [modes, setModes] = useState({})
  const [rooms, setRooms] = useState([])

  useEffect(()=>{
    const data = getData()
    const roomList = demoMode === 'sample' && Array.isArray(data.rooms) ? data.rooms : []
    setRooms(roomList)
    const initial = {}
    roomList.forEach(r => { if(r && r.name) initial[r.name] = getRoomMode(r.name) })
    setModes(initial)
  },[demoMode])

  function cycle(room){
    const next = nextMode(modes[room] || 'Shared')
    setRoomMode(room,next)
    setModes(s => ({ ...s, [room]: next }))
    appendActivity({ action: 'set_room_mode', room, mode: next })
  }

  return (
    <section>
      <h2>Dashboard</h2>
      <ul className="rooms-list">
        {(Array.isArray(rooms) && rooms.length === 0) ? (
          <li className="room-row" style={{minHeight:72,alignItems:'center',color:'var(--muted)'}}>No rooms yet — create or join a room.</li>
        ) : (
          (Array.isArray(rooms) ? rooms : []).map(r => (
            <li key={r.name} className="room-row">
              <div>
                <div className="room-title">{r.name}</div>
                <div className="room-meta">{r.members} members{r.admin? ' · Admin':''}</div>
              </div>
              <div className="room-controls">
                <button className={`room-mode ${modes[r.name] === 'Private' ? 'mode-private' : modes[r.name] === 'Shared' ? 'mode-shared' : 'mode-public'}`} onClick={() => cycle(r.name)} aria-label={`Toggle privacy for ${r.name}`}>{modes[r.name]}</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
