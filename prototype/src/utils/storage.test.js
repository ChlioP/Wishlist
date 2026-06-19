import { describe, it, expect, beforeEach } from 'vitest'
import { getRoomModes, setRoomMode, getRoomMode } from './storage'

beforeEach(()=>{
  localStorage.clear()
})

describe('storage utils', () => {
  it('returns empty map by default', () => {
    const m = getRoomModes()
    expect(typeof m).toBe('object')
  })

  it('persists and reads a room mode', () => {
    setRoomMode('Test Room', 'Private')
    expect(getRoomMode('Test Room')).toBe('Private')
  })
})
