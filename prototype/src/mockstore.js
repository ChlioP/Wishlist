const DEMO_KEY = 'wishhub_demo_mode'

import { getUser } from './utils/auth'

const sample = {
  rooms: [
    { name: 'Birthday Party', members: 5, admin: true, mode: 'Shared' },
    { name: 'Secret Santa', members: 12, admin: false, mode: 'Private' },
    { name: 'Family Gifts', members: 8, admin: false, mode: 'Public' }
  ],
  items: [
    { name: 'Sony WH-1000XM5', price: '$349', status: 'Reserved' },
    { name: 'The Creative Act', price: '$32', status: 'Available' }
  ],
  members: ['Alice (You)','Bob','Carol','David','Emma']
}

const USER_DATA_KEY = 'wishhub_userdata_'

function userKey(email){
  return `${USER_DATA_KEY}${encodeURIComponent(email)}`
}

export function getMode(){
  try { return localStorage.getItem(DEMO_KEY) || 'empty' } catch(e){ return 'empty' }
}

export function setMode(m){
  try { localStorage.setItem(DEMO_KEY, m) } catch(e){}
}

export function toggleMode(){
  const next = getMode() === 'sample' ? 'empty' : 'sample'
  setMode(next)
  return next
}

export function getData(){
  try{
    const user = getUser()
    if(user && user.email){
      const raw = localStorage.getItem(userKey(user.email))
      if(raw) return JSON.parse(raw)
    }
  }catch(e){}
  return getMode() === 'sample' ? sample : { rooms: [], items: [], members: [] }
}

export function saveUserData(data){
  try{
    const user = getUser()
    if(!user || !user.email) return
    localStorage.setItem(userKey(user.email), JSON.stringify(data))
  }catch(e){}
}

export function addItem(item){
  try{
    const user = getUser()
    if(!user || !user.email) return null
    const key = userKey(user.email)
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : { rooms: [], items: [], members: [] }
    const id = Date.now().toString()
    const nextItem = { ...item, id }
    data.items = Array.isArray(data.items) ? [...data.items, nextItem] : [nextItem]
    localStorage.setItem(key, JSON.stringify(data))
    return nextItem
  }catch(e){ return null }
}

export function updateItem(id, patch){
  try{
    const user = getUser()
    if(!user || !user.email) return null
    const key = userKey(user.email)
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : { rooms: [], items: [], members: [] }
    data.items = (data.items || []).map(it => it.id === id ? { ...it, ...patch } : it)
    localStorage.setItem(key, JSON.stringify(data))
    return data.items.find(it => it.id === id) || null
  }catch(e){ return null }
}

export function removeItem(id){
  try{
    const user = getUser()
    if(!user || !user.email) return false
    const key = userKey(user.email)
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : { rooms: [], items: [], members: [] }
    data.items = (data.items || []).filter(it => it.id !== id)
    localStorage.setItem(key, JSON.stringify(data))
    return true
  }catch(e){ return false }
}

export function reset(){
  try { localStorage.removeItem(DEMO_KEY) } catch(e){}
}
