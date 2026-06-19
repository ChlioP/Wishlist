const DEMO_KEY = 'wishhub_demo_mode'

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
  return getMode() === 'sample' ? sample : { rooms: [], items: [], members: [] }
}

export function reset(){
  try { localStorage.removeItem(DEMO_KEY) } catch(e){}
}
