const USER_KEY = 'wishhub_user'

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function setUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (e) {}
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (e) {}
}
