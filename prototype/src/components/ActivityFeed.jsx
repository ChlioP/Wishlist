import React, { useEffect, useState } from 'react'
import { getActivity, clearActivity, formatActivity } from '../utils/activity'

export default function ActivityFeed(){
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const items = getActivity() || []
    items.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
    setEntries(items)
  }, [])

  function handleClear(){
    clearActivity()
    setEntries([])
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3 style={{ margin:0 }}>Activity</h3>
        <button className="signout-btn" onClick={handleClear}>Clear</button>
      </div>
      <div style={{ marginTop:8 }}>
        {entries.length === 0 ? (
          <div style={{ color:'var(--muted)' }}>No activity yet.</div>
        ) : (
          <ul style={{ paddingLeft: 16 }}>
            {entries.map((e, idx) => (
              <li key={idx} style={{ marginBottom:10 }}>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{new Date(e.timestamp).toLocaleString()}</div>
                <div>{formatActivity(e)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
