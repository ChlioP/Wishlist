export function getRoomModes(){
  try{
    const raw = localStorage.getItem('wishhub_room_modes')
    return raw ? JSON.parse(raw) : {}
  }catch(e){ return {} }
}

export function getRoomMode(room){
  const modes = getRoomModes()
  return modes[room] || 'Shared'
}

export function setRoomMode(room, mode){
  const modes = getRoomModes()
  modes[room] = mode
  localStorage.setItem('wishhub_room_modes', JSON.stringify(modes))
}
