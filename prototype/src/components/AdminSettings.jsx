import React, { useEffect, useState } from 'react'
import { getRoomMode, setRoomMode } from '../utils/storage'
import { appendActivity } from '../utils/activity'
import { getData } from '../mockstore'

const modes = ['Private','Shared','Public']

export default function AdminSettings({ demoMode }){
  const room = 'Birthday Party'
  const data = getData()
  const members = demoMode === 'sample' ? data.members : []
  const [selected, setSelected] = useState(getRoomMode(room))
  const [visibility, setVisibility] = useState(() => (members || []).reduce((acc,m)=>{ acc[m]=true; return acc },{}))

  useEffect(()=>{ setSelected(getRoomMode(room)) }, [])

  function activate(mode){
    setSelected(mode)
    setRoomMode(room, mode)
    appendActivity({ action: 'set_room_mode', room, mode })
  }

  function toggleMember(name){
    setVisibility(v => ({ ...v, [name]: !v[name] }))
  }

  return (
    <section>
      <h2>Admin — {room}</h2>
      <div className="mode-grid">
        {modes.map(m => (
          <button key={m} className={`mode-card ${selected===m? 'selected':''}`} onClick={() => activate(m)}>{m}</button>
        ))}
      </div>

      <h3 style={{marginTop:20}}>Members</h3>
      <div className="member-list">
        {(!members || members.length === 0) ? (
          <div className="member-row" style={{minHeight:72,alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>No members yet — invite people using the code below.</div>
        ) : (
          members.map(m => (
            <div key={m} className="member-row">
              <div>{m}</div>
              <button onClick={() => toggleMember(m)} className={`toggle ${visibility[m] ? 'on' : 'off'}`}>{visibility[m]? 'Visible':'Hidden'}</button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
