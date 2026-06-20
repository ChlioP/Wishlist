import React, { useEffect, useState } from 'react'
import { getData, addItem, updateItem, removeItem } from '../mockstore'
import { getRoomMode } from '../utils/storage'
import { appendActivity } from '../utils/activity'
import ActivityFeed from './ActivityFeed'

export default function MyWishlist({ demoMode, selectedRoom }){
  const room = selectedRoom?.name || 'Birthday Party'
  const mode = getRoomMode(room)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', price: '' })
  const [showActivity, setShowActivity] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '' })

  useEffect(() => {
    const data = getData()
    setItems(Array.isArray(data.items) ? data.items : [])
  }, [demoMode])

  function handleAdd(e){
    e.preventDefault()
    if(!form.name.trim()) return
    const created = addItem({ name: form.name.trim(), price: form.price || '', status: 'Available' })
    if(created){
      setItems(prev => [...prev, created])
      appendActivity({ action: 'add_item', item: created.name })
      setForm({ name: '', price: '' })
    }
  }

  function handleDelete(id){
    const toRemove = items.find(it => it.id === id)
    const ok = removeItem(id)
    if(ok){
      setItems(prev => prev.filter(it => it.id !== id))
      appendActivity({ action: 'remove_item', item: toRemove?.name || id })
    }
  }

  function handleToggleStatus(it){
    const next = it.status === 'Available' ? 'Reserved' : it.status === 'Reserved' ? 'Purchased' : 'Available'
    const updated = updateItem(it.id, { status: next })
    if(updated){
      setItems(prev => prev.map(p => p.id === it.id ? updated : p))
      appendActivity({ action: 'edit_item', item: it.name, change: { status: next } })
    }
  }

  function handleEditStart(it){
    setEditingId(it.id)
    setEditForm({ name: it.name, price: it.price || '' })
  }

  function handleEditSave(id){
    const patch = { name: editForm.name.trim(), price: editForm.price }
    const updated = updateItem(id, patch)
    if(updated){
      setItems(prev => prev.map(p => p.id === id ? updated : p))
      appendActivity({ action: 'edit_item', item: updated.name, change: patch })
      setEditingId(null)
      setEditForm({ name: '', price: '' })
    }
  }

  function handleEditCancel(){
    setEditingId(null)
    setEditForm({ name: '', price: '' })
  }

  return (
    <section>
      <h2>My Wishlist</h2>
      <div className="wishlist-header">{room} · Visibility: <strong>{mode}</strong></div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
        <form className="room-form" onSubmit={handleAdd} style={{ marginTop: 12, flex:1 }}>
        <label>
          Item name
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nintendo Switch" />
        </label>
        <label>
          Price
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="$299" />
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn-primary">Add item</button>
        </div>
        </form>

        <div style={{ whiteSpace:'nowrap' }}>
          <button className="signout-btn" onClick={() => setShowActivity(s => !s)}>{showActivity ? 'Hide Activity' : 'View Activity'}</button>
        </div>
      </div>

      <div className="items-grid" style={{ marginTop: 16 }}>
        {items.length === 0 ? (
          <div className="item-card" style={{minHeight:160,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>No items yet — add your first wish.</div>
        ) : (
          items.map(it => (
            <div className="item-card" key={it.id}>
              {editingId === it.id ? (
                <div>
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  <input value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button className="btn-primary" onClick={() => handleEditSave(it.id)}>Save</button>
                    <button className="signout-btn" onClick={handleEditCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="item-name">{it.name}</div>
                  <div className="item-desc">{it.price}</div>
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button className="signout-btn" onClick={() => handleToggleStatus(it)}>{it.status}</button>
                    <button className="signout-btn" onClick={() => handleEditStart(it)}>Edit</button>
                    <button className="signout-btn" onClick={() => handleDelete(it.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {showActivity && <ActivityFeed />}
    </section>
  )
}
