import React from 'react'
import { getData } from '../mockstore'
import { getRoomMode } from '../utils/storage'

export default function MyWishlist({ demoMode }){
  const room = 'Birthday Party'
  const mode = getRoomMode(room)
  const data = getData()
  const items = demoMode === 'sample' ? data.items : []

  return (
    <section>
      <h2>My Wishlist</h2>
      <div className="wishlist-header">{room} · Visibility: <strong>{mode}</strong></div>
      <div className="items-grid">
        {items.length === 0 ? (
          <div className="item-card" style={{minHeight:160,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>No items yet — use "Add item" to create your first wish.</div>
        ) : (
          items.map(it => (
            <div className="item-card" key={it.name}>
              <div className="item-name">{it.name}</div>
              <div className="item-desc">{it.price}</div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
