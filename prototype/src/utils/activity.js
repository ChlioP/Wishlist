import { getUser } from './auth'

const ACT_KEY = 'wishhub_activity_'

function activityKey(email){
  return `${ACT_KEY}${encodeURIComponent(email)}`
}

export function getActivity(){
  try{
    const user = getUser()
    if(!user || !user.email) return []
    const raw = localStorage.getItem(activityKey(user.email))
    return raw ? JSON.parse(raw) : []
  }catch(e){ return [] }
}

export function appendActivity(entry){
  try{
    const user = getUser()
    if(!user || !user.email) return
    const key = activityKey(user.email)
    const raw = localStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    const timestamp = new Date().toISOString()
    arr.push({ ...entry, timestamp })
    localStorage.setItem(key, JSON.stringify(arr))
  }catch(e){}
}

export function formatActivity(entry){
  switch(entry.action){
    case 'add_item':
      return `Added item: ${entry.item || 'Untitled item'}`
    case 'remove_item':
      return `Removed item: ${entry.item || entry.id || 'Unknown item'}`
    case 'edit_item':
      if(entry.change){
        const changeText = Object.entries(entry.change)
          .map(([key, value]) => `${key} → ${value}`)
          .join(', ')
        return `Edited ${entry.item || entry.id || 'item'}${changeText ? ` (${changeText})` : ''}`
      }
      return `Edited item: ${entry.item || entry.id || 'Unknown item'}`
    case 'create_room':
      return `Created room: ${entry.room}`
    case 'join_room':
      return `Joined room: ${entry.room}`
    case 'set_room_mode':
      return `Set ${entry.room} to ${entry.mode} mode`
    default:
      if(entry.room && entry.item){
        return `${entry.action} — ${entry.item} in ${entry.room}`
      }
      if(entry.room){
        return `${entry.action} — ${entry.room}`
      }
      if(entry.item){
        return `${entry.action} — ${entry.item}`
      }
      return entry.action || 'Performed action'
  }
}

export function clearActivity(){
  try{
    const user = getUser()
    if(!user || !user.email) return
    localStorage.removeItem(activityKey(user.email))
  }catch(e){}
}

export default { getActivity, appendActivity, clearActivity }
